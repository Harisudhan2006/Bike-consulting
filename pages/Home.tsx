import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AppStep, UserPreferences, BikeRecommendation, Question } from '../types';
import { QUESTIONS } from '../constants';

export default function Home() {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [recommendation, setRecommendation] = useState<BikeRecommendation | null>(null);

  const handleStart = async () => {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (hasKey) {
        setStep(AppStep.QUIZ);
      } else {
        setStep(AppStep.API_KEY);
      }
    } catch (e) {
      console.error("Error checking API key status", e);
      setStep(AppStep.QUIZ);
    }
  };

  const handleApiKeySelected = () => {
    setStep(AppStep.QUIZ);
  };

  const handleAnswer = (key: keyof UserPreferences, value: string) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setStep(AppStep.LOADING);
      fetchRecommendation(newPrefs as UserPreferences);
    }
  };

  const fetchRecommendation = async (prefs: UserPreferences) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const getLabel = (qIdx: number, val: string) =>
        QUESTIONS[qIdx].options.find(o => o.id === val)?.label || val;

      const getDesc = (qIdx: number, val: string) =>
        QUESTIONS[qIdx].options.find(o => o.id === val)?.value || "";

      const prompt = `
        Act as an expert motorcycle consultant for a first-time buyer.
        Based on the following user profile, recommend the single best motorcycle model.
        
        User Profile:
        - Experience: ${getLabel(0, prefs.experience)} (${getDesc(0, prefs.experience)})
        - Purpose: ${getLabel(1, prefs.purpose)} (${getDesc(1, prefs.purpose)})
        - Budget: ${getLabel(2, prefs.budget)} (${getDesc(2, prefs.budget)})
        - Vibe: ${getLabel(3, prefs.vibe)} (${getDesc(3, prefs.vibe)})

        Strict Requirements:
        1. Recommend exactly ONE specific bike model currently available (e.g. "Honda Rebel 500", "Kawasaki Ninja 400"). 
        2. Do NOT provide a list.
        3. The tone must be reassuring, clear, and non-technical. Like a knowledgeable friend.
      `;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a helpful, clear, and opinionated motorcycle advisor. You help beginners avoid confusion by giving one strong recommendation.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bikeName: { type: Type.STRING, description: "The specific make and model." },
              tagline: { type: Type.STRING, description: "A catchy, reassuring 5-10 word headline." },
              summary: { type: Type.STRING, description: "2-3 sentences explaining exactly why this is the one." },
              whyItFits: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 short, punchy bullet points on why it fits their specific needs."
              },
              whoNotFor: { type: Type.STRING, description: "One sentence explaining who should NOT buy this (honesty builds trust)." }
            },
            required: ["bikeName", "tagline", "summary", "whyItFits", "whoNotFor"]
          }
        }
      });

      const text = textResponse.text;
      if (!text) throw new Error("Empty response from AI");

      const rec: BikeRecommendation = JSON.parse(text);
      rec.isGeneratingVideo = true;

      setRecommendation(rec);
      setStep(AppStep.RESULT);

      generateVideo(ai, rec.bikeName);

    } catch (e) {
      console.error(e);
      setStep(AppStep.ERROR);
    }
  };

  const generateVideo = async (ai: GoogleGenAI, bikeName: string) => {
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic 360 degree turntable shot of a ${bikeName} motorcycle, studio lighting, white background, 4k high detailed 3d render style`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoRes.blob();
        const videoUrl = URL.createObjectURL(blob);

        setRecommendation(prev => prev ? { ...prev, videoUri: videoUrl, isGeneratingVideo: false } : null);
      } else {
        console.error("No video URI in response");
        setRecommendation(prev => prev ? { ...prev, isGeneratingVideo: false } : null);
      }
    } catch (e: any) {
      console.error("Video generation failed", e);
      if (e.message && e.message.includes("Requested entity was not found")) {
        console.warn("API Key invalid for Veo");
      }
      setRecommendation(prev => prev ? { ...prev, isGeneratingVideo: false } : null);
    }
  };

  const handleRestart = () => {
    setPreferences({});
    setCurrentQuestionIdx(0);
    setRecommendation(null);
    setStep(AppStep.WELCOME);
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4">
      {/* Main App Container with Gradient */}
      <div className="w-full max-w-md bg-gradient-to-br from-indigo-800 via-purple-700 to-teal-500 rounded-3xl shadow-2xl overflow-hidden min-h-[750px] flex flex-col relative text-white">

        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg leading-none tracking-tight">BikeSpace</span>
              <span className="text-[10px] bg-pink-500 px-1 rounded w-fit font-bold uppercase mt-0.5">Beta</span>
            </div>
          </div>

          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>

        {/* Progress Dots for Quiz */}
        {step === AppStep.QUIZ && (
          <div className="flex justify-center gap-2 mb-4">
            {QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentQuestionIdx ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
              />
            ))}
          </div>
        )}

        <main className="flex-1 px-6 pb-6 flex flex-col relative z-10">
          {step === AppStep.WELCOME && <WelcomeView onStart={handleStart} />}
          {step === AppStep.API_KEY && <ApiKeyView onKeySelected={handleApiKeySelected} />}
          {step === AppStep.QUIZ && (
            <QuizView
              question={QUESTIONS[currentQuestionIdx]}
              onAnswer={(val) => handleAnswer(QUESTIONS[currentQuestionIdx].key, val)}
            />
          )}
          {step === AppStep.LOADING && <LoadingView />}
          {step === AppStep.RESULT && recommendation && (
            <ResultView recommendation={recommendation} onRestart={handleRestart} />
          )}
          {step === AppStep.ERROR && <ErrorView onRestart={handleRestart} />}
        </main>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>

      </div>
    </div>
  );
}

// --- Subcomponents ---

function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col h-full items-center text-center animate-fade-in pt-10">

      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase leading-tight tracking-tight mb-2 drop-shadow-lg">
          Just Answer <br /> A Few Questions!
        </h1>
        <p className="text-lg text-white/80 font-medium">
          And Find your perfect Motorcycle
        </p>
      </div>

      {/* Primary Action Button - Teal Pill with Shadow */}
      <button
        onClick={onStart}
        className="group relative w-full max-w-xs"
      >
        <div className="absolute inset-0 bg-teal-700 rounded-full translate-y-1.5"></div>
        <div className="relative bg-teal-400 hover:bg-teal-300 text-indigo-900 text-xl font-black uppercase py-4 px-8 rounded-full transition-transform active:translate-y-1.5 flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M13.13 22.19l-1.63-3.83c-.09-.21-.3-.34-.52-.34H7.55c-.56 0-.83-.69-.42-1.07l2.84-2.61c.15-.14.21-.35.15-.55l-.94-4.14c-.13-.56.49-1.01.97-.71l3.58 2.2c.19.12.42.12.61 0l3.58-2.2c.48-.3.1.15.97.71l-.94 4.14c-.05.2.01.41.15.55l2.84 2.61c.41.38.14 1.07-.42 1.07h-3.43c-.23 0-.44.13-.52.34l-1.63 3.83c-.2.48-.89.48-1.09 0zM12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1-3-7z" fill="none" /><path d="M4 11l5-5 5 5M4 15l5-5 5 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          START
        </div>
      </button>

      {/* Astronaut / Rider Illustration */}
      <div className="mt-auto mb-[-20px] w-64 h-64 opacity-90">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Simplified Astronaut/Rider Line Art */}
            <path d="M100 60 C 100 40, 130 40, 130 60 C 130 80, 100 80, 100 60 Z" /> {/* Helmet visor */}
            <circle cx="115" cy="60" r="25" strokeWidth="3" /> {/* Helmet */}
            <path d="M90 85 L 70 100 L 60 140 L 50 160" /> {/* Left arm */}
            <path d="M140 85 L 160 100 L 170 140 L 180 160" /> {/* Right arm */}
            <rect x="80" y="90" width="70" height="60" rx="10" /> {/* Body */}
            <path d="M90 150 L 85 180 L 75 200" /> {/* Left Leg */}
            <path d="M140 150 L 145 180 L 155 200" /> {/* Right Leg */}
            <path d="M50 190 Q 115 170 180 190" strokeDasharray="5,5" /> {/* Ground */}

            {/* Floating Elements */}
            <circle cx="40" cy="50" r="2" fill="currentColor" />
            <circle cx="180" cy="40" r="3" fill="currentColor" />
            <path d="M30 140 Q 40 130 30 120" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function ApiKeyView({ onKeySelected }: { onKeySelected: () => void }) {
  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      onKeySelected();
    } catch (e) {
      console.error("Failed to select key", e);
    }
  };

  return (
    <div className="flex flex-col h-full justify-center items-center text-center animate-fade-in space-y-8">
      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white mb-2 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      </div>
      <div>
        <h2 className="text-3xl font-black text-white mb-4">ACCESS REQUIRED</h2>
        <p className="text-white/80 max-w-xs mx-auto text-lg">
          To generate the 3D bike preview, you need to select a paid API key.
        </p>
      </div>

      <button
        onClick={handleSelectKey}
        className="group relative w-full max-w-xs"
      >
        <div className="absolute inset-0 bg-purple-800 rounded-full translate-y-1.5"></div>
        <div className="relative bg-purple-600 hover:bg-purple-500 text-white text-lg font-bold uppercase py-4 px-8 rounded-full transition-transform active:translate-y-1.5">
          Select API Key
        </div>
      </button>
    </div>
  )
}

function QuizView({ question, onAnswer }: { question: Question, onAnswer: (val: string) => void }) {
  return (
    <div className="flex flex-col h-full animate-fade-in pt-4">
      <div className="flex-1">
        <h2 className="text-3xl font-black text-white mb-3 leading-tight drop-shadow-sm">{question.text}</h2>
        {question.description && (
          <p className="text-white/70 mb-8 font-medium">{question.description}</p>
        )}
        {!question.description && <div className="mb-8" />}

        <div className="space-y-4">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              className="group relative w-full text-left"
            >
              {/* Button Shadow/Depth */}
              <div className="absolute inset-0 bg-indigo-900/50 rounded-2xl translate-y-1"></div>

              {/* Button Face - Purple Pill Style */}
              <div className="relative w-full bg-purple-700/80 hover:bg-purple-600 backdrop-blur-md border border-purple-500/30 p-5 rounded-2xl transition-all active:translate-y-1 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-lg">{option.label}</div>
                  <div className="text-sm text-purple-200 mt-0.5">{option.value}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-8 border-white/10 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-teal-400 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        </div>
      </div>
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Analysing...</h3>
      <p className="text-white/70 font-medium">Finding your perfect match</p>
    </div>
  );
}

function ResultView({ recommendation, onRestart }: { recommendation: BikeRecommendation, onRestart: () => void }) {
  return (
    <div className="flex flex-col h-full animate-fade-in pb-4">
      <div className="flex-1 overflow-y-auto -mx-6 px-6 no-scrollbar">
        <div className="mb-6 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-teal-400 text-indigo-900 text-xs font-black tracking-wider uppercase mb-4 shadow-lg">
            Your Perfect Bike
          </span>
          <h1 className="text-4xl font-black text-white leading-none mb-3 drop-shadow-lg">
            {recommendation.bikeName}
          </h1>
          <p className="text-teal-300 font-bold text-lg mb-6 tracking-wide">
            {recommendation.tagline}
          </p>

          <div className="mb-6 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-black/40 backdrop-blur-sm min-h-[220px] relative flex items-center justify-center">
            {recommendation.videoUri ? (
              <video
                src={recommendation.videoUri}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
              />
            ) : (
              <div className="text-center p-6">
                {recommendation.isGeneratingVideo ? (
                  <>
                    <div className="w-10 h-10 border-4 border-white/20 border-t-teal-400 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-white font-bold text-sm">RENDERING 3D MODEL</p>
                    <p className="text-white/50 text-xs mt-1">Please wait...</p>
                  </>
                ) : (
                  <p className="text-white/40 text-sm font-medium">PREVIEW UNAVAILABLE</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <p className="text-white text-lg leading-relaxed font-medium">
              {recommendation.summary}
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-6">
            <h3 className="text-sm font-black text-teal-400 uppercase tracking-widest mb-4">Why it fits you</h3>
            <ul className="space-y-4">
              {recommendation.whyItFits.map((reason, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 min-w-[24px] h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span className="text-white/90 font-medium">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Honest Advice</p>
          <p className="text-white/60 text-sm italic">
            "Not for: {recommendation.whoNotFor}"
          </p>
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <button
          onClick={onRestart}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-2xl transition-colors backdrop-blur-md border border-white/10"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

function ErrorView({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center animate-fade-in px-4">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 mb-6 border border-red-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      </div>
      <h3 className="text-2xl font-black text-white mb-2">CONNECTION ERROR</h3>
      <p className="text-white/60 mb-8 font-medium">We couldn't reach the engine.</p>
      <button
        onClick={onRestart}
        className="w-full bg-white text-indigo-900 font-black py-4 px-6 rounded-full hover:scale-105 transition-transform"
      >
        TRY AGAIN
      </button>
    </div>
  );
}
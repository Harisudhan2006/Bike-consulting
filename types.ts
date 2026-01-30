export enum AppStep {
  WELCOME = 'WELCOME',
  API_KEY = 'API_KEY',
  QUIZ = 'QUIZ',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: number;
  text: string;
  description?: string;
  options: QuestionOption[];
  key: keyof UserPreferences;
}

export interface UserPreferences {
  experience: string;
  purpose: string;
  budget: string;
  vibe: string;
}

export interface BikeRecommendation {
  bikeName: string;
  tagline: string;
  summary: string;
  whyItFits: string[];
  whoNotFor: string;
  videoUri?: string;
  isGeneratingVideo?: boolean;
}
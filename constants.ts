import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    key: 'experience',
    text: "What's your riding experience?",
    description: "Be honest—it keeps you safe.",
    options: [
      { id: 'none', label: "Total Beginner", value: "I've never ridden a motorcycle." },
      { id: 'course', label: "Fresh License", value: "Just finished my MSF/Safety course." },
      { id: 'dirt', label: "Dirt/Off-road", value: "I ride dirt bikes, but new to street." },
      { id: 'return', label: "Returning Rider", value: "Used to ride years ago." },
    ],
  },
  {
    id: 2,
    key: 'purpose',
    text: "How will you use the bike primarily?",
    options: [
      { id: 'commute', label: "City Commuting", value: "Short trips, traffic, work." },
      { id: 'weekend', label: "Weekend Fun", value: "Backroads and sunny Sundays." },
      { id: 'trip', label: "Long Distance", value: "Highways and multi-hour trips." },
      { id: 'mix', label: "A Bit of Everything", value: "Balanced mix of city and highway." },
    ],
  },
  {
    id: 3,
    key: 'budget',
    text: "What is your rough budget?",
    description: "Think about the bike only (gear is extra).",
    options: [
      { id: 'low', label: "Budget Friendly", value: "Under $5,000" },
      { id: 'mid', label: "Mid-Range", value: "$5,000 - $9,000" },
      { id: 'high', label: "Premium", value: "$10,000+" },
      { id: 'flex', label: "Flexible", value: "Value matters more than price." },
    ],
  },
  {
    id: 4,
    key: 'vibe',
    text: "What feels right to you?",
    options: [
      { id: 'classic', label: "Classic & Cool", value: "Retro style, relaxed tech." },
      { id: 'sport', label: "Sporty & Sharp", value: "Aggressive looks, precise handling." },
      { id: 'adv', label: "Adventure Ready", value: "Tall, rugged, go-anywhere." },
      { id: 'chill', label: "Low & Relaxed", value: "Cruiser style, feet forward." },
    ],
  },
];
export interface SettingsData {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  rounds: number;
  voiceGuidance: boolean;
  chimeSound: boolean;
}

export type Phase = 'ready' | 'prep' | 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'complete';

export type TabType = 'presets' | 'customize' | 'todo' | 'stats';

export type PageType = 'breathe' | 'tasks' | 'timers' | 'stopwatches' | 'journal';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface MindfulTimer {
  id: string;
  label: string;
  totalDuration: number;
  timeRemaining: number;
  isRunning: boolean;
}

export interface MindfulStopwatch {
  id: string;
  label: string;
  elapsedSeconds: number;
  isRunning: boolean;
  laps: number[];
}

export interface Technique {
  name: string;
  sanskrit: string;
  desc: string;
  icon: any; // Can be string or React Component
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  rounds: number;
  category: 'Calm' | 'Energy' | 'Sleep' | 'Balance';
  customInstruction?: {
    inhale: string;
    hold1: string;
    exhale: string;
    hold2: string;
  };
}

export interface BreathingStats {
  totalSessions: number;
  totalSeconds: number;
  streak: number;
  lastDate: string;
  history: Array<{
    date: string;
    duration: number;
    technique: string;
    rounds: number;
  }>;
}

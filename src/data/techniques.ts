import { Wind, Moon, Heart, Activity, Flame, Snowflake, Brain } from 'lucide-react';
import { Technique } from '../types';

export const presets: Technique[] = [
  { 
    name: 'Box Breathing', 
    sanskrit: 'Sama Vritti', 
    desc: 'Clear stress, focus attention, and stabilize heart rate variability.', 
    icon: Wind, 
    inhale: 4, 
    hold1: 4, 
    exhale: 4, 
    hold2: 4, 
    rounds: 4, 
    category: 'Balance' 
  },
  { 
    name: '4-7-8 Sleep Method', 
    sanskrit: 'Nadi Shodhana Variant', 
    desc: 'Highly calming. Natural nervous system tranquilizer to guide you into deep sleep.', 
    icon: Moon, 
    inhale: 4, 
    hold1: 7, 
    exhale: 8, 
    hold2: 0, 
    rounds: 4, 
    category: 'Sleep' 
  },
  { 
    name: 'Humming Bee Breath', 
    sanskrit: 'Bhramari', 
    desc: 'Calms active brain hums, relieves tension, and boosts nitric oxide production.', 
    icon: Heart, 
    inhale: 4, 
    hold1: 0, 
    exhale: 8, 
    hold2: 0, 
    rounds: 5, 
    category: 'Calm', 
    customInstruction: { inhale: 'Close ears, inhale fully', hold1: '', exhale: 'Hum gently like a bee', hold2: '' } 
  },
  { 
    name: 'Resonant Breathing', 
    sanskrit: 'Coherent Breath', 
    desc: 'Optimizes HRV biofeedback, lowers blood pressure, and harmonizes nervous system.', 
    icon: Activity, 
    inhale: 5, 
    hold1: 0, 
    exhale: 5, 
    hold2: 0, 
    rounds: 6, 
    category: 'Balance' 
  },
  { 
    name: 'Bellows Breath', 
    sanskrit: 'Bhastrika', 
    desc: 'Rapid breathing pattern to supercharge body energy and focus.', 
    icon: Flame, 
    inhale: 2, 
    hold1: 0, 
    exhale: 2, 
    hold2: 0, 
    rounds: 10, 
    category: 'Energy', 
    customInstruction: { inhale: 'Forceful chest inhale', hold1: '', exhale: 'Forceful swift exhale', hold2: '' } 
  },
  { 
    name: 'Cooling Breath', 
    sanskrit: 'Sheetali', 
    desc: 'Lowers body temperature and calms mental agitation.', 
    icon: Snowflake, 
    inhale: 4, 
    hold1: 4, 
    exhale: 6, 
    hold2: 0, 
    rounds: 6, 
    category: 'Calm', 
    customInstruction: { inhale: 'Inhale through rolled tongue', hold1: 'Close mouth, hold air', exhale: 'Exhale softly through nose', hold2: '' } 
  },
  { 
    name: 'Alternate Nostril', 
    sanskrit: 'Nadi Shodhana', 
    desc: 'Balances left/right brain energy hemispheres, bringing mental clarity.', 
    icon: Brain, 
    inhale: 4, 
    hold1: 4, 
    exhale: 4, 
    hold2: 0, 
    rounds: 6, 
    category: 'Balance', 
    customInstruction: { inhale: 'Inhale left (block right)', hold1: 'Hold both nostrils closed', exhale: 'Exhale right (block left)', hold2: '' } 
  },
];

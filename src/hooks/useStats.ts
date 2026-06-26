import { useState } from 'react';
import { BreathingStats } from '../types';

export function useStats() {
  const [stats, setStats] = useState<BreathingStats>(() => {
    const saved = localStorage.getItem('pranayamaStats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stats', e);
      }
    }
    return { totalSessions: 0, totalSeconds: 0, streak: 0, lastDate: '', history: [] };
  });

  const logPracticeSession = (dur: number, tech: string, rounds: number) => {
    if (dur <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => {
      let streak = prev.streak;
      if (!prev.lastDate) {
        streak = 1;
      } else {
        const diff = Math.abs(new Date(today).getTime() - new Date(prev.lastDate).getTime());
        const days = Math.ceil(diff / 86400000);
        if (days === 1) {
          streak += 1;
        } else if (days > 1) {
          // If they missed a day, reset streak to 1
          streak = 1;
        }
      }
      
      const newStats: BreathingStats = {
        totalSessions: prev.totalSessions + 1,
        totalSeconds: prev.totalSeconds + dur,
        streak,
        lastDate: today,
        history: [{ date: today, duration: dur, technique: tech, rounds }, ...prev.history].slice(0, 50)
      };
      localStorage.setItem('pranayamaStats', JSON.stringify(newStats));
      return newStats;
    });
  };

  return { stats, logPracticeSession };
}

import { useState, useEffect, useRef } from 'react';
import { Phase, SettingsData } from '../types';

interface UseBreathingEngineProps {
  settings: SettingsData;
  selectedPreset: string;
  logPracticeSession: (dur: number, tech: string, rounds: number) => void;
  playChime: (phase: Phase, chimeSoundEnabled: boolean) => void;
  announcePhase: (p: Phase, voiceGuidanceEnabled: boolean) => void;
  speak: (text: string, voiceGuidanceEnabled: boolean) => void;
}

export function useBreathingEngine({
  settings,
  selectedPreset,
  logPracticeSession,
  playChime,
  announcePhase,
  speak,
}: UseBreathingEngineProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phaseKey, setPhaseKey] = useState(0);

  const timerIntervalRef = useRef<number | null>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStartPause = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }

    if (isRunning) {
      setIsRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      setIsRunning(true);
      if (phase === 'ready' || phase === 'complete') {
        startPrepPhase();
      } else {
        resumeTimer();
      }
    }
  };

  const startPrepPhase = () => {
    setPhase('prep');
    setTimeRemaining(2);
    speak('Prepare yourself', settings.voiceGuidance);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          setCurrentRound(1);
          playChime('prep', settings.chimeSound);
          setTimeout(() => transitionToPhase('inhale', 1), 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resumeTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          handlePhaseCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const transitionToPhase = (next: Phase, targetRound: number) => {
    const active = settingsRef.current;
    if (next !== 'complete' && next !== 'ready' && next !== 'prep') {
      const key = next === 'hold1' ? 'hold1' : next === 'hold2' ? 'hold2' : next;
      const dur = active[key as keyof SettingsData] as number;
      if (dur <= 0) {
        skipToNext(next, targetRound);
        return;
      }
      setTimeRemaining(dur);
      announcePhase(next, settings.voiceGuidance);
    }

    setPhase(next);
    setPhaseKey(prev => prev + 1);

    if (next !== 'complete' && next !== 'ready' && next !== 'prep') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            timerIntervalRef.current = null;
            handlePhaseCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const skipToNext = (current: Phase, targetRound: number) => {
    if (current === 'inhale') transitionToPhase('hold1', targetRound);
    else if (current === 'hold1') transitionToPhase('exhale', targetRound);
    else if (current === 'exhale') transitionToPhase('hold2', targetRound);
    else if (current === 'hold2') evaluateNextRound(targetRound);
  };

  const handlePhaseCompletion = () => {
    setCurrentRound(round => {
      setPhase(current => {
        if (current === 'prep') {
          setCurrentRound(1);
          playChime('prep', settings.chimeSound);
          setTimeout(() => transitionToPhase('inhale', 1), 600);
        } else if (current === 'inhale') {
          transitionToPhase('hold1', round);
        } else if (current === 'hold1') {
          transitionToPhase('exhale', round);
        } else if (current === 'exhale') {
          transitionToPhase('hold2', round);
        } else if (current === 'hold2') {
          evaluateNextRound(round);
        }
        return current;
      });
      return round;
    });
  };

  const evaluateNextRound = (completedRound: number) => {
    const active = settingsRef.current;
    if (active.rounds > 0 && completedRound >= active.rounds) {
      setIsRunning(false);
      setPhase('complete');
      speak('Session complete', settings.voiceGuidance);
      playChime('complete', settings.chimeSound);
      logPracticeSession(
        active.rounds * (active.inhale + active.hold1 + active.exhale + active.hold2),
        selectedPreset,
        active.rounds
      );
    } else {
      const next = completedRound + 1;
      setCurrentRound(next);
      playChime('inhale', settings.chimeSound);
      setTimeout(() => transitionToPhase('inhale', next), 500);
    }
  };

  const handleReset = () => {
    const completed = currentRound - 1;
    if (completed > 0 && isRunning) {
      logPracticeSession(
        completed * (settings.inhale + settings.hold1 + settings.exhale + settings.hold2),
        selectedPreset,
        completed
      );
    }
    setIsRunning(false);
    setPhase('ready');
    setCurrentRound(1);
    setTimeRemaining(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const handleSkipPhase = () => {
    if (!isRunning || phase === 'ready' || phase === 'prep' || phase === 'complete') return;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    handlePhaseCompletion();
  };

  return {
    phase,
    setPhase,
    isRunning,
    setIsRunning,
    currentRound,
    setCurrentRound,
    timeRemaining,
    setTimeRemaining,
    phaseKey,
    setPhaseKey,
    handleStartPause,
    handleReset,
    handleSkipPhase,
  };
}

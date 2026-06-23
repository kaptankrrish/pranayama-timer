import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Compass, Brain, Moon, Wind, Flame, Snowflake, 
  Activity, Volume2, VolumeX, Trophy, Calendar, Zap, Eye, EyeOff, 
  ChevronRight, Info, Heart, Award, Clock, Plus, Trash2, X
} from 'lucide-react';
import './App.css';

interface SettingsData {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  rounds: number;
  voiceGuidance: boolean;
  chimeSound: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  inhale: 4, hold1: 4, exhale: 4, hold2: 4, rounds: 4,
  voiceGuidance: true, chimeSound: true,
};

type Phase = 'ready' | 'prep' | 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'complete';
type TabType = 'presets' | 'customize' | 'stats';

interface Technique {
  name: string;
  sanskrit: string;
  desc: string;
  icon: any;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  rounds: number;
  category: 'Calm' | 'Energy' | 'Sleep' | 'Balance';
  customInstruction?: { inhale: string; hold1: string; exhale: string; hold2: string; };
}

interface BreathingStats {
  totalSessions: number;
  totalSeconds: number;
  streak: number;
  lastDate: string;
  history: Array<{ date: string; duration: number; technique: string; rounds: number }>;
}

class AmbientSynth {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  noiseSource: AudioBufferSourceNode | null = null;
  oceanFilter: BiquadFilterNode | null = null;
  oceanLFO: OscillatorNode | null = null;
  padOscs: OscillatorNode[] = [];
  padGains: GainNode[] = [];
  padFilter: BiquadFilterNode | null = null;
  padLFO: OscillatorNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(vol: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  stopAll() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.padOscs.forEach(o => { try { o.stop(now + 0.2); } catch(e) {} });
    this.padOscs = [];
    this.padGains = [];
    if (this.noiseSource) { try { this.noiseSource.stop(now + 0.2); } catch(e) {} this.noiseSource = null; }
    if (this.oceanLFO) { try { this.oceanLFO.stop(now + 0.2); } catch(e) {} this.oceanLFO = null; }
    if (this.padLFO) { try { this.padLFO.stop(now + 0.2); } catch(e) {} this.padLFO = null; }
  }

  playOcean(volume: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.stopAll();
    this.setVolume(volume);
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(2.2, now);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, now);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(320, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noise.connect(filter);
    filter.connect(this.masterGain);
    filter.frequency.setValueAtTime(450, now);
    lfo.start(now);
    noise.start(now);
    this.noiseSource = noise;
    this.oceanFilter = filter;
    this.oceanLFO = lfo;
  }

  playCosmos(volume: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.stopAll();
    this.setVolume(volume);
    const now = this.ctx.currentTime;
    const baseFreq = 73.42;
    const overtones = [1.0, 1.5, 2.0, 2.66, 3.0, 4.0];
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.Q.setValueAtTime(1.8, now);
    filter.connect(this.masterGain);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.05, now);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);
    overtones.forEach((ratio, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
      gainNode.gain.setValueAtTime(0.05 / overtones.length, now);
      osc.connect(gainNode);
      gainNode.connect(filter);
      osc.start(now);
      this.padOscs.push(osc);
      this.padGains.push(gainNode);
    });
    this.padFilter = filter;
    this.padLFO = lfo;
  }
}

export default function App() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<Phase>('ready');
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<string>('Box Breathing');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [selectedSound, setSelectedSound] = useState<string>('none');
  const [audioVolume, setAudioVolume] = useState<number>(0.3);

  const [formInhale, setFormInhale] = useState(4);
  const [formHold1, setFormHold1] = useState(4);
  const [formExhale, setFormExhale] = useState(4);
  const [formHold2, setFormHold2] = useState(4);
  const [formRounds, setFormRounds] = useState(4);
  const [formVoice, setFormVoice] = useState(true);
  const [formChime, setFormChime] = useState(true);

  const [stats, setStats] = useState<BreathingStats>({
    totalSessions: 0, totalSeconds: 0, streak: 0, lastDate: '', history: []
  });
  const [customPresets, setCustomPresets] = useState<Technique[]>([]);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetSanskrit, setNewPresetSanskrit] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<'Calm' | 'Energy' | 'Sleep' | 'Balance'>('Calm');
  const [newPresetInhale, setNewPresetInhale] = useState(4);
  const [newPresetHold1, setNewPresetHold1] = useState(4);
  const [newPresetExhale, setNewPresetExhale] = useState(4);
  const [newPresetHold2, setNewPresetHold2] = useState(4);
  const [newPresetRounds, setNewPresetRounds] = useState(4);

  const [phaseKey, setPhaseKey] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const settingsRef = useRef(settings);
  const synthRef = useRef<AmbientSynth | null>(null);

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => {
    const saved = localStorage.getItem('pranayamaSettingsReact');
    if (saved) {
      try { const p = JSON.parse(saved) as SettingsData; const l = { ...DEFAULT_SETTINGS, ...p }; setSettings(l); syncForm(l); } catch(e) {}
    } else { syncForm(DEFAULT_SETTINGS); }
    const savedStats = localStorage.getItem('pranayamaStats');
    if (savedStats) { try { setStats(JSON.parse(savedStats)); } catch(e) {} }
    const savedCustom = localStorage.getItem('pranayamaCustomPresets');
    if (savedCustom) { try { setCustomPresets(JSON.parse(savedCustom)); } catch(e) {} }
    synthRef.current = new AmbientSynth();
    return () => { synthRef.current?.stopAll(); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, []);

  const syncForm = (d: SettingsData) => {
    setFormInhale(d.inhale); setFormHold1(d.hold1); setFormExhale(d.exhale);
    setFormHold2(d.hold2); setFormRounds(d.rounds); setFormVoice(d.voiceGuidance); setFormChime(d.chimeSound);
  };

  const presets: Technique[] = [
    { name: 'Box Breathing', sanskrit: 'Sama Vritti', desc: 'Clear stress, focus attention, and stabilize heart rate variability.', icon: Wind, inhale: 4, hold1: 4, exhale: 4, hold2: 4, rounds: 4, category: 'Balance' },
    { name: '4-7-8 Sleep Method', sanskrit: 'Nadi Shodhana Variant', desc: 'Highly calming. Natural nervous system tranquilizer to guide you into deep sleep.', icon: Moon, inhale: 4, hold1: 7, exhale: 8, hold2: 0, rounds: 4, category: 'Sleep' },
    { name: 'Humming Bee Breath', sanskrit: 'Bhramari', desc: 'Calms active brain hums, relieves tension, and boosts nitric oxide production.', icon: Heart, inhale: 4, hold1: 0, exhale: 8, hold2: 0, rounds: 5, category: 'Calm', customInstruction: { inhale: 'Close ears, inhale fully', hold1: '', exhale: 'Hum gently like a bee', hold2: '' } },
    { name: 'Resonant Breathing', sanskrit: 'Coherent Breath', desc: 'Optimizes HRV biofeedback, lowers blood pressure, and harmonizes nervous system.', icon: Activity, inhale: 5, hold1: 0, exhale: 5, hold2: 0, rounds: 6, category: 'Balance' },
    { name: 'Bellows Breath', sanskrit: 'Bhastrika', desc: 'Rapid breathing pattern to supercharge body energy and focus.', icon: Flame, inhale: 2, hold1: 0, exhale: 2, hold2: 0, rounds: 10, category: 'Energy', customInstruction: { inhale: 'Forceful chest inhale', hold1: '', exhale: 'Forceful swift exhale', hold2: '' } },
    { name: 'Cooling Breath', sanskrit: 'Sheetali', desc: 'Lowers body temperature and calms mental agitation.', icon: Snowflake, inhale: 4, hold1: 4, exhale: 6, hold2: 0, rounds: 6, category: 'Calm', customInstruction: { inhale: 'Inhale through rolled tongue', hold1: 'Close mouth, hold air', exhale: 'Exhale softly through nose', hold2: '' } },
    { name: 'Alternate Nostril', sanskrit: 'Nadi Shodhana', desc: 'Balances left/right brain energy hemispheres, bringing mental clarity.', icon: Brain, inhale: 4, hold1: 4, exhale: 4, hold2: 0, rounds: 6, category: 'Balance', customInstruction: { inhale: 'Inhale left (block right)', hold1: 'Hold both nostrils closed', exhale: 'Exhale right (block left)', hold2: '' } },
  ];

  const allPresets = [...presets, ...customPresets];

  const renderIcon = (icon: any, size = 18) => {
    if (typeof icon === 'string') {
      switch (icon) {
        case 'Moon': return <Moon size={size} />;
        case 'Flame': return <Flame size={size} />;
        case 'Heart': return <Heart size={size} />;
        case 'Activity': return <Activity size={size} />;
        case 'Brain': return <Brain size={size} />;
        case 'Snowflake': return <Snowflake size={size} />;
        default: return <Wind size={size} />;
      }
    }
    const C = icon;
    return <C size={size} />;
  };

  const applyPreset = (preset: Technique) => {
    const s: SettingsData = { inhale: preset.inhale, hold1: preset.hold1, exhale: preset.exhale, hold2: preset.hold2, rounds: preset.rounds, voiceGuidance: settings.voiceGuidance, chimeSound: settings.chimeSound };
    setSettings(s); syncForm(s); setSelectedPreset(preset.name);
    localStorage.setItem('pranayamaSettingsReact', JSON.stringify(s));
    handleReset();
  };

  const handleInputChange = (field: keyof SettingsData, val: any) => {
    const s = { ...settings, [field]: val };
    setSettings(s); setSelectedPreset('Custom');
    localStorage.setItem('pranayamaSettingsReact', JSON.stringify(s));
    handleReset();
  };

  const speak = (text: string) => {
    if (!settings.voiceGuidance || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (preferred) u.voice = preferred;
    window.speechSynthesis.speak(u);
  };

  const announcePhase = (p: Phase) => {
    if (!settings.voiceGuidance) return;
    const map: Record<string, string> = { inhale: 'Breathe in', hold1: 'Hold', exhale: 'Breathe out', hold2: 'Hold empty' };
    if (map[p]) speak(map[p]);
  };

  const playChime = (phase: Phase) => {
    if (!settings.chimeSound) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      
      const playNote = (freq: number, delay: number, duration: number = 1.0, volume: number = 0.08) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(volume, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.1);
      };
      
      switch (phase) {
        case 'inhale':
          playNote(392, 0, 0.8, 0.06);
          playNote(493.88, 0.1, 0.8, 0.06);
          playNote(587.33, 0.2, 0.8, 0.06);
          break;
        case 'hold1':
          playNote(440, 0, 1.0, 0.05);
          playNote(554.37, 0, 1.0, 0.05);
          break;
        case 'exhale':
          playNote(349.23, 0, 0.8, 0.06);
          playNote(440, 0.1, 0.8, 0.06);
          playNote(523.25, 0.2, 0.8, 0.06);
          break;
        case 'hold2':
          playNote(329.63, 0, 1.0, 0.05);
          playNote(415.30, 0, 1.0, 0.05);
          break;
        case 'prep':
          playNote(440, 0, 0.6, 0.05);
          playNote(554.37, 0.1, 0.6, 0.05);
          break;
        case 'complete':
          playNote(523.25, 0, 0.6, 0.06);
          playNote(659.25, 0.15, 0.6, 0.06);
          playNote(783.99, 0.3, 0.6, 0.06);
          playNote(1046.50, 0.45, 0.6, 0.06);
          playNote(1318.51, 0.6, 0.8, 0.06);
          break;
      }
    } catch(e) {}
  };

  const handleSoundChange = (type: string) => {
    setSelectedSound(type);
    if (!synthRef.current) return;
    if (type === 'none') synthRef.current.stopAll();
    else if (type === 'ocean' && isRunning) synthRef.current.playOcean(audioVolume);
    else if (type === 'cosmos' && isRunning) synthRef.current.playCosmos(audioVolume);
  };

  const handleVolumeChange = (vol: number) => {
    setAudioVolume(vol);
    synthRef.current?.setVolume(vol);
  };

  useEffect(() => {
    if (!synthRef.current) return;
    if (isRunning) {
      if (selectedSound === 'ocean') synthRef.current.playOcean(audioVolume);
      if (selectedSound === 'cosmos') synthRef.current.playCosmos(audioVolume);
    } else { synthRef.current.stopAll(); }
  }, [isRunning, selectedSound, audioVolume]);

  const logPracticeSession = (dur: number, tech: string, rounds: number) => {
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => {
      let streak = prev.streak;
      if (!prev.lastDate) { streak = 1; }
      else {
        const diff = Math.abs(new Date(today).getTime() - new Date(prev.lastDate).getTime());
        const days = Math.ceil(diff / 86400000);
        if (days === 1) streak += 1;
        else if (days > 1) streak = 1;
      }
      const newStats = {
        totalSessions: prev.totalSessions + 1,
        totalSeconds: prev.totalSeconds + dur,
        streak, lastDate: today,
        history: [{ date: today, duration: dur, technique: tech, rounds }, ...prev.history].slice(0, 50)
      };
      localStorage.setItem('pranayamaStats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const handleStartPause = () => {
    if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(''); u.volume = 0; window.speechSynthesis.speak(u); }
    if (isRunning) {
      setIsRunning(false);
      if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    } else {
      setIsRunning(true);
      if (phase === 'ready' || phase === 'complete') startPrepPhase();
      else resumeTimer();
    }
  };

  const startPrepPhase = () => {
    setPhase('prep'); setTimeRemaining(2); speak("Prepare yourself");
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!); timerIntervalRef.current = null;
          setCurrentRound(1); playChime('prep');
          setTimeout(() => transitionToPhase('inhale', 1), 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resumeTimer = () => {
    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(timerIntervalRef.current!); timerIntervalRef.current = null; handlePhaseCompletion(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const transitionToPhase = (next: Phase, targetRound: number) => {
    const active = settingsRef.current;
    if (next !== 'complete' && next !== 'ready' && next !== 'prep') {
      const key = next === 'hold1' ? 'hold1' : next === 'hold2' ? 'hold2' : next;
      const dur = active[key as keyof SettingsData] as number;
      if (dur <= 0) { skipToNext(next, targetRound); return; }
      setTimeRemaining(dur); announcePhase(next);
    }
    setPhase(next);
    setPhaseKey(prev => prev + 1);
    if (next !== 'complete' && next !== 'ready' && next !== 'prep') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { clearInterval(timerIntervalRef.current!); timerIntervalRef.current = null; handlePhaseCompletion(); return 0; }
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
        if (current === 'prep') { setCurrentRound(1); playChime('prep'); setTimeout(() => transitionToPhase('inhale', 1), 600); }
        else if (current === 'inhale') transitionToPhase('hold1', round);
        else if (current === 'hold1') transitionToPhase('exhale', round);
        else if (current === 'exhale') transitionToPhase('hold2', round);
        else if (current === 'hold2') evaluateNextRound(round);
        return current;
      });
      return round;
    });
  };

  const evaluateNextRound = (completedRound: number) => {
    const active = settingsRef.current;
    if (active.rounds > 0 && completedRound >= active.rounds) {
      setIsRunning(false); setPhase('complete');
      speak("Session complete"); playChime('complete');
      logPracticeSession(active.rounds * (active.inhale + active.hold1 + active.exhale + active.hold2), selectedPreset, active.rounds);
    } else {
      const next = completedRound + 1;
      setCurrentRound(next); playChime('inhale');
      setTimeout(() => transitionToPhase('inhale', next), 500);
    }
  };

  const handleReset = () => {
    const completed = currentRound - 1;
    if (completed > 0 && isRunning) {
      logPracticeSession(completed * (settings.inhale + settings.hold1 + settings.exhale + settings.hold2), selectedPreset, completed);
    }
    setIsRunning(false); setPhase('ready'); setCurrentRound(1); setTimeRemaining(0);
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const handleSkipPhase = () => {
    if (!isRunning || phase === 'ready' || phase === 'prep' || phase === 'complete') return;
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    handlePhaseCompletion();
  };

  const handleCreateCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    if (allPresets.some(p => p.name.toLowerCase() === newPresetName.trim().toLowerCase())) return;
    const np: Technique = {
      name: newPresetName.trim(), sanskrit: newPresetSanskrit.trim() || 'Custom Pranayama',
      desc: `Custom breathing with ${newPresetInhale}s In, ${newPresetHold1}s Hold, ${newPresetExhale}s Out, ${newPresetHold2}s Hold.`,
      icon: newPresetCategory === 'Calm' ? 'Heart' : newPresetCategory === 'Energy' ? 'Flame' : newPresetCategory === 'Sleep' ? 'Moon' : 'Activity',
      inhale: newPresetInhale, hold1: newPresetHold1, exhale: newPresetExhale, hold2: newPresetHold2, rounds: newPresetRounds, category: newPresetCategory
    };
    const updated = [...customPresets, np];
    setCustomPresets(updated);
    localStorage.setItem('pranayamaCustomPresets', JSON.stringify(updated));
    applyPreset(np);
    setNewPresetName(''); setNewPresetSanskrit(''); setNewPresetCategory('Calm'); setIsCreatingPreset(false);
    playChime('complete');
  };

  const handleDeletePreset = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.name !== name);
    setCustomPresets(updated);
    localStorage.setItem('pranayamaCustomPresets', JSON.stringify(updated));
    if (selectedPreset === name) applyPreset(presets[0]);
  };

  const getCircleScale = () => {
    if (!isRunning && phase === 'ready') return 1.0;
    if (phase === 'prep') return 1.0;
    if (phase === 'complete') return 1.0;
    switch (phase) {
      case 'inhale': return 1.0 + 0.85 * ((settings.inhale - timeRemaining) / settings.inhale);
      case 'hold1': return 1.85;
      case 'exhale': return 1.85 - 0.85 * ((settings.exhale - timeRemaining) / settings.exhale);
      case 'hold2': return 1.0;
      default: return 1.0;
    }
  };

  const getPhaseClass = () => {
    const map: Record<string, string> = { ready: 't-ready', prep: 't-prep', inhale: 't-inhale', hold1: 't-hold', exhale: 't-exhale', hold2: 't-hold2', complete: 't-done' };
    return `${map[phase] || 't-ready'} ${isZenMode ? 'zm' : ''} ${isRunning ? 'running' : ''}`;
  };

  const getPhaseName = () => {
    const map: Record<string, string> = { prep: 'Prepare', inhale: 'Inhale', hold1: 'Hold In', exhale: 'Exhale', hold2: 'Hold Empty', complete: 'Rest' };
    return map[phase] || 'Ready';
  };

  const getPhaseInstruction = () => {
    const active = allPresets.find(p => p.name === selectedPreset);
    const ci = active?.customInstruction;
    const map: Record<string, string> = {
      prep: 'Find a comfortable seat and align your posture',
      inhale: ci?.inhale || 'Expand your lungs, draw energy inward',
      hold1: ci?.hold1 || 'Retain the breath, find stillness within',
      exhale: ci?.exhale || 'Release softly, let go of all tension',
      hold2: ci?.hold2 || 'Suspend your breath, rest in the void',
      complete: 'Session complete. Absorb the benefits',
    };
    return map[phase] || 'Select a technique and begin your practice';
  };

  const getWavePath = () => {
    const total = settings.inhale + settings.hold1 + settings.exhale + settings.hold2;
    if (total === 0) return 'M 0 30 H 360';
    const x1 = (settings.inhale / total) * 360;
    const x2 = ((settings.inhale + settings.hold1) / total) * 360;
    const x3 = ((settings.inhale + settings.hold1 + settings.exhale) / total) * 360;
    return `M 0 48 C ${x1 * 0.45} 48, ${x1 * 0.55} 10, ${x1} 10 L ${x2} 10 C ${x2 + (x3 - x2) * 0.45} 10, ${x2 + (x3 - x2) * 0.55} 48, ${x3} 48 L 360 48`;
  };

  const getWaveCursor = () => {
    if (phase === 'ready' || phase === 'prep' || phase === 'complete') return { x: 0, y: 48 };
    const total = settings.inhale + settings.hold1 + settings.exhale + settings.hold2;
    if (total === 0) return { x: 0, y: 48 };
    let elapsed = 0;
    if (phase === 'inhale') elapsed = settings.inhale - timeRemaining;
    else if (phase === 'hold1') elapsed = settings.inhale + (settings.hold1 - timeRemaining);
    else if (phase === 'exhale') elapsed = settings.inhale + settings.hold1 + (settings.exhale - timeRemaining);
    else if (phase === 'hold2') elapsed = settings.inhale + settings.hold1 + settings.exhale + (settings.hold2 - timeRemaining);
    const x = (elapsed / total) * 360;
    let y = 48;
    if (phase === 'inhale') { const p = Math.sin(((settings.inhale - timeRemaining) / settings.inhale - 0.5) * Math.PI) * 0.5 + 0.5; y = 48 - p * 38; }
    else if (phase === 'hold1') y = 10;
    else if (phase === 'exhale') { const p = Math.sin(((settings.exhale - timeRemaining) / settings.exhale - 0.5) * Math.PI) * 0.5 + 0.5; y = 10 + p * 38; }
    else if (phase === 'hold2') y = 48;
    return { x, y };
  };

  const fmtTime = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const getPhaseDuration = () => {
    switch (phase) {
      case 'inhale': return settings.inhale;
      case 'hold1': return settings.hold1;
      case 'exhale': return settings.exhale;
      case 'hold2': return settings.hold2;
      case 'prep': return 2;
      default: return 0;
    }
  };

  const getPhaseProgress = () => {
    const dur = getPhaseDuration();
    if (dur === 0) return 0;
    return (dur - timeRemaining) / dur;
  };

  const getPhaseIndex = () => {
    switch (phase) {
      case 'inhale': return 0;
      case 'hold1': return 1;
      case 'exhale': return 2;
      case 'hold2': return 3;
      default: return -1;
    }
  };

  const getPhaseAction = () => {
    switch (phase) {
      case 'ready': return 'READY';
      case 'prep': return 'PREPARE';
      case 'inhale': return 'BREATHE IN';
      case 'hold1': return 'HOLD';
      case 'exhale': return 'BREATHE OUT';
      case 'hold2': return 'HOLD EMPTY';
      case 'complete': return 'COMPLETE';
      default: return 'READY';
    }
  };

  const cursor = getWaveCursor();

  return (
    <div className={`app ${getPhaseClass()}`}>
      <div className="ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
      </div>

      <nav className="nav">
        <a className="brand" onClick={handleReset} href="#">
          <div className="brand-mark"><Wind /></div>
          <div className="brand-text">
            <span className="brand-name">Prana</span>
            <span className="brand-tag">Breathwork Studio</span>
          </div>
        </a>
        <div className="nav-links">
          <a href="#about" className="nav-link">Benefits</a>
          <a href="#science" className="nav-link">Science</a>
          <button className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stats'); if (window.innerWidth <= 1100) document.getElementById('sidebar')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <span className="streak-badge">🔥 {stats.streak}d</span>
          </button>
        </div>
      </nav>

      <div className="main">
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-head">
            <span className="sidebar-title">
              {activeTab === 'presets' && <><Compass size={14} /> Techniques</>}
              {activeTab === 'customize' && <><Activity size={14} /> Customize</>}
              {activeTab === 'stats' && <><Trophy size={14} /> Progress</>}
            </span>
            <div className="tabs">
              <button className={`tab ${activeTab === 'presets' ? 'active' : ''}`} onClick={() => setActiveTab('presets')}>Presets</button>
              <button className={`tab ${activeTab === 'customize' ? 'active' : ''}`} onClick={() => setActiveTab('customize')}>Ratio</button>
              <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
            </div>
          </div>

          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isCreatingPreset ? (
                <form onSubmit={handleCreateCustomPreset} className="create-form">
                  <div className="form-head">
                    <span className="form-head-title">New Technique</span>
                    <button type="button" className="form-close" onClick={() => setIsCreatingPreset(false)}><X size={16} /></button>
                  </div>
                  <div className="form-fields">
                    <div className="field">
                      <label className="field-label" htmlFor="pn">Name</label>
                      <input id="pn" className="field-input" type="text" placeholder="e.g. Ocean Calm" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} maxLength={25} required />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="ps">Sanskrit</label>
                      <input id="ps" className="field-input" type="text" placeholder="e.g. Samudra Pranayama" value={newPresetSanskrit} onChange={e => setNewPresetSanskrit(e.target.value)} maxLength={30} />
                    </div>
                    <div className="form-row-2">
                      <div className="field">
                        <label className="field-label" htmlFor="pc">Category</label>
                        <select id="pc" className="field-select" value={newPresetCategory} onChange={e => setNewPresetCategory(e.target.value as any)}>
                          <option value="Calm">Calm</option><option value="Energy">Energy</option><option value="Sleep">Sleep</option><option value="Balance">Balance</option>
                        </select>
                      </div>
                      <div className="field">
                        <label className="field-label" htmlFor="pr">Rounds</label>
                        <input id="pr" className="field-input" type="number" min="0" max="99" value={newPresetRounds} onChange={e => setNewPresetRounds(parseInt(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="field">
                      <span className="field-label">Ratio (In - Hold - Out - Empty)</span>
                      <div className="form-row-4">
                        <div className="field"><input className="field-input" type="number" min="1" max="25" value={newPresetInhale} onChange={e => setNewPresetInhale(Math.max(1, parseInt(e.target.value) || 1))} placeholder="In" required /><span className="num-label">In</span></div>
                        <div className="field"><input className="field-input" type="number" min="0" max="25" value={newPresetHold1} onChange={e => setNewPresetHold1(Math.max(0, parseInt(e.target.value) || 0))} placeholder="Hold" /><span className="num-label">Hold</span></div>
                        <div className="field"><input className="field-input" type="number" min="1" max="25" value={newPresetExhale} onChange={e => setNewPresetExhale(Math.max(1, parseInt(e.target.value) || 1))} placeholder="Out" required /><span className="num-label">Out</span></div>
                        <div className="field"><input className="field-input" type="number" min="0" max="25" value={newPresetHold2} onChange={e => setNewPresetHold2(Math.max(0, parseInt(e.target.value) || 0))} placeholder="Empty" /><span className="num-label">Empty</span></div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="form-submit">Save Technique</button>
                </form>
              ) : (
                <button className="create-btn" onClick={() => { setNewPresetInhale(settings.inhale); setNewPresetHold1(settings.hold1); setNewPresetExhale(settings.exhale); setNewPresetHold2(settings.hold2); setNewPresetRounds(settings.rounds); setIsCreatingPreset(true); }}>
                  <Plus size={16} /> Create Custom
                </button>
              )}

              <div className="preset-list">
                {allPresets.map(p => {
                  const isCustom = customPresets.some(cp => cp.name === p.name);
                  return (
                    <button key={p.name} className={`preset-card ${selectedPreset === p.name ? 'selected' : ''}`} onClick={() => applyPreset(p)}>
                      <div className="preset-top">
                        <div className="preset-icon">{renderIcon(p.icon)}</div>
                        <div className="preset-info">
                          <div className="preset-name">{p.name}</div>
                          <div className="preset-sub">{p.sanskrit}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="preset-ratio">{p.inhale}-{p.hold1}-{p.exhale}-{p.hold2}</span>
                          {isCustom && <button className="preset-del" onClick={(e) => handleDeletePreset(p.name, e)} title="Delete"><Trash2 size={13} /></button>}
                        </div>
                      </div>
                      <p className="preset-desc">{p.desc}</p>
                      <span className="preset-tag">{p.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="sliders">
              {[
                { label: 'Inhale', val: formInhale, cls: 's-inhale', range: 'range-inhale', field: 'inhale' as const, min: 1, max: 20, set: setFormInhale },
                { label: 'Hold (Full)', val: formHold1, cls: 's-hold', range: 'range-hold', field: 'hold1' as const, min: 0, max: 20, set: setFormHold1 },
                { label: 'Exhale', val: formExhale, cls: 's-exhale', range: 'range-exhale', field: 'exhale' as const, min: 1, max: 20, set: setFormExhale },
                { label: 'Hold (Empty)', val: formHold2, cls: 's-hold2', range: 'range-hold2', field: 'hold2' as const, min: 0, max: 20, set: setFormHold2 },
              ].map(s => (
                <div key={s.field} className="slider-group">
                  <div className="slider-label">
                    <span className="slider-name">{s.label}</span>
                    <span className={`slider-val ${s.cls}`}>{s.val}s</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} value={s.val} className={s.range}
                    onChange={e => { const v = parseInt(e.target.value); s.set(v); handleInputChange(s.field, v); }} />
                </div>
              ))}

              <div className="prefs">
                <div className="pref-row">
                  <div className="pref-text"><span className="pref-title">Target Cycles</span><span className="pref-desc">0 for infinite</span></div>
                  <div className="num-input-wrap">
                    <input className="num-input" type="number" min="0" max="99" value={formRounds}
                      onChange={e => { const v = parseInt(e.target.value) || 0; setFormRounds(v); handleInputChange('rounds', v); }} />
                    <span className="num-label">rounds</span>
                  </div>
                </div>
                <div className="pref-row">
                  <div className="pref-text"><span className="pref-title">Voice Guidance</span><span className="pref-desc">Speech cues at phase changes</span></div>
                  <label className="toggle">
                    <input type="checkbox" checked={formVoice} onChange={e => { setFormVoice(e.target.checked); handleInputChange('voiceGuidance', e.target.checked); }} />
                    <span className="toggle-track"></span>
                    <span className="toggle-knob"></span>
                  </label>
                </div>
                <div className="pref-row">
                  <div className="pref-text"><span className="pref-title">Bell Chime</span><span className="pref-desc">Ring bell at cycle start</span></div>
                  <label className="toggle">
                    <input type="checkbox" checked={formChime} onChange={e => { setFormChime(e.target.checked); handleInputChange('chimeSound', e.target.checked); }} />
                    <span className="toggle-track"></span>
                    <span className="toggle-knob"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <Award className="box-icon" size={20} style={{ color: 'var(--text-400)' }} />
                  <span className="stat-num">{stats.totalSessions}</span>
                  <span className="stat-label">Sessions</span>
                </div>
                <div className="stat-card">
                  <Clock className="box-icon" size={20} style={{ color: 'var(--text-400)' }} />
                  <span className="stat-num">{fmtTime(stats.totalSeconds)}</span>
                  <span className="stat-label">Mindful Time</span>
                </div>
                <div className="stat-card wide">
                  <Flame className="box-icon" size={20} style={{ color: 'var(--text-400)' }} />
                  <span className="stat-num streak">🔥 {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</span>
                  <span className="stat-label">Daily Streak</span>
                </div>
              </div>
              <span className="sidebar-title" style={{ marginTop: '4px' }}><Calendar size={14} /> Recent Sessions</span>
              <div className="history-list">
                {stats.history.length === 0 ? (
                  <div className="history-empty"><Award size={28} /><p>Complete your first practice to begin tracking.</p></div>
                ) : stats.history.map((h, i) => (
                  <div key={i} className="history-item">
                    <div className="history-left"><span className="history-name">{h.technique}</span><span className="history-date">{h.date}</span></div>
                    <div className="history-right"><span className="history-dur">{fmtTime(h.duration)}</span><span className="history-rounds">{h.rounds} {h.rounds === 1 ? 'round' : 'rounds'}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="zen">
          <div className="zen-top">
            <div className="preset-badge">
              <strong>{selectedPreset}</strong>
              <span className="ratio">{settings.inhale}-{settings.hold1}-{settings.exhale}-{settings.hold2}</span>
            </div>
            <button className={`zen-btn ${isZenMode ? 'on' : ''}`} onClick={() => setIsZenMode(!isZenMode)}>
              {isZenMode ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>{isZenMode ? 'Exit Zen' : 'Zen Mode'}</span>
            </button>
          </div>

          <div className="breath-stage">
            <div className="phase-banner">
              <h2 key={phaseKey} className="phase-action pulse">{getPhaseAction()}</h2>
              <div className="phase-subtitle">{getPhaseName()}</div>
            </div>

            <div className="breath-orb-wrap">
              <svg className="progress-ring" width="260" height="260">
                <circle className="progress-ring-bg" cx="130" cy="130" r="127" fill="none" strokeWidth="4" />
                <circle className="progress-ring-fill" cx="130" cy="130" r="127" fill="none" strokeWidth="4"
                  strokeDasharray={798}
                  strokeDashoffset={798 * (1 - getPhaseProgress())}
                  transform="rotate(-90 130 130)" />
              </svg>
              <div className="breath-glow-ring"></div>
              <div className="breath-orb" style={{ transform: `scale(${getCircleScale()})` }}>
                <div className="orb-inner-glow"></div>
              </div>
              <div className="breath-center">
                <div className="breath-timer">{phase === 'ready' || phase === 'complete' ? '—' : timeRemaining}</div>
                <div className="breath-instruction">{getPhaseInstruction()}</div>
                <div className="phase-icon-row">
                  <div className={`phase-dot ${getPhaseIndex() === 0 ? 'active' : ''}`}></div>
                  <div className={`phase-dot ${getPhaseIndex() === 1 ? 'active' : ''}`}></div>
                  <div className={`phase-dot ${getPhaseIndex() === 2 ? 'active' : ''}`}></div>
                  <div className={`phase-dot ${getPhaseIndex() === 3 ? 'active' : ''}`}></div>
                </div>
              </div>
              <div className="ripple-wrap">
                <div className="ripple ripple-1"></div>
                <div className="ripple ripple-2"></div>
              </div>
              <div className="particles">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="particle"></div>
                ))}
              </div>
            </div>
          </div>

          {isRunning && (
            <div className="waveform">
              <svg viewBox="0 0 360 56">
                <path d={getWavePath()} className="wave-bg" />
                <path d={getWavePath()} className="wave-progress" style={{ strokeDasharray: 360, strokeDashoffset: 360 - cursor.x }} />
                <circle cx={cursor.x} cy={cursor.y} r="5" className="wave-dot" />
              </svg>
            </div>
          )}

          <div className="hud">
            {settings.rounds > 0 && (
              <div className="cycle-dots">
                {[...Array(settings.rounds)].map((_, i) => (
                  <div key={i} className={`cycle-dot ${i < currentRound - 1 ? 'filled' : ''} ${i === currentRound - 1 ? 'current' : ''}`}></div>
                ))}
              </div>
            )}
            <div className="controls">
              <button className="ctrl-btn side reset" onClick={handleReset} disabled={phase === 'ready'} title="Reset">
                <RotateCcw size={18} />
              </button>
              <button className={`ctrl-btn play ${isRunning ? 'on' : ''}`} onClick={handleStartPause} aria-label={isRunning ? 'Pause' : 'Start'}>
                {isRunning ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 2 }} />}
              </button>
              <button className="ctrl-btn side skip" onClick={handleSkipPhase} disabled={!isRunning || phase === 'ready' || phase === 'prep' || phase === 'complete'} title="Skip">
                <Zap size={18} />
              </button>
            </div>
            <div className="audio-ctrl">
              {selectedSound === 'none' ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <select className="audio-select" value={selectedSound} onChange={e => handleSoundChange(e.target.value)}>
                <option value="none">No Audio</option>
                <option value="ocean">Ocean Waves</option>
                <option value="cosmos">Cosmos Pad</option>
              </select>
              {selectedSound !== 'none' && (
                <input type="range" min="0" max="1" step="0.05" value={audioVolume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))} className="vol-slider" />
              )}
            </div>
          </div>
        </section>
      </div>

      {!isZenMode && (
        <a href="#about" className="scroll-cta">
          <span>Explore breathing science</span>
          <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
        </a>
      )}

      <div className="edu">
        <section className="edu-section" id="science">
          <div className="edu-header">
            <h2 className="edu-title">The Science of Breath</h2>
            <p className="edu-desc">Pranayama is the ancient yogic practice of controlling the breath. Modern respiratory biology confirms that altering breathing ratios directly controls your autonomic nervous system.</p>
          </div>
          <div className="pillars">
            {[
              { icon: <Wind size={20} />, num: '01', sanskrit: 'Puraka', name: 'Inhalation', text: 'Drawing oxygen and prana into the body. Deep inhalation triggers thoracic stretch receptors, expanding lung capacity and oxygenating red blood cells.' },
              { icon: <Activity size={20} />, num: '02', sanskrit: 'Antar Kumbhaka', name: 'Inner Hold', text: 'Retaining air inside full lungs. Holding creates partial pressures that maximize oxygen transfer while training resilience in the brain\'s stress centers.' },
              { icon: <Moon size={20} />, num: '03', sanskrit: 'Rechaka', name: 'Exhalation', text: 'Releasing carbon dioxide and stagnant energy. A slow, extended exhalation stimulates the vagus nerve, signaling the heart to slow down.' },
              { icon: <Flame size={20} />, num: '04', sanskrit: 'Bahya Kumbhaka', name: 'Outer Hold', text: 'Suspending breath on empty lungs. This trains CO2 tolerance in the brain stem, lowering chronic anxiety thresholds and building somatic stamina.' },
            ].map(p => (
              <div key={p.num} className="pillar">
                <div className="pillar-head"><div className="pillar-icon">{p.icon}</div><span className="pillar-num">{p.num}</span></div>
                <div><span className="pillar-label">{p.sanskrit}</span><div className="pillar-name">{p.name}</div></div>
                <p className="pillar-body">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="edu-section" id="about">
          <div className="edu-header">
            <h2 className="edu-title">Why Practice Breathwork?</h2>
            <p className="edu-desc">Scientific research confirms that dedicated breathing routines provide immediate and cumulative benefits to brain chemistry and vascular health.</p>
          </div>
          <div className="benefits">
            {[
              { icon: <Heart size={18} />, cls: 'blue', title: 'Vagal Tone & Heart Health', text: 'Extending exhalations activates the parasympathetic vagus nerve, resulting in lower resting heart rates and reduced vascular pressure.' },
              { icon: <Activity size={18} />, cls: 'teal', title: 'HRV Biofeedback', text: 'Coherent breathing patterns synchronize cardiac oscillations, optimizing Heart Rate Variability — the primary marker of nervous system flexibility.' },
              { icon: <Brain size={18} />, cls: 'purple', title: 'Cortisol Reduction', text: 'Slow, structured breathing downregulates the sympathetic stress response, curbing adrenaline secretion and stopping racing thoughts.' },
              { icon: <Info size={18} />, cls: 'orange', title: 'Nitric Oxide Boost', text: 'Nasal breathing and humming patterns generate high quantities of nitric oxide, expanding blood vessels and improving pulmonary absorption.' },
            ].map((b, i) => (
              <div key={i} className="benefit">
                <div className={`benefit-icon ${b.cls}`}>{b.icon}</div>
                <h3 className="benefit-title">{b.title}</h3>
                <p className="benefit-body">{b.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>© 2026 Prana. Breathe consciously, live dynamically.</p>
        <p className="sub">Premium breathwork software for physical and somatic health.</p>
      </footer>
    </div>
  );
}
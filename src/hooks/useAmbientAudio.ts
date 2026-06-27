import { useState, useEffect, useRef } from 'react';
import { Phase } from '../types';

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

export function useAmbientAudio() {
  const [selectedSound, setSelectedSound] = useState<string>('none');
  const [audioVolume, setAudioVolume] = useState<number>(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<AmbientSynth | null>(null);

  useEffect(() => {
    synthRef.current = new AmbientSynth();
    
    // Resume audio context on first user interaction (needed for mobile browsers)
    const resumeAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      document.removeEventListener('touchstart', resumeAudio);
      document.removeEventListener('click', resumeAudio);
    };
    document.addEventListener('touchstart', resumeAudio, { once: true });
    document.addEventListener('click', resumeAudio, { once: true });
    
    return () => {
      synthRef.current?.stopAll();
      document.removeEventListener('touchstart', resumeAudio);
      document.removeEventListener('click', resumeAudio);
    };
  }, []);

  const handleSoundChange = (type: string, isRunning: boolean) => {
    setSelectedSound(type);
    if (!synthRef.current) return;
    if (type === 'none') {
      synthRef.current.stopAll();
    } else if (isRunning) {
      // Play immediately if breathing is running
      if (type === 'ocean') {
        synthRef.current.playOcean(audioVolume);
      } else if (type === 'cosmos') {
        synthRef.current.playCosmos(audioVolume);
      }
    } else {
      // Stop any current sound when not running (will auto-start when breathing starts)
      synthRef.current.stopAll();
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAudioVolume(vol);
    synthRef.current?.setVolume(vol);
  };

  const speak = (text: string, voiceGuidanceEnabled: boolean) => {
    if (!voiceGuidanceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.includes('en') &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    );
    if (preferred) u.voice = preferred;
    window.speechSynthesis.speak(u);
  };

  const announcePhase = (p: Phase, voiceGuidanceEnabled: boolean) => {
    if (!voiceGuidanceEnabled) return;
    const map: Record<string, string> = {
      inhale: 'Breathe in',
      hold1: 'Hold',
      exhale: 'Breathe out',
      hold2: 'Hold empty'
    };
    if (map[p]) {
      speak(map[p], voiceGuidanceEnabled);
    }
  };

  const playChime = (phase: Phase, chimeSoundEnabled: boolean) => {
    if (!chimeSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
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
    } catch (e) {
      console.error('Error playing chime', e);
    }
  };

  const updateAmbientState = (isRunning: boolean) => {
    if (!synthRef.current) return;
    if (isRunning) {
      if (selectedSound === 'ocean') {
        synthRef.current.playOcean(audioVolume);
      } else if (selectedSound === 'cosmos') {
        synthRef.current.playCosmos(audioVolume);
      } else {
        synthRef.current.stopAll();
      }
    } else {
      synthRef.current.stopAll();
    }
  };

  return {
    selectedSound,
    setSelectedSound,
    audioVolume,
    handleSoundChange,
    handleVolumeChange,
    playChime,
    announcePhase,
    speak,
    updateAmbientState
  };
}

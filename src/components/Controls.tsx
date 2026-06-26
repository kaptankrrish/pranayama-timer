
import { Play, Pause, RotateCcw, Zap, Volume2, VolumeX } from 'lucide-react';
import { Phase, SettingsData } from '../types';

interface ControlsProps {
  phase: Phase;
  isRunning: boolean;
  currentRound: number;
  settings: SettingsData;
  handleReset: () => void;
  handleStartPause: () => void;
  handleSkipPhase: () => void;
  selectedSound: string;
  audioVolume: number;
  handleSoundChange: (sound: string, isRunning: boolean) => void;
  handleVolumeChange: (volume: number) => void;
  cursor: { x: number; y: number };
  getWavePath: () => string;
}

export function Controls({
  phase,
  isRunning,
  currentRound,
  settings,
  handleReset,
  handleStartPause,
  handleSkipPhase,
  selectedSound,
  audioVolume,
  handleSoundChange,
  handleVolumeChange,
  cursor,
  getWavePath,
}: ControlsProps) {
  return (
    <>
      {/* Waveform Visualization */}
      <div className={`waveform-container ${isRunning ? 'active' : ''}`}>
        <div className="waveform">
          <svg viewBox="0 0 360 56">
            <path d={getWavePath()} className="wave-bg" />
            <path 
              d={getWavePath()} 
              className="wave-progress" 
              style={{ strokeDasharray: '360', strokeDashoffset: 360 - cursor.x }} 
            />
            <circle cx={cursor.x} cy={cursor.y} r="5" className="wave-dot" />
          </svg>
        </div>
      </div>

      {/* Playback Controls Hud */}
      <div className="hud">
        {settings.rounds > 0 && (
          <div className="cycle-dots">
            {Array.from({ length: settings.rounds }).map((_, i) => (
              <div 
                key={i} 
                className={`cycle-dot ${i < currentRound - 1 ? 'filled' : i === currentRound - 1 ? 'current' : ''}`}
              ></div>
            ))}
          </div>
        )}

        <div className="controls">
          <button 
            className="ctrl-btn side reset" 
            onClick={handleReset} 
            disabled={phase === 'ready'} 
            title="Reset practice"
          >
            <RotateCcw size={18} />
          </button>
          
          <button 
            className={`ctrl-btn play ${isRunning ? 'on' : ''}`} 
            onClick={handleStartPause} 
            aria-label={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 2 }} />}
          </button>
          
          <button 
            className="ctrl-btn side skip" 
            onClick={handleSkipPhase} 
            disabled={!isRunning || phase === 'ready' || phase === 'prep' || phase === 'complete'} 
            title="Skip current phase"
          >
            <Zap size={18} />
          </button>
        </div>

        {/* Ambient Sound Controller */}
        <div className="audio-ctrl">
          {selectedSound === 'none' ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <select 
            className="audio-select" 
            value={selectedSound} 
            onChange={e => handleSoundChange(e.target.value, isRunning)}
          >
            <option value="none">No Audio</option>
            <option value="ocean">Ocean Waves</option>
            <option value="cosmos">Cosmos Pad</option>
          </select>
          {selectedSound !== 'none' && (
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={audioVolume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))} 
              className="vol-slider" 
              title="Volume"
            />
          )}
        </div>
      </div>
    </>
  );
}

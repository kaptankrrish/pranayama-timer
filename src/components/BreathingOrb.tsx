import React from 'react';
import { Phase, SettingsData } from '../types';

interface BreathingOrbProps {
  phase: Phase;
  isRunning: boolean;
  timeRemaining: number;
  settings: SettingsData;
  getPhaseProgress: () => number;
  getPhaseIndex: () => number;
  getPhaseInstruction: () => string;
  getOrbStyle: () => React.CSSProperties;
}

export function BreathingOrb({
  phase,
  isRunning: _isRunning,
  timeRemaining,
  settings: _settings,
  getPhaseProgress,
  getPhaseIndex,
  getPhaseInstruction,
  getOrbStyle,
}: BreathingOrbProps) {
  const phaseProgress = getPhaseProgress();
  const phaseIndex = getPhaseIndex();
  const instruction = getPhaseInstruction();
  const orbStyle = getOrbStyle();

  // 798 is the circumference for radius 127 (2 * Math.PI * 127 = 797.96)
  const strokeDashoffset = 798 * (1 - phaseProgress);

  return (
    <div className="breath-orb-wrap">
      {/* Concentric Progress Ring */}
      <svg className="progress-ring" viewBox="0 0 260 260" width="100%" height="100%">
        <circle 
          className="progress-ring-bg" 
          cx="130" 
          cy="130" 
          r="127" 
          fill="none" 
          strokeWidth="4" 
        />
        <circle 
          className="progress-ring-fill" 
          cx="130" 
          cy="130" 
          r="127" 
          fill="none" 
          strokeWidth="4"
          strokeDasharray={798}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 130 130)" 
        />
      </svg>

      {/* Rotating Conic-Gradient Ambient Glow behind the orb */}
      <div className="breath-glow-ring"></div>

      {/* Morphing SVG liquid breathing orb */}
      <div className="breath-orb" style={orbStyle}>
        <div className="orb-inner-glow"></div>
      </div>

      {/* Glass Countdown Overlay in center */}
      <div className="breath-center">
        <div className="breath-timer">
          {phase === 'ready' || phase === 'complete' ? '—' : timeRemaining}
        </div>
        <div className="breath-instruction">{instruction}</div>
        
        {/* Phase Dots */}
        <div className="phase-icon-row">
          <div className={`phase-dot ${phaseIndex === 0 ? 'active' : ''}`}></div>
          <div className={`phase-dot ${phaseIndex === 1 ? 'active' : ''}`}></div>
          <div className={`phase-dot ${phaseIndex === 2 ? 'active' : ''}`}></div>
          <div className={`phase-dot ${phaseIndex === 3 ? 'active' : ''}`}></div>
        </div>
      </div>

      {/* Concentric expanding ripples during inhale/exhale */}
      <div className="ripple-wrap">
        <div className="ripple ripple-1"></div>
        <div className="ripple ripple-2"></div>
      </div>

      {/* Physics Particle System - 12 particles */}
      <div className="particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>
    </div>
  );
}

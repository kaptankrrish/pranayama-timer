
import { Phase } from '../types';

interface PhaseDisplayProps {
  phase: Phase;
  phaseKey: number;
  getPhaseAction: () => string;
  getPhaseName: () => string;
}

export function PhaseDisplay({ phase: _phase, phaseKey, getPhaseAction, getPhaseName }: PhaseDisplayProps) {
  const actionText = getPhaseAction();
  const phaseName = getPhaseName();

  return (
    <div className="phase-banner">
      <h2 key={phaseKey} className="phase-action">
        {actionText.split('').map((char, index) => (
          <span 
            key={`${char}-${index}`} 
            style={{ 
              display: 'inline-block',
              animation: 'letter-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
              animationDelay: `${index * 0.03}s`
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h2>
      <div className="phase-subtitle">{phaseName}</div>
    </div>
  );
}

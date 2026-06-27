
import { SettingsData } from '../types';

interface CustomizePanelProps {
  settings: SettingsData;
  formInhale: number;
  setFormInhale: (v: number) => void;
  formHold1: number;
  setFormHold1: (v: number) => void;
  formExhale: number;
  setFormExhale: (v: number) => void;
  formHold2: number;
  setFormHold2: (v: number) => void;
  formRounds: number;
  setFormRounds: (v: number) => void;
  formVoice: boolean;
  setFormVoice: (v: boolean) => void;
  formChime: boolean;
  setFormChime: (v: boolean) => void;
  handleInputChange: (field: keyof SettingsData, val: any) => void;
}

export function CustomizePanel({
  settings: _settings,
  formInhale,
  setFormInhale,
  formHold1,
  setFormHold1,
  formExhale,
  setFormExhale,
  formHold2,
  setFormHold2,
  formRounds,
  setFormRounds,
  formVoice,
  setFormVoice,
  formChime,
  setFormChime,
  handleInputChange,
}: CustomizePanelProps) {
  const slidersList = [
    { 
      label: 'Inhale', 
      val: formInhale, 
      cls: 's-inhale', 
      range: 'range-inhale', 
      field: 'inhale' as const, 
      min: 1, 
      max: 20, 
      set: setFormInhale 
    },
    { 
      label: 'Hold (Full)', 
      val: formHold1, 
      cls: 's-hold', 
      range: 'range-hold', 
      field: 'hold1' as const, 
      min: 0, 
      max: 20, 
      set: setFormHold1 
    },
    { 
      label: 'Exhale', 
      val: formExhale, 
      cls: 's-exhale', 
      range: 'range-exhale', 
      field: 'exhale' as const, 
      min: 1, 
      max: 20, 
      set: setFormExhale 
    },
    { 
      label: 'Hold (Empty)', 
      val: formHold2, 
      cls: 's-hold2', 
      range: 'range-hold2', 
      field: 'hold2' as const, 
      min: 0, 
      max: 20, 
      set: setFormHold2 
    },
  ];

  return (
    <div className="sliders">
      {slidersList.map(s => (
        <div key={s.field} className="slider-group">
          <div className="slider-label">
            <span className="slider-name">{s.label}</span>
            <span className={`slider-val ${s.cls}`}>{s.val}s</span>
          </div>
          <input 
            type="range" 
            min={s.min} 
            max={s.max} 
            value={s.val} 
            className={s.range}
            onChange={e => { 
              const v = parseInt(e.target.value); 
              s.set(v); 
              handleInputChange(s.field, v); 
            }} 
          />
        </div>
      ))}

      <div className="prefs">
        {/* Target Cycles */}
        <div className="pref-row">
          <div className="pref-text">
            <span className="pref-title">Target Cycles</span>
            <span className="pref-desc">0 for infinite rounds</span>
          </div>
          <div className="num-input-wrap">
            <input 
              className="num-input" 
              type="number" 
              min="0" 
              max="99" 
              value={formRounds}
              onChange={e => { 
                const v = parseInt(e.target.value) || 0; 
                setFormRounds(v); 
                handleInputChange('rounds', v); 
              }} 
            />
            <span className="num-label">rounds</span>
          </div>
        </div>

        {/* Voice Guidance Toggle */}
        <div className="pref-row">
          <div className="pref-text">
            <span className="pref-title">Voice Guidance</span>
            <span className="pref-desc">Speech cues at phase changes</span>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={formVoice} 
              onChange={e => { 
                setFormVoice(e.target.checked); 
                handleInputChange('voiceGuidance', e.target.checked); 
              }} 
            />
            <span className="toggle-track"></span>
            <span className="toggle-knob"></span>
          </label>
        </div>

        {/* Bell Chime Toggle */}
        <div className="pref-row">
          <div className="pref-text">
            <span className="pref-title">Bell Chime</span>
            <span className="pref-desc">Ring bell sound at cycle start</span>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={formChime} 
              onChange={e => { 
                setFormChime(e.target.checked); 
                handleInputChange('chimeSound', e.target.checked); 
              }} 
            />
            <span className="toggle-track"></span>
            <span className="toggle-knob"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

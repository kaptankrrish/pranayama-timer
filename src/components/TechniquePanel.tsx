import React from 'react';
import { Wind, Moon, Flame, Heart, Snowflake, Activity, Brain, Plus, Trash2, X } from 'lucide-react';
import { Technique, SettingsData } from '../types';

interface TechniquePanelProps {
  allPresets: Technique[];
  customPresets: Technique[];
  selectedPreset: string;
  applyPreset: (preset: Technique) => void;
  handleDeletePreset: (name: string, e: React.MouseEvent) => void;
  handleCreateCustomPreset: (e: React.FormEvent) => void;
  newPresetName: string;
  setNewPresetName: (v: string) => void;
  newPresetSanskrit: string;
  setNewPresetSanskrit: (v: string) => void;
  newPresetCategory: 'Calm' | 'Energy' | 'Sleep' | 'Balance';
  setNewPresetCategory: (v: 'Calm' | 'Energy' | 'Sleep' | 'Balance') => void;
  newPresetInhale: number;
  setNewPresetInhale: (v: number) => void;
  newPresetHold1: number;
  setNewPresetHold1: (v: number) => void;
  newPresetExhale: number;
  setNewPresetExhale: (v: number) => void;
  newPresetHold2: number;
  setNewPresetHold2: (v: number) => void;
  newPresetRounds: number;
  setNewPresetRounds: (v: number) => void;
  isCreatingPreset: boolean;
  setIsCreatingPreset: (v: boolean) => void;
  settings: SettingsData;
}

export function TechniquePanel({
  allPresets,
  customPresets,
  selectedPreset,
  applyPreset,
  handleDeletePreset,
  handleCreateCustomPreset,
  newPresetName,
  setNewPresetName,
  newPresetSanskrit,
  setNewPresetSanskrit,
  newPresetCategory,
  setNewPresetCategory,
  newPresetInhale,
  setNewPresetInhale,
  newPresetHold1,
  setNewPresetHold1,
  newPresetExhale,
  setNewPresetExhale,
  newPresetHold2,
  setNewPresetHold2,
  newPresetRounds,
  setNewPresetRounds,
  isCreatingPreset,
  setIsCreatingPreset,
  settings,
}: TechniquePanelProps) {

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
    const IconComponent = icon;
    return <IconComponent size={size} />;
  };

  const handleStartCreate = () => {
    setNewPresetInhale(settings.inhale);
    setNewPresetHold1(settings.hold1);
    setNewPresetExhale(settings.exhale);
    setNewPresetHold2(settings.hold2);
    setNewPresetRounds(settings.rounds);
    setIsCreatingPreset(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {isCreatingPreset ? (
        <form onSubmit={handleCreateCustomPreset} className="create-form">
          <div className="form-head">
            <span className="form-head-title">New Technique</span>
            <button type="button" className="form-close" onClick={() => setIsCreatingPreset(false)}>
              <X size={16} />
            </button>
          </div>
          
          <div className="form-fields">
            <div className="field">
              <label className="field-label" htmlFor="pn">Name</label>
              <input 
                id="pn" 
                className="field-input" 
                type="text" 
                placeholder="e.g. Ocean Calm" 
                value={newPresetName} 
                onChange={e => setNewPresetName(e.target.value)} 
                maxLength={25} 
                required 
              />
            </div>
            
            <div className="field">
              <label className="field-label" htmlFor="ps">Sanskrit Name</label>
              <input 
                id="ps" 
                className="field-input" 
                type="text" 
                placeholder="e.g. Samudra Pranayama" 
                value={newPresetSanskrit} 
                onChange={e => setNewPresetSanskrit(e.target.value)} 
                maxLength={30} 
              />
            </div>
            
            <div className="form-row-2">
              <div className="field">
                <label className="field-label" htmlFor="pc">Category</label>
                <select 
                  id="pc" 
                  className="field-select" 
                  value={newPresetCategory} 
                  onChange={e => setNewPresetCategory(e.target.value as any)}
                >
                  <option value="Calm">Calm</option>
                  <option value="Energy">Energy</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Balance">Balance</option>
                </select>
              </div>
              
              <div className="field">
                <label className="field-label" htmlFor="pr">Rounds</label>
                <input 
                  id="pr" 
                  className="field-input" 
                  type="number" 
                  min="0" 
                  max="99" 
                  value={newPresetRounds} 
                  onChange={e => setNewPresetRounds(parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
            
            <div className="field">
              <span className="field-label">Ratio (In - Hold - Out - Empty)</span>
              <div className="form-row-4">
                <div className="field">
                  <input 
                    className="field-input" 
                    type="number" 
                    min="1" 
                    max="25" 
                    value={newPresetInhale} 
                    onChange={e => setNewPresetInhale(Math.max(1, parseInt(e.target.value) || 1))} 
                    placeholder="In" 
                    required 
                  />
                  <span className="num-label">In</span>
                </div>
                <div className="field">
                  <input 
                    className="field-input" 
                    type="number" 
                    min="0" 
                    max="25" 
                    value={newPresetHold1} 
                    onChange={e => setNewPresetHold1(Math.max(0, parseInt(e.target.value) || 0))} 
                    placeholder="Hold" 
                  />
                  <span className="num-label">Hold</span>
                </div>
                <div className="field">
                  <input 
                    className="field-input" 
                    type="number" 
                    min="1" 
                    max="25" 
                    value={newPresetExhale} 
                    onChange={e => setNewPresetExhale(Math.max(1, parseInt(e.target.value) || 1))} 
                    placeholder="Out" 
                    required 
                  />
                  <span className="num-label">Out</span>
                </div>
                <div className="field">
                  <input 
                    className="field-input" 
                    type="number" 
                    min="0" 
                    max="25" 
                    value={newPresetHold2} 
                    onChange={e => setNewPresetHold2(Math.max(0, parseInt(e.target.value) || 0))} 
                    placeholder="Empty" 
                  />
                  <span className="num-label">Empty</span>
                </div>
              </div>
            </div>
          </div>
          
          <button type="submit" className="form-submit">Save Technique</button>
        </form>
      ) : (
        <button className="create-btn" onClick={handleStartCreate}>
          <Plus size={16} /> Create Custom
        </button>
      )}

      <div className="preset-list">
        {allPresets.map(p => {
          const isCustom = customPresets.some(cp => cp.name === p.name);
          const isSelected = selectedPreset === p.name;
          return (
            <button 
              key={p.name} 
              className={`preset-card ${isSelected ? 'selected' : ''} ${p.category}`} 
              onClick={() => applyPreset(p)}
            >
              <div className="preset-top">
                <div className="preset-icon">{renderIcon(p.icon)}</div>
                <div className="preset-info">
                  <div className="preset-name">{p.name}</div>
                  <div className="preset-sub">{p.sanskrit}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="preset-ratio">{p.inhale}-{p.hold1}-{p.exhale}-{p.hold2}</span>
                  {isCustom && (
                    <button 
                      className="preset-del" 
                      onClick={(e) => handleDeletePreset(p.name, e)} 
                      title="Delete custom preset"
                      aria-label="Delete custom preset"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p className="preset-desc">{p.desc}</p>
              <div className="preset-ratio-bar">
                {p.inhale > 0 && <div className="ratio-segment ratio-inhale" style={{ flexGrow: p.inhale }} title={`Inhale: ${p.inhale}s`}></div>}
                {p.hold1 > 0 && <div className="ratio-segment ratio-hold" style={{ flexGrow: p.hold1 }} title={`Hold In: ${p.hold1}s`}></div>}
                {p.exhale > 0 && <div className="ratio-segment ratio-exhale" style={{ flexGrow: p.exhale }} title={`Exhale: ${p.exhale}s`}></div>}
                {p.hold2 > 0 && <div className="ratio-segment ratio-hold2" style={{ flexGrow: p.hold2 }} title={`Hold Empty: ${p.hold2}s`}></div>}
              </div>
              <span className="preset-tag">{p.category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

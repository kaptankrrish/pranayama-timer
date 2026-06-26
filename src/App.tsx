import { useState, useEffect } from 'react';
import { Compass, Activity, Trophy, Eye, EyeOff, CheckSquare, Clock } from 'lucide-react';

// Subcomponents
import { Navbar } from './components/Navbar';
import { BreathingOrb } from './components/BreathingOrb';
import { PhaseDisplay } from './components/PhaseDisplay';
import { Controls } from './components/Controls';
import { TechniquePanel } from './components/TechniquePanel';
import { CustomizePanel } from './components/CustomizePanel';
import { TasksPanel } from './components/TasksPanel';
import { StatsPanel } from './components/StatsPanel';
import { EducationSection } from './components/EducationSection';
import { MobileNav } from './components/MobileNav';
import { NoiseOverlay } from './components/NoiseOverlay';

// Hooks
import { useStats } from './hooks/useStats';
import { useAmbientAudio } from './hooks/useAmbientAudio';
import { useBreathingEngine } from './hooks/useBreathingEngine';

// Data & Types
import { presets } from './data/techniques';
import { SettingsData, TabType, PageType, TodoItem, MindfulTimer, MindfulStopwatch, Technique } from './types';

const DEFAULT_SETTINGS: SettingsData = {
  inhale: 4,
  hold1: 4,
  exhale: 4,
  hold2: 4,
  rounds: 4,
  voiceGuidance: true,
  chimeSound: true,
};

const DEFAULT_TODOS: TodoItem[] = [
  { id: '1', text: 'Practice 4 rounds of Box Breathing', completed: false, createdAt: new Date().toISOString() },
  { id: '2', text: 'Log a calming evening 4-7-8 session', completed: false, createdAt: new Date().toISOString() },
  { id: '3', text: 'Maintain a 3-day breathing streak', completed: false, createdAt: new Date().toISOString() },
];

export default function App() {
  // 1. Settings & Preset States
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('pranayamaSettingsReact');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('Box Breathing');
  const [customPresets, setCustomPresets] = useState<Technique[]>(() => {
    const saved = localStorage.getItem('pranayamaCustomPresets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading custom presets', e);
      }
    }
    return [];
  });

  const allPresets = [...presets, ...customPresets];

  // 2. Tab Navigation States
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [mobileTab, setMobileTab] = useState<'breathe' | 'library' | 'adjust' | 'todo' | 'journal'>('breathe');
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'timers' | 'stopwatches'>('tasks');
  const [currentPage, setCurrentPage] = useState<PageType>('breathe');
  const [isZenMode, setIsZenMode] = useState(false);

  // 3. Form input states for Customize Panel
  const [formInhale, setFormInhale] = useState(() => settings.inhale);
  const [formHold1, setFormHold1] = useState(() => settings.hold1);
  const [formExhale, setFormExhale] = useState(() => settings.exhale);
  const [formHold2, setFormHold2] = useState(() => settings.hold2);
  const [formRounds, setFormRounds] = useState(() => settings.rounds);
  const [formVoice, setFormVoice] = useState(() => settings.voiceGuidance);
  const [formChime, setFormChime] = useState(() => settings.chimeSound);

  // 4. Form states for Custom Preset creator
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetSanskrit, setNewPresetSanskrit] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<'Calm' | 'Energy' | 'Sleep' | 'Balance'>('Calm');
  const [newPresetInhale, setNewPresetInhale] = useState(4);
  const [newPresetHold1, setNewPresetHold1] = useState(4);
  const [newPresetExhale, setNewPresetExhale] = useState(4);
  const [newPresetHold2, setNewPresetHold2] = useState(4);
  const [newPresetRounds, setNewPresetRounds] = useState(4);

  // 5. Todos, Timers & Stopwatches States
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('pranayamaTodos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_TODOS;
  });
  const [newTodoText, setNewTodoText] = useState('');

  const [mindfulTimers, setMindfulTimers] = useState<MindfulTimer[]>(() => {
    const saved = localStorage.getItem('pranayamaTimers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [mindfulStopwatches, setMindfulStopwatches] = useState<MindfulStopwatch[]>(() => {
    const saved = localStorage.getItem('pranayamaStopwatches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerLabel, setTimerLabel] = useState('');
  const [stopwatchLabel, setStopwatchLabel] = useState('');

  // Save todos, timers, stopwatches to local storage on changes
  useEffect(() => {
    localStorage.setItem('pranayamaTodos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('pranayamaTimers', JSON.stringify(mindfulTimers));
  }, [mindfulTimers]);

  useEffect(() => {
    localStorage.setItem('pranayamaStopwatches', JSON.stringify(mindfulStopwatches));
  }, [mindfulStopwatches]);

  // 6. Custom hooks integration
  const { stats, logPracticeSession } = useStats();
  const {
    selectedSound,
    audioVolume,
    handleSoundChange,
    handleVolumeChange,
    playChime,
    announcePhase,
    speak,
    updateAmbientState,
  } = useAmbientAudio();

  const {
    phase,
    isRunning,
    currentRound,
    timeRemaining,
    phaseKey,
    handleStartPause,
    handleReset,
    handleSkipPhase,
  } = useBreathingEngine({
    settings,
    selectedPreset,
    logPracticeSession,
    playChime,
    announcePhase,
    speak,
  });

  // Sync ambient sound contexts to current playback status
  useEffect(() => {
    updateAmbientState(isRunning);
  }, [isRunning, selectedSound, audioVolume]);

  // Global interval loop for concurrent timers and stopwatches ticking
  useEffect(() => {
    const interval = setInterval(() => {
      // Tick active countdown timers
      setMindfulTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning) return t;
          const nextTime = t.timeRemaining - 1;
          if (nextTime <= 0) {
            playChime('complete', settings.chimeSound);
            return { ...t, timeRemaining: 0, isRunning: false };
          }
          return { ...t, timeRemaining: nextTime };
        })
      );

      // Tick active stopwatches
      setMindfulStopwatches((prev) =>
        prev.map((s) => {
          if (!s.isRunning) return s;
          return { ...s, elapsedSeconds: s.elapsedSeconds + 1 };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.chimeSound]);

  // 7. Form Handlers & Sync
  const syncForm = (d: SettingsData) => {
    setFormInhale(d.inhale);
    setFormHold1(d.hold1);
    setFormExhale(d.exhale);
    setFormHold2(d.hold2);
    setFormRounds(d.rounds);
    setFormVoice(d.voiceGuidance);
    setFormChime(d.chimeSound);
  };

  const applyPreset = (preset: Technique) => {
    const s: SettingsData = {
      inhale: preset.inhale,
      hold1: preset.hold1,
      exhale: preset.exhale,
      hold2: preset.hold2,
      rounds: preset.rounds,
      voiceGuidance: settings.voiceGuidance,
      chimeSound: settings.chimeSound,
    };
    setSettings(s);
    syncForm(s);
    setSelectedPreset(preset.name);
    localStorage.setItem('pranayamaSettingsReact', JSON.stringify(s));
    handleReset();
  };

  const handleInputChange = (field: keyof SettingsData, val: any) => {
    const s = { ...settings, [field]: val };
    setSettings(s);
    setSelectedPreset('Custom');
    localStorage.setItem('pranayamaSettingsReact', JSON.stringify(s));
    handleReset();
  };

  const handleCreateCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    if (allPresets.some((p) => p.name.toLowerCase() === newPresetName.trim().toLowerCase())) return;

    const np: Technique = {
      name: newPresetName.trim(),
      sanskrit: newPresetSanskrit.trim() || 'Custom Pranayama',
      desc: `Custom breathing with ${newPresetInhale}s In, ${newPresetHold1}s Hold, ${newPresetExhale}s Out, ${newPresetHold2}s Hold.`,
      icon:
        newPresetCategory === 'Calm'
          ? 'Heart'
          : newPresetCategory === 'Energy'
          ? 'Flame'
          : newPresetCategory === 'Sleep'
          ? 'Moon'
          : 'Activity',
      inhale: newPresetInhale,
      hold1: newPresetHold1,
      exhale: newPresetExhale,
      hold2: newPresetHold2,
      rounds: newPresetRounds,
      category: newPresetCategory,
    };

    const updated = [...customPresets, np];
    setCustomPresets(updated);
    localStorage.setItem('pranayamaCustomPresets', JSON.stringify(updated));
    applyPreset(np);

    setNewPresetName('');
    setNewPresetSanskrit('');
    setNewPresetCategory('Calm');
    setIsCreatingPreset(false);
    playChime('complete', settings.chimeSound);
  };

  const handleDeletePreset = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.name !== name);
    setCustomPresets(updated);
    localStorage.setItem('pranayamaCustomPresets', JSON.stringify(updated));
    if (selectedPreset === name) applyPreset(presets[0]);
  };

  // 8. Todo Actions
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const nt: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, nt]);
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // 9. Timer Actions
  const handleAddTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = timerMinutes * 60 + timerSeconds;
    if (duration <= 0) return;

    const minutesPart = timerMinutes > 0 ? `${timerMinutes}m` : '';
    const secondsPart = timerSeconds > 0 ? `${timerSeconds}s` : '';
    const fallbackLabel = `Timer (${[minutesPart, secondsPart].filter(Boolean).join(' ') || '0s'})`;

    const nt: MindfulTimer = {
      id: Date.now().toString(),
      label: timerLabel.trim() || fallbackLabel,
      totalDuration: duration,
      timeRemaining: duration,
      isRunning: false,
    };
    setMindfulTimers((prev) => [...prev, nt]);
    setTimerLabel('');
    setTimerMinutes(5);
    setTimerSeconds(0);
  };

  const handleToggleTimer = (id: string) => {
    setMindfulTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const timeRemaining = t.timeRemaining <= 0 ? t.totalDuration : t.timeRemaining;
          return { ...t, timeRemaining, isRunning: !t.isRunning };
        }
        return t;
      })
    );
  };

  const handleResetTimer = (id: string) => {
    setMindfulTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, timeRemaining: t.totalDuration, isRunning: false } : t))
    );
  };

  const handleDeleteTimer = (id: string) => {
    setMindfulTimers((prev) => prev.filter((t) => t.id !== id));
  };

  // 10. Stopwatch Actions
  const handleAddStopwatch = (e: React.FormEvent) => {
    e.preventDefault();
    const ns: MindfulStopwatch = {
      id: Date.now().toString(),
      label: stopwatchLabel.trim() || `Stopwatch`,
      elapsedSeconds: 0,
      isRunning: false,
      laps: [],
    };
    setMindfulStopwatches((prev) => [...prev, ns]);
    setStopwatchLabel('');
  };

  const handleToggleStopwatch = (id: string) => {
    setMindfulStopwatches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isRunning: !s.isRunning } : s))
    );
  };

  const handleResetStopwatch = (id: string) => {
    setMindfulStopwatches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, elapsedSeconds: 0, laps: [], isRunning: false } : s))
    );
  };

  const handleAddLap = (id: string) => {
    setMindfulStopwatches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, laps: [...s.laps, s.elapsedSeconds] } : s))
    );
  };

  const handleDeleteStopwatch = (id: string) => {
    setMindfulStopwatches((prev) => prev.filter((s) => s.id !== id));
  };

  // 11. Visual Rendering Math Helpers
  const getCircleScale = () => {
    if (!isRunning && phase === 'ready') return 1.0;
    if (phase === 'prep') return 1.0;
    if (phase === 'complete') return 1.0;
    switch (phase) {
      case 'inhale':
        return 1.0 + 0.85 * ((settings.inhale - timeRemaining) / settings.inhale);
      case 'hold1':
        return 1.85;
      case 'exhale':
        return 1.85 - 0.85 * ((settings.exhale - timeRemaining) / settings.exhale);
      case 'hold2':
        return 1.0;
      default:
        return 1.0;
    }
  };

  const getOrbStyle = () => {
    const dur = getPhaseDuration();
    if (!isRunning) {
      return {
        transform: `scale(${getCircleScale()})`,
        transition: 'transform 0.4s ease-out',
      } as React.CSSProperties;
    }
    return {
      '--phase-duration': `${dur}s`,
      transform: `scale(${getCircleScale()})`,
      transition: 'transform 1s linear',
    } as React.CSSProperties;
  };

  const getPhaseClass = () => {
    const map: Record<string, string> = {
      ready: 't-ready',
      prep: 't-prep',
      inhale: 't-inhale',
      hold1: 't-hold',
      exhale: 't-exhale',
      hold2: 't-hold2',
      complete: 't-done',
    };
    return `${map[phase] || 't-ready'} ${isZenMode ? 'zm' : ''} ${isRunning ? 'running' : ''}`;
  };

  const getPhaseName = () => {
    const map: Record<string, string> = {
      prep: 'Prepare',
      inhale: 'Inhale',
      hold1: 'Hold In',
      exhale: 'Exhale',
      hold2: 'Hold Empty',
      complete: 'Rest',
    };
    return map[phase] || 'Ready';
  };

  const getPhaseInstruction = () => {
    const active = allPresets.find((p) => p.name === selectedPreset);
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
    if (phase === 'inhale') {
      const p = Math.sin(((settings.inhale - timeRemaining) / settings.inhale - 0.5) * Math.PI) * 0.5 + 0.5;
      y = 48 - p * 38;
    } else if (phase === 'hold1') {
      y = 10;
    } else if (phase === 'exhale') {
      const p = Math.sin(((settings.exhale - timeRemaining) / settings.exhale - 0.5) * Math.PI) * 0.5 + 0.5;
      y = 10 + p * 38;
    } else if (phase === 'hold2') {
      y = 48;
    }
    return { x, y };
  };

  const getPhaseDuration = () => {
    switch (phase) {
      case 'inhale':
        return settings.inhale;
      case 'hold1':
        return settings.hold1;
      case 'exhale':
        return settings.exhale;
      case 'hold2':
        return settings.hold2;
      case 'prep':
        return 2;
      default:
        return 0;
    }
  };

  const getPhaseProgress = () => {
    const dur = getPhaseDuration();
    if (dur === 0) return 0;
    return (dur - timeRemaining) / dur;
  };

  const getPhaseIndex = () => {
    switch (phase) {
      case 'inhale':
        return 0;
      case 'hold1':
        return 1;
      case 'exhale':
        return 2;
      case 'hold2':
        return 3;
      default:
        return -1;
    }
  };

  const getPhaseAction = () => {
    switch (phase) {
      case 'ready':
        return 'READY';
      case 'prep':
        return 'PREPARE';
      case 'inhale':
        return 'BREATHE IN';
      case 'hold1':
        return 'HOLD';
      case 'exhale':
        return 'BREATHE OUT';
      case 'hold2':
        return 'HOLD EMPTY';
      case 'complete':
        return 'COMPLETE';
      default:
        return 'READY';
    }
  };

  const cursor = getWaveCursor();

  return (
    <div className={`app ${getPhaseClass()} m-tab-${mobileTab}`}>
      {/* Dynamic Animated Noise Filter */}
      <NoiseOverlay />

      {/* Reactive background gradients and ambient lights */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Fixed top Floating pill Header */}
      <Navbar
        streak={stats.streak}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setMobileTab={setMobileTab}
        handleReset={handleReset}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {currentPage === 'breathe' ? (
      <div className="main">
        {/* Sidebar panels navigation */}
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-head">
            <span className="sidebar-title">
              {activeTab === 'presets' && (
                <>
                  <Compass size={14} /> Techniques
                </>
              )}
              {activeTab === 'customize' && (
                <>
                  <Activity size={14} /> Customize Ratio
                </>
              )}
              {activeTab === 'stats' && (
                <>
                  <Trophy size={14} /> Progress Journal
                </>
              )}
            </span>

            <div className="tabs">
              <button
                className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('presets');
                  setMobileTab('library');
                }}
              >
                Presets
              </button>
              <button
                className={`tab ${activeTab === 'customize' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('customize');
                  setMobileTab('adjust');
                }}
              >
                Ratio
              </button>
              <button
                className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('stats');
                  setMobileTab('journal');
                }}
              >
                Stats
              </button>
            </div>
          </div>

          {/* Sidebar Tab Panels View */}
          {activeTab === 'presets' && (
            <TechniquePanel
              allPresets={allPresets}
              customPresets={customPresets}
              selectedPreset={selectedPreset}
              applyPreset={applyPreset}
              handleDeletePreset={handleDeletePreset}
              handleCreateCustomPreset={handleCreateCustomPreset}
              newPresetName={newPresetName}
              setNewPresetName={setNewPresetName}
              newPresetSanskrit={newPresetSanskrit}
              setNewPresetSanskrit={setNewPresetSanskrit}
              newPresetCategory={newPresetCategory}
              setNewPresetCategory={setNewPresetCategory}
              newPresetInhale={newPresetInhale}
              setNewPresetInhale={setNewPresetInhale}
              newPresetHold1={newPresetHold1}
              setNewPresetHold1={setNewPresetHold1}
              newPresetExhale={newPresetExhale}
              setNewPresetExhale={setNewPresetExhale}
              newPresetHold2={newPresetHold2}
              setNewPresetHold2={setNewPresetHold2}
              newPresetRounds={newPresetRounds}
              setNewPresetRounds={setNewPresetRounds}
              isCreatingPreset={isCreatingPreset}
              setIsCreatingPreset={setIsCreatingPreset}
              settings={settings}
            />
          )}

          {activeTab === 'customize' && (
            <CustomizePanel
              settings={settings}
              formInhale={formInhale}
              setFormInhale={setFormInhale}
              formHold1={formHold1}
              setFormHold1={setFormHold1}
              formExhale={formExhale}
              setFormExhale={setFormExhale}
              formHold2={formHold2}
              setFormHold2={setFormHold2}
              formRounds={formRounds}
              setFormRounds={setFormRounds}
              formVoice={formVoice}
              setFormVoice={setFormVoice}
              formChime={formChime}
              setFormChime={setFormChime}
              handleInputChange={handleInputChange}
            />
          )}

          {activeTab === 'stats' && <StatsPanel stats={stats} />}
        </aside>

        {/* Central visualizer breath-work stage */}
        <section className="zen">
          <div className="zen-top">
            <div className="preset-badge">
              <strong>{selectedPreset}</strong>
              <span className="ratio">
                {settings.inhale}-{settings.hold1}-{settings.exhale}-{settings.hold2}
              </span>
            </div>
            
            <button className={`zen-btn ${isZenMode ? 'on' : ''}`} onClick={() => setIsZenMode(!isZenMode)}>
              {isZenMode ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>{isZenMode ? 'Exit Zen' : 'Zen Mode'}</span>
            </button>
          </div>

          <div className="breath-stage">
            {/* Viewport-scaled phase displays */}
            <PhaseDisplay
              phase={phase}
              phaseKey={phaseKey}
              getPhaseAction={getPhaseAction}
              getPhaseName={getPhaseName}
            />

            {/* Liquid morphing breathing orb */}
            <BreathingOrb
              phase={phase}
              isRunning={isRunning}
              timeRemaining={timeRemaining}
              settings={settings}
              getPhaseProgress={getPhaseProgress}
              getPhaseIndex={getPhaseIndex}
              getPhaseInstruction={getPhaseInstruction}
              getOrbStyle={getOrbStyle}
            />
          </div>

          {/* Session controllers & chimes */}
          <Controls
            phase={phase}
            isRunning={isRunning}
            currentRound={currentRound}
            settings={settings}
            handleReset={handleReset}
            handleStartPause={handleStartPause}
            handleSkipPhase={handleSkipPhase}
            selectedSound={selectedSound}
              audioVolume={audioVolume}
              handleSoundChange={handleSoundChange}
              handleVolumeChange={handleVolumeChange}
              cursor={cursor}
              getWavePath={getWavePath}
            />
          </section>
        </div>
      ) : (
        <div className="full-page-container">
          <div className="full-page-content">
            <TasksPanel
              todos={todos}
              newTodoText={newTodoText}
              setNewTodoText={setNewTodoText}
              handleAddTodo={handleAddTodo}
              handleToggleTodo={handleToggleTodo}
              handleDeleteTodo={handleDeleteTodo}
              mindfulTimers={mindfulTimers}
              timerLabel={timerLabel}
              setTimerLabel={setTimerLabel}
              timerMinutes={timerMinutes}
              setTimerMinutes={setTimerMinutes}
              timerSeconds={timerSeconds}
              setTimerSeconds={setTimerSeconds}
              handleAddTimer={handleAddTimer}
              handleToggleTimer={handleToggleTimer}
              handleResetTimer={handleResetTimer}
              handleDeleteTimer={handleDeleteTimer}
              mindfulStopwatches={mindfulStopwatches}
              stopwatchLabel={stopwatchLabel}
              setStopwatchLabel={setStopwatchLabel}
              handleAddStopwatch={handleAddStopwatch}
              handleToggleStopwatch={handleToggleStopwatch}
              handleResetStopwatch={handleResetStopwatch}
              handleAddLap={handleAddLap}
              handleDeleteStopwatch={handleDeleteStopwatch}
              activeSubTab={currentPage === 'tasks' ? 'tasks' : currentPage === 'timers' ? 'timers' : 'stopwatches'}
              setActiveSubTab={() => {}}
              isFullPage={true}
            />
          </div>
        </div>
      )}

      {/* Educational info cards triggers */}
      {!isZenMode && (
        <a href="#about" className="scroll-cta">
          <span>Explore breathing science</span>
          <Activity size={16} style={{ transform: 'rotate(90deg)', marginTop: '4px' }} />
        </a>
      )}

      {/* Information reveals sections on scroll */}
      <EducationSection />

      {/* Floating Apple Dock Bottom nav on mobile */}
      {!isZenMode && (
        <MobileNav
          mobileTab={mobileTab}
          setMobileTab={setMobileTab}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSubTab={activeSubTab}
        />
      )}
    </div>
  );
}
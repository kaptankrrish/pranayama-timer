import React from 'react';
import { Plus, Trash2, CheckSquare, Clock, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import { TodoItem, MindfulTimer, MindfulStopwatch } from '../types';

interface TasksPanelProps {
  todos: TodoItem[];
  newTodoText: string;
  setNewTodoText: (v: string) => void;
  handleAddTodo: (e: React.FormEvent) => void;
  handleToggleTodo: (id: string) => void;
  handleDeleteTodo: (id: string) => void;
  
  mindfulTimers: MindfulTimer[];
  timerLabel: string;
  setTimerLabel: (v: string) => void;
  timerMinutes: number;
  setTimerMinutes: (v: number) => void;
  timerSeconds: number;
  setTimerSeconds: (v: number) => void;
  handleAddTimer: (e: React.FormEvent) => void;
  handleToggleTimer: (id: string) => void;
  handleResetTimer: (id: string) => void;
  handleDeleteTimer: (id: string) => void;
  
  mindfulStopwatches: MindfulStopwatch[];
  stopwatchLabel: string;
  setStopwatchLabel: (v: string) => void;
  handleAddStopwatch: (e: React.FormEvent) => void;
  handleToggleStopwatch: (id: string) => void;
  handleResetStopwatch: (id: string) => void;
  handleAddLap: (id: string) => void;
  handleDeleteStopwatch: (id: string) => void;
  
  activeSubTab: 'tasks' | 'timers' | 'stopwatches';
  setActiveSubTab: (tab: 'tasks' | 'timers' | 'stopwatches') => void;
  isFullPage?: boolean;
}

export function TasksPanel({
  todos,
  newTodoText,
  setNewTodoText,
  handleAddTodo,
  handleToggleTodo,
  handleDeleteTodo,
  
  mindfulTimers,
  timerLabel,
  setTimerLabel,
  timerMinutes,
  setTimerMinutes,
  timerSeconds,
  setTimerSeconds,
  handleAddTimer,
  handleToggleTimer,
  handleResetTimer,
  handleDeleteTimer,
  
  mindfulStopwatches,
  stopwatchLabel,
  setStopwatchLabel,
  handleAddStopwatch,
  handleToggleStopwatch,
  handleResetStopwatch,
  handleAddLap,
  handleDeleteStopwatch,
  
  activeSubTab,
  setActiveSubTab,
  isFullPage = false,
}: TasksPanelProps) {

  const fmtDigitalTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const completedTodosCount = todos.filter(t => t.completed).length;

  return (
    <div className={`todo-panel ${isFullPage ? 'full-page-panel' : ''}`}>
      {/* Segmented Controller Subtabs */}
      {!isFullPage && (
        <div className="sub-tabs">
          <button 
            className={`sub-tab ${activeSubTab === 'tasks' ? 'active' : ''}`} 
            onClick={() => setActiveSubTab('tasks')}
          >
            Tasks
          </button>
          <button 
            className={`sub-tab ${activeSubTab === 'timers' ? 'active' : ''}`} 
            onClick={() => setActiveSubTab('timers')}
          >
            Timers
          </button>
          <button 
            className={`sub-tab ${activeSubTab === 'stopwatches' ? 'active' : ''}`} 
            onClick={() => setActiveSubTab('stopwatches')}
          >
            Stopwatch
          </button>
        </div>
      )}

      {/* 1. Daily Mindful Tasks subtab */}
      {activeSubTab === 'tasks' && (
        <>
          <div className="todo-header">
            <span className="todo-progress-text">
              {completedTodosCount} of {todos.length} completed
            </span>
          </div>
          <div className="todo-progress-bar">
            <div 
              className="todo-progress-fill" 
              style={{ width: `${todos.length > 0 ? (completedTodosCount / todos.length) * 100 : 0}%` }}
            ></div>
          </div>
          
          <form onSubmit={handleAddTodo} className="todo-form">
            <input 
              type="text" 
              className="todo-input" 
              placeholder="Add a mindful task..." 
              value={newTodoText} 
              onChange={e => setNewTodoText(e.target.value)} 
              maxLength={50}
              required
            />
            <button type="submit" className="todo-add-btn" aria-label="Add task">
              <Plus size={16} />
            </button>
          </form>
          
          <div className="todo-list">
            {todos.length === 0 ? (
              <div className="todo-empty">
                <CheckSquare size={28} />
                <p>All clear! Add a new mindfulness task above.</p>
              </div>
            ) : (
              todos.map(t => (
                <div key={t.id} className={`todo-item ${t.completed ? 'completed' : ''}`}>
                  <label className="todo-label">
                    <input 
                      type="checkbox" 
                      checked={t.completed} 
                      onChange={() => handleToggleTodo(t.id)} 
                      className="todo-checkbox"
                    />
                    <span className="todo-text">{t.text}</span>
                  </label>
                  <button 
                    onClick={() => handleDeleteTodo(t.id)} 
                    className="todo-del-btn" 
                    title="Delete task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* 2. Mindful Timers subtab */}
      {activeSubTab === 'timers' && (
        <div className="timers-section">
          <form onSubmit={handleAddTimer} className="todo-form timer-form-inputs">
            <input 
              type="text" 
              className="todo-input" 
              placeholder="Timer label (e.g. Focus)..." 
              value={timerLabel} 
              onChange={e => setTimerLabel(e.target.value)} 
              maxLength={20}
            />
            <div className="duration-inputs">
              <div className="duration-input-wrap">
                <input 
                  type="number" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="todo-input duration-num" 
                  min="0" 
                  max="180" 
                  value={timerMinutes} 
                  onChange={e => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Min"
                />
                <span className="duration-unit">m</span>
              </div>
              <div className="duration-input-wrap">
                <input 
                  type="number" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="todo-input duration-num" 
                  min="0" 
                  max="59" 
                  value={timerSeconds} 
                  onChange={e => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  placeholder="Sec"
                />
                <span className="duration-unit">s</span>
              </div>
            </div>
            <button type="submit" className="todo-add-btn" aria-label="Add timer" style={{ alignSelf: 'flex-end', width: '100%', height: '38px' }}>
              <Plus size={16} style={{ marginRight: '4px' }} /> Add Timer
            </button>
          </form>
          
          <div className="timers-list">
            {mindfulTimers.length === 0 ? (
              <div className="todo-empty">
                <Clock size={28} />
                <p>No timers yet. Add one above to begin.</p>
              </div>
            ) : (
              mindfulTimers.map(t => {
                const progressWidth = t.totalDuration > 0 ? (t.timeRemaining / t.totalDuration) * 100 : 0;
                return (
                  <div key={t.id} className={`timer-card ${t.timeRemaining === 0 ? 'completed' : ''}`}>
                    <div className="timer-card-header">
                      <span className="timer-card-label">{t.label}</span>
                      <button onClick={() => handleDeleteTimer(t.id)} className="timer-card-del" title="Delete timer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="timer-card-display">
                      {fmtDigitalTime(t.timeRemaining)}
                    </div>
                    <div className="timer-card-progress">
                      <div 
                        className="timer-card-progress-fill" 
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                    <div className="timer-card-controls">
                      <button onClick={() => handleToggleTimer(t.id)} className="timer-card-btn play">
                        {t.isRunning ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button onClick={() => handleResetTimer(t.id)} className="timer-card-btn reset">
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. Stopwatches subtab */}
      {activeSubTab === 'stopwatches' && (
        <div className="stopwatches-section">
          <form onSubmit={handleAddStopwatch} className="todo-form">
            <input 
              type="text" 
              className="todo-input" 
              placeholder="Stopwatch label (e.g. Retention)..." 
              value={stopwatchLabel} 
              onChange={e => setStopwatchLabel(e.target.value)} 
              maxLength={20}
            />
            <button type="submit" className="todo-add-btn" aria-label="Add stopwatch">
              <Plus size={16} />
            </button>
          </form>
          
          <div className="stopwatches-list">
            {mindfulStopwatches.length === 0 ? (
              <div className="todo-empty">
                <Activity size={28} />
                <p>No stopwatches yet. Add one above to begin.</p>
              </div>
            ) : (
              mindfulStopwatches.map(s => (
                <div key={s.id} className="stopwatch-card">
                  <div className="stopwatch-card-header">
                    <span className="stopwatch-card-label">{s.label}</span>
                    <button onClick={() => handleDeleteStopwatch(s.id)} className="stopwatch-card-del" title="Delete stopwatch">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="stopwatch-card-display">
                    {fmtDigitalTime(s.elapsedSeconds)}
                  </div>
                  <div className="stopwatch-card-controls">
                    <button onClick={() => handleToggleStopwatch(s.id)} className="stopwatch-card-btn play">
                      {s.isRunning ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button 
                      onClick={() => handleAddLap(s.id)} 
                      className="stopwatch-card-btn lap" 
                      disabled={!s.isRunning}
                      title="Record lap"
                    >
                      <Plus size={14} />
                    </button>
                    <button onClick={() => handleResetStopwatch(s.id)} className="stopwatch-card-btn reset">
                      <RotateCcw size={14} />
                    </button>
                  </div>
                  
                  {s.laps.length > 0 && (
                    <div className="stopwatch-laps">
                      {s.laps.map((l, idx) => (
                        <div key={idx} className="stopwatch-lap-item">
                          <span className="lap-num">Lap {idx + 1}</span>
                          <span className="lap-time">{fmtDigitalTime(l)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

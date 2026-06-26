
import { Trophy, Clock, Flame, Calendar, Award } from 'lucide-react';
import { BreathingStats } from '../types';

interface StatsPanelProps {
  stats: BreathingStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  
  const fmtTime = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const getWeeklyPracticeList = () => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      const hasPracticed = stats.history.some(h => h.date === dateStr);
      list.push({ dayName, dateStr, hasPracticed });
    }
    return list;
  };

  const weeklyList = getWeeklyPracticeList();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Bento Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <Award className="box-icon" size={20} style={{ color: 'var(--text-muted)' }} />
          <span className="stat-num">{stats.totalSessions}</span>
          <span className="stat-label">Sessions</span>
        </div>
        
        <div className="stat-card">
          <Clock className="box-icon" size={20} style={{ color: 'var(--text-muted)' }} />
          <span className="stat-num">{fmtTime(stats.totalSeconds)}</span>
          <span className="stat-label">Mindful Time</span>
        </div>
        
        <div className="stat-card wide">
          <Flame className="box-icon animate-fire" size={20} style={{ color: '#ff6b6b' }} />
          <span className="stat-num streak">🔥 {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</span>
          <span className="stat-label">Daily Streak</span>
        </div>
      </div>

      {/* Weekly Journey Calendar */}
      <div className="weekly-tracker">
        <span className="weekly-title">Weekly Journey</span>
        <div className="weekly-days">
          {weeklyList.map((w, idx) => (
            <div key={idx} className="weekly-day">
              <div 
                className={`weekly-circle ${w.hasPracticed ? 'completed' : ''}`} 
                title={w.dateStr}
              >
                {w.hasPracticed ? '🔥' : w.dayName[0]}
              </div>
              <span className="weekly-label">{w.dayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions list */}
      <span className="sidebar-title" style={{ marginTop: '4px' }}>
        <Calendar size={14} /> Recent Sessions
      </span>
      
      <div className="history-list">
        {stats.history.length === 0 ? (
          <div className="history-empty">
            <Trophy size={28} />
            <p>Complete your first practice to begin tracking.</p>
          </div>
        ) : (
          stats.history.map((h, i) => (
            <div key={i} className="history-item">
              <div className="history-left">
                <span className="history-name">{h.technique}</span>
                <span className="history-date">{h.date}</span>
              </div>
              <div className="history-right">
                <span className="history-dur">{fmtTime(h.duration)}</span>
                <span className="history-rounds">{h.rounds} {h.rounds === 1 ? 'round' : 'rounds'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

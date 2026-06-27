
import { Wind, CheckSquare, Clock, Timer, Trophy } from 'lucide-react';
import { TabType } from '../types';

interface MobileNavProps {
  mobileTab: 'breathe' | 'tasks' | 'timers' | 'stopwatches' | 'journal';
  setMobileTab: (tab: 'breathe' | 'tasks' | 'timers' | 'stopwatches' | 'journal') => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setCurrentPage: (page: 'breathe' | 'tasks' | 'timers' | 'stopwatches' | 'journal') => void;
}

export function MobileNav({
  mobileTab,
  setMobileTab,
  activeTab: _activeTab,
  setActiveTab,
  setCurrentPage,
}: MobileNavProps) {
  const tabsOrder: Array<'breathe' | 'tasks' | 'timers' | 'stopwatches' | 'journal'> = [
    'breathe',
    'tasks',
    'timers',
    'stopwatches',
    'journal',
  ];
  
  const activeIdx = tabsOrder.indexOf(mobileTab);

  const indicatorStyle: React.CSSProperties = {
    left: `calc((100% / 5) * ${activeIdx} + 6px)`,
    width: `calc((100% / 5) - 12px)`,
    top: '8px',
    height: '48px',
  };

  const handleTabClick = (tab: 'breathe' | 'tasks' | 'timers' | 'stopwatches' | 'journal') => {
    setMobileTab(tab);
    if (tab === 'breathe') {
      setActiveTab('presets');
      setCurrentPage('breathe');
    }
    if (tab === 'tasks') {
      setActiveTab('presets');
      setCurrentPage('tasks');
    }
    if (tab === 'timers') {
      setActiveTab('presets');
      setCurrentPage('timers');
    }
    if (tab === 'stopwatches') {
      setActiveTab('presets');
      setCurrentPage('stopwatches');
    }
    if (tab === 'journal') {
      setActiveTab('stats');
      setCurrentPage('journal');
    }
  };

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-indicator" style={indicatorStyle}></div>

      {/* 1. Breathe Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'breathe' ? 'active' : ''}`} 
        onClick={() => handleTabClick('breathe')}
      >
        <Wind size={20} />
        <span>Breathe</span>
      </button>

      {/* 2. Tasks Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'tasks' ? 'active' : ''}`} 
        onClick={() => handleTabClick('tasks')}
      >
        <CheckSquare size={20} />
        <span>Tasks</span>
      </button>

      {/* 3. Timers Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'timers' ? 'active' : ''}`} 
        onClick={() => handleTabClick('timers')}
      >
        <Clock size={20} />
        <span>Timers</span>
      </button>

      {/* 4. Stopwatches Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'stopwatches' ? 'active' : ''}`} 
        onClick={() => handleTabClick('stopwatches')}
      >
        <Timer size={20} />
        <span>Timer</span>
      </button>

      {/* 5. Journal Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'journal' ? 'active' : ''}`} 
        onClick={() => handleTabClick('journal')}
      >
        <Trophy size={20} />
        <span>Journey</span>
      </button>
    </div>
  );
}

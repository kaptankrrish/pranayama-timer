
import { Wind, Compass, Sliders, CheckSquare, Clock, Activity, Trophy } from 'lucide-react';
import { TabType } from '../types';

interface MobileNavProps {
  mobileTab: 'breathe' | 'library' | 'adjust' | 'todo' | 'journal';
  setMobileTab: (tab: 'breathe' | 'library' | 'adjust' | 'todo' | 'journal') => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeSubTab: 'tasks' | 'timers' | 'stopwatches';
}

export function MobileNav({
  mobileTab,
  setMobileTab,
  activeTab: _activeTab,
  setActiveTab,
  activeSubTab,
}: MobileNavProps) {
  const tabsOrder: Array<'breathe' | 'library' | 'adjust' | 'todo' | 'journal'> = [
    'breathe',
    'library',
    'adjust',
    'todo',
    'journal',
  ];
  
  const activeIdx = tabsOrder.indexOf(mobileTab);

  // Compute the left style for the sliding indicator pill
  const indicatorStyle: React.CSSProperties = {
    left: `calc((100% / 5) * ${activeIdx} + 6px)`,
    width: `calc((100% / 5) - 12px)`,
    top: '8px',
    height: '48px',
  };

  const handleTabClick = (tab: 'breathe' | 'library' | 'adjust' | 'todo' | 'journal') => {
    setMobileTab(tab);
    if (tab === 'library') setActiveTab('presets');
    if (tab === 'adjust') setActiveTab('customize');
    if (tab === 'todo') setActiveTab('todo');
    if (tab === 'journal') setActiveTab('stats');
  };

  return (
    <div className="mobile-nav">
      {/* Sliding active tab indicator */}
      <div className="mobile-nav-indicator" style={indicatorStyle}></div>

      {/* 1. Breathe Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'breathe' ? 'active' : ''}`} 
        onClick={() => handleTabClick('breathe')}
      >
        <Wind size={20} />
        <span>Breathe</span>
      </button>

      {/* 2. Library Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'library' ? 'active' : ''}`} 
        onClick={() => handleTabClick('library')}
      >
        <Compass size={20} />
        <span>Library</span>
      </button>

      {/* 3. Adjust Ratio Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'adjust' ? 'active' : ''}`} 
        onClick={() => handleTabClick('adjust')}
      >
        <Sliders size={20} />
        <span>Adjust</span>
      </button>

      {/* 4. Tasks Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'todo' ? 'active' : ''}`} 
        onClick={() => handleTabClick('todo')}
      >
        {activeSubTab === 'tasks' && <CheckSquare size={20} />}
        {activeSubTab === 'timers' && <Clock size={20} />}
        {activeSubTab === 'stopwatches' && <Activity size={20} />}
        <span>
          {activeSubTab === 'tasks' && 'Tasks'}
          {activeSubTab === 'timers' && 'Timers'}
          {activeSubTab === 'stopwatches' && 'Stopwatch'}
        </span>
      </button>

      {/* 5. Journal / Stats Tab */}
      <button 
        className={`mobile-nav-btn ${mobileTab === 'journal' ? 'active' : ''}`} 
        onClick={() => handleTabClick('journal')}
      >
        <Trophy size={20} />
        <span>Journal</span>
      </button>
    </div>
  );
}

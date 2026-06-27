import React, { useState, useEffect } from 'react';
import { Wind, Moon, Sun } from 'lucide-react';
import { TabType, PageType } from '../types';

interface NavbarProps {
  streak: number;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setMobileTab: (tab: any) => void;
  handleReset: () => void;
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

export function Navbar({ streak, activeTab, setActiveTab, setMobileTab, handleReset, currentPage, setCurrentPage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('pranayamaTheme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pranayamaTheme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleStreakClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage('breathe');
    setActiveTab('stats');
    setMobileTab('journal');
    setTimeout(() => {
      document.getElementById('sidebar')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand" onClick={(e) => { e.preventDefault(); handleReset(); setCurrentPage('breathe'); }} href="#">
        <div className="brand-mark">
          <Wind />
        </div>
        <div className="brand-text">
          <span className="brand-name">Prana</span>
          <span className="brand-tag">Breathwork Studio</span>
        </div>
      </a>

      <div className="nav-links">
        <button className={`nav-link ${currentPage === 'breathe' ? 'active' : ''}`} onClick={() => setCurrentPage('breathe')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>Breathe</button>
        <button className={`nav-link ${currentPage === 'tasks' ? 'active' : ''}`} onClick={() => setCurrentPage('tasks')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>Tasks</button>
        <button className={`nav-link ${currentPage === 'timers' ? 'active' : ''}`} onClick={() => setCurrentPage('timers')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>Timers</button>
        <button className={`nav-link ${currentPage === 'stopwatches' ? 'active' : ''}`} onClick={() => setCurrentPage('stopwatches')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>Stopwatch</button>

        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle dark/light theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={handleStreakClick}
          title="View practice streak"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <span className="streak-badge">🔥 {streak}d</span>
        </button>
      </div>
    </nav>
  );
}

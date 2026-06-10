'use client';
import { useState, useEffect } from 'react';
import Landing from './Landing';
import ChatApp from './ChatApp';

const THEMES = ['velvet', 'foyer', 'daily'];
const THEME_COLORS: Record<string, string> = { velvet: '#2D4A3E', foyer: '#0F0D0B', daily: '#EDE7DA' };

export default function Home() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [theme, setTheme] = useState('velvet');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-shell grain" data-theme={theme}>
      {/* Theme switcher */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', gap: 8 }}>
        {THEMES.map(t => (
          <button
            key={t}
            className={`theme-btn ${theme === t ? 'active' : ''}`}
            onClick={() => setTheme(t)}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
            style={{ background: THEME_COLORS[t] }}
          />
        ))}
      </div>

      {view === 'landing'
        ? <Landing onLaunch={() => setView('chat')} />
        : <ChatApp onHome={() => setView('landing')} />
      }
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Landing from './Landing';
import ChatApp from './ChatApp';
import MyReel from './MyReel';

const THEMES = ['velvet', 'foyer', 'daily'];
const THEME_COLORS: Record<string, string> = { velvet: '#2D4A3E', foyer: '#0F0D0B', daily: '#EDE7DA' };

type FilmData = Record<string, unknown>;
type WatchlistEntry = { film: FilmData; status: 'saved' | 'seen'; rating?: number; review?: string };
type View = 'landing' | 'chat' | 'myreel';

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [theme, setTheme] = useState('velvet');
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('reel-watchlist');
    if (saved) { try { setWatchlist(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('reel-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  function handleAddToWatchlist(film: FilmData) {
    setWatchlist(prev => {
      const exists = prev.find(e => e.film.title === film.title);
      if (exists) return prev;
      return [...prev, { film, status: 'saved' }];
    });
  }

  function handleToggleSeen(film: FilmData, rating?: number, review?: string) {
    setWatchlist(prev => prev.map(e =>
      e.film.title === film.title
        ? { ...e, status: 'seen', rating: rating ?? e.rating, review: review ?? e.review }
        : e
    ));
  }

  function handleRemove(film: FilmData) {
    setWatchlist(prev => prev.filter(e => e.film.title !== film.title));
  }

  return (
    <div className="app-shell grain" data-theme={theme}>
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', gap: 8 }}>
        {THEMES.map(t => (
          <button key={t} className={`theme-btn ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)} title={t} style={{ background: THEME_COLORS[t] }} />
        ))}
      </div>

      {view === 'landing' && <Landing onLaunch={() => setView('chat')} />}
      {view === 'chat' && (
        <ChatApp
          onHome={() => setView('landing')}
          onMyReel={() => setView('myreel')}
          watchlist={watchlist}
          onAddToWatchlist={handleAddToWatchlist}
        />
      )}
      {view === 'myreel' && (
        <MyReel
          watchlist={watchlist}
          onToggleSeen={handleToggleSeen}
          onRemove={handleRemove}
          onBack={() => setView('chat')}
        />
      )}
    </div>
  );
}

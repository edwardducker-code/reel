'use client';
import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { STREAM_STYLE } from './filmData';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const cache = {};

async function fetchFilmData(title, year) {
  const cacheKey = `${title}-${year || ''}`;
  if (cache[cacheKey]) return cache[cacheKey];
  let url = `/api/tmdb?action=search&q=${encodeURIComponent(title)}`;
  if (year) url += `&year=${year}`;
  const searchRes = await fetch(url);
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();
  if (!searchData.id) return null;
  const detailRes = await fetch(`/api/tmdb?action=details&id=${searchData.id}`);
  if (!detailRes.ok) return null;
  const film = await detailRes.json();
  cache[cacheKey] = film;
  return film;
}

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', gap: 18, padding: 18, background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, maxWidth: 560, animation: 'pulse 1.4s ease-in-out infinite' }}>
      <div style={{ width: 128, height: 190, borderRadius: 8, background: 'var(--surface-2)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 26, width: '70%', borderRadius: 6, background: 'var(--surface-2)' }} />
        <div style={{ height: 14, width: '50%', borderRadius: 6, background: 'var(--surface-2)' }} />
        <div style={{ height: 60, borderRadius: 6, background: 'var(--surface-2)' }} />
      </div>
    </div>
  );
}

export default function TmdbCard({ title, year, onAdd, onDismiss, isAdded, isDismissed }) {
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null); // 'left' | 'right'
  const [exiting, setExiting] = useState(null); // 'left' | 'right'

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchFilmData(title, year).then(data => {
      if (cancelled) return;
      if (data) setFilm(data);
      else setError(true);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [title, year]);

  const handlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      setSwipeDelta(deltaX);
      setSwipeDir(deltaX > 0 ? 'right' : 'left');
    },
    onSwipedRight: () => {
      setExiting('right');
      setTimeout(() => onAdd && onAdd(film), 300);
    },
    onSwipedLeft: () => {
      setExiting('left');
      setTimeout(() => onDismiss && onDismiss(film), 300);
    },
    onTouchEndOrOnMouseUp: () => {
      if (!exiting) { setSwipeDelta(0); setSwipeDir(null); }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 40,
  });

  if (loading) return <SkeletonCard />;
  if (error || !film) return null;

  const posterUrl = film.poster_path ? `${POSTER_BASE}${film.poster_path}` : null;
  const rotation = Math.min(Math.max(swipeDelta / 20, -8), 8);
  const opacity = exiting ? 0 : 1;
  const translateX = exiting === 'right' ? 300 : exiting === 'left' ? -300 : swipeDelta * 0.4;

  const showSaveHint = swipeDir === 'right' || swipeDelta > 40;
  const showDismissHint = swipeDir === 'left' || swipeDelta < -40;

  return (
    <div
      {...handlers}
      style={{
        display: 'flex', gap: 18, padding: 18, maxWidth: 560,
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 16, boxShadow: 'var(--card-shadow)',
        position: 'relative', overflow: 'hidden',
        transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
        transition: exiting ? 'transform 0.3s ease, opacity 0.3s ease' : swipeDelta ? 'none' : 'transform 0.2s ease',
        opacity,
        cursor: 'grab',
        userSelect: 'none',
        outline: showSaveHint ? '2px solid #4caf50' : showDismissHint ? '2px solid #e05555' : '2px solid transparent',
      }}
    >
      {/* Swipe hint overlays */}
      {showSaveHint && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(76,175,80,0.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: '#4caf50', opacity: Math.min(Math.abs(swipeDelta) / 80, 1) }}>✓</span>
        </div>
      )}
      {showDismissHint && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(224,85,85,0.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: '#e05555', opacity: Math.min(Math.abs(swipeDelta) / 80, 1) }}>✕</span>
        </div>
      )}

      <div style={{ position: 'absolute', inset: 0, background: 'var(--card-sheen)', pointerEvents: 'none' }} />

      {/* Poster */}
      <div style={{ width: 128, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {posterUrl ? (
          <img src={posterUrl} alt={film.title} style={{ width: 128, height: 190, objectFit: 'cover', borderRadius: 8, boxShadow: '0 8px 22px rgba(0,0,0,.5)', display: 'block' }} />
        ) : (
          <div style={{ width: 128, height: 190, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Gloock',serif", fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 10 }}>
            {film.title}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Gloock',serif", fontSize: 22, lineHeight: 1.1, color: 'var(--ink-on-surface)' }}>{film.title}</h3>
          <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 12.5, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {film.year && <span>{film.year}</span>}
            {film.runtime && <><span>·</span><span>{film.runtime}</span></>}
            {film.dir && <><span>·</span><span>dir. {film.dir}</span></>}
          </div>
        </div>

        {/* TMDB Score */}
        {film.imdb && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 7, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 13, background: 'rgba(245,197,24,.14)', color: '#F5C518', border: '1px solid rgba(245,197,24,.32)' }}>
              ★ {film.imdb.toFixed(1)} <span style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>TMDB</span>
            </span>
          </div>
        )}

        {/* Overview */}
        {film.overview && (
          <p style={{ margin: '2px 0', fontFamily: "'Crimson Pro',serif", fontSize: 15, lineHeight: 1.45, color: 'var(--ink-soft)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {film.overview}
          </p>
        )}

        {/* Streaming */}
        {film.streaming && film.streaming.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: 2 }}>Stream</span>
            {film.streaming.map(w => (
              <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 11, color: 'var(--ink-on-surface)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: STREAM_STYLE[w] || '#888' }} />{w}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {isDismissed ? (
            <button
              onClick={() => onAdd && onAdd(film)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #4caf50', background: 'rgba(76,175,80,0.1)', color: '#4caf50', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              + Add to my reel anyway
            </button>
          ) : isAdded ? (
            <button
              disabled
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--hairline)', background: 'transparent', color: 'var(--muted)', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'default' }}
            >
              ✓ In my reel
            </button>
          ) : (
            <>
              <button
                onClick={() => { setExiting('left'); setTimeout(() => onDismiss && onDismiss(film), 300); }}
                style={{ width: 44, height: 38, borderRadius: 8, border: '1px solid rgba(224,85,85,0.4)', background: 'rgba(224,85,85,0.08)', color: '#e05555', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                title="Not for me"
              >
                ✕
              </button>
              <button
                onClick={() => { setExiting('right'); setTimeout(() => onAdd && onAdd(film), 300); }}
                style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid rgba(76,175,80,0.4)', background: 'rgba(76,175,80,0.08)', color: '#4caf50', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                ✓ Add to my reel
              </button>
            </>
          )}
        </div>

        {/* Mobile swipe hint */}
        <p style={{ margin: 0, fontFamily: "'Instrument Sans',sans-serif", fontSize: 11, color: 'var(--muted)', textAlign: 'center', opacity: 0.6 }}>
          swipe right to save · swipe left to dismiss
        </p>
      </div>
    </div>
  );
}

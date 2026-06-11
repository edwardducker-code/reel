'use client';
import { useState, useEffect } from 'react';
import { STREAM_STYLE } from './filmData';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

// Cache so we don't re-fetch the same film
const cache = {};

async function fetchFilmData(title, year) {
  const cacheKey = `${title}-${year || ''}`;
  if (cache[cacheKey]) return cache[cacheKey];

  // Step 1: search
  let url = `/api/tmdb?action=search&q=${encodeURIComponent(title)}`;
  if (year) url += `&year=${year}`;
  const searchRes = await fetch(url);
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();
  if (!searchData.id) return null;

  // Step 2: full details
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
        <div style={{ height: 14, width: '40%', borderRadius: 6, background: 'var(--surface-2)' }} />
        <div style={{ height: 60, borderRadius: 6, background: 'var(--surface-2)' }} />
      </div>
    </div>
  );
}

export default function TmdbCard({ title, year, onAdd, isAdded }) {
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  if (loading) return <SkeletonCard />;
  if (error || !film) return null;

  const posterUrl = film.poster_path ? `${POSTER_BASE}${film.poster_path}` : null;

  return (
    <div style={{
      display: 'flex', gap: 18, padding: 18, maxWidth: 560,
      background: 'var(--surface)', border: '1px solid var(--hairline)',
      borderRadius: 16, boxShadow: 'var(--card-shadow)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--card-sheen)', pointerEvents: 'none' }} />

      {/* Poster */}
      <div style={{ width: 128, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={film.title}
            style={{ width: 128, height: 190, objectFit: 'cover', borderRadius: 8, boxShadow: '0 8px 22px rgba(0,0,0,.5)', display: 'block' }}
          />
        ) : (
          <div style={{ width: 128, height: 190, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Gloock',serif", fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 10 }}>
            {film.title}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Gloock',serif", fontSize: 24, lineHeight: 1.04, color: 'var(--ink-on-surface)' }}>{film.title}</h3>
          <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 12.5, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {film.year && <span>{film.year}</span>}
            {film.runtime && <><span>·</span><span>{film.runtime}</span></>}
            {film.dir && <><span>·</span><span>dir. {film.dir}</span></>}
          </div>
        </div>

        {/* Score */}
        {film.imdb && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 13, background: 'rgba(245,197,24,.14)', color: '#F5C518', border: '1px solid rgba(245,197,24,.32)' }}>
              <b style={{ fontWeight: 800 }}>TMDB</b> {film.imdb.toFixed(1)}
            </span>
          </div>
        )}

        {/* Overview */}
        {film.overview && (
          <p style={{ margin: '2px 0', fontFamily: "'Crimson Pro',serif", fontSize: 16, lineHeight: 1.45, color: 'var(--ink-soft)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {film.overview}
          </p>
        )}

        {/* Streaming */}
        {film.streaming && film.streaming.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
            <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: 2 }}>Stream</span>
            {film.streaming.map(w => (
              <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--ink-on-surface)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: STREAM_STYLE[w] || '#888' }} />{w}
              </span>
            ))}
          </div>
        )}

        {/* Add button */}
        {onAdd && (
          <div style={{ marginTop: 2 }}>
            <button
              className={isAdded ? 'rc-btn rc-btn--ghost' : 'rc-btn rc-btn--gold'}
              onClick={() => onAdd(film)}
            >
              {isAdded ? '✓ In my reel' : '+ Add to my reel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

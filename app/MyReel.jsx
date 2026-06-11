'use client';
import { useState } from 'react';
import { ConnoIcon } from './Connossaurus';
import { STREAM_STYLE } from './filmData';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

function SwipeCard({ entry, onSeen, onRemove }) {
  const { film, status, rating, review } = entry;
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [startX, setStartX] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [localRating, setLocalRating] = useState(rating || 0);
  const [localReview, setLocalReview] = useState(review || '');
  const [saving, setSaving] = useState(false);

  const posterUrl = film.poster_path ? `${POSTER_BASE}${film.poster_path}` : null;
  const rotation = Math.min(Math.max(offsetX / 18, -12), 12);
  const likeOpacity = Math.min(offsetX / 80, 1);
  const nopeOpacity = Math.min(-offsetX / 80, 1);

  function onPointerDown(e) {
    setStartX(e.clientX);
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging || startX === null) return;
    setOffsetX(e.clientX - startX);
  }

  function onPointerUp() {
    if (offsetX > 100) {
      // Swipe right = seen
      onSeen(film);
    } else if (offsetX < -100) {
      // Swipe left = remove
      onRemove(film);
    }
    setDragging(false);
    setOffsetX(0);
    setStartX(null);
  }

  function saveReview() {
    setSaving(true);
    onSeen(film, localRating, localReview);
    setTimeout(() => setSaving(false), 400);
    setShowReview(false);
  }

  return (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      {/* Swipe hints */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, opacity: likeOpacity, transition: dragging ? 'none' : 'opacity .2s', border: '3px solid #4ED27B', borderRadius: 8, padding: '4px 10px', color: '#4ED27B', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 800, fontSize: 22, transform: 'rotate(-12deg)', pointerEvents: 'none' }}>
        SEEN ✓
      </div>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, opacity: nopeOpacity, transition: dragging ? 'none' : 'opacity .2s', border: '3px solid #E85050', borderRadius: 8, padding: '4px 10px', color: '#E85050', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 800, fontSize: 22, transform: 'rotate(12deg)', pointerEvents: 'none' }}>
        REMOVE ✕
      </div>

      {/* Card */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
          transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
          transition: dragging ? 'none' : 'transform .35s cubic-bezier(.2,.7,.2,1)',
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Poster */}
        <div style={{ position: 'relative', height: 320, background: 'var(--surface-2)', overflow: 'hidden' }}>
          {posterUrl
            ? <img src={posterUrl} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} /> // eslint-disable-line @next/next/no-img-element
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Gloock',serif", fontSize: 22, color: 'var(--muted)' }}>{film.title}</div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
            <h2 style={{ margin: 0, fontFamily: "'Gloock',serif", fontSize: 26, color: '#fff', lineHeight: 1.1 }}>{film.title}</h2>
            <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>
              {film.year}{film.dir ? ` · dir. ${film.dir}` : ''}{film.runtime ? ` · ${film.runtime}` : ''}
            </div>
          </div>
          {status === 'seen' && (
            <div style={{ position: 'absolute', top: 14, right: 14, background: '#4ED27B', color: '#0a1a10', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 700, fontSize: 12, borderRadius: 999, padding: '4px 10px' }}>✓ Seen</div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {film.overview && (
            <p style={{ margin: 0, fontFamily: "'Crimson Pro',serif", fontSize: 16, lineHeight: 1.45, color: 'var(--ink-soft)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {film.overview}
            </p>
          )}

          {/* Streaming */}
          {film.streaming && film.streaming.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>Stream</span>
              {film.streaming.map(w => (
                <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--ink-on-surface)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: STREAM_STYLE[w] || '#888' }} />{w}
                </span>
              ))}
            </div>
          )}

          {/* Rating stars (if seen) */}
          {status === 'seen' && rating > 0 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ fontSize: 18, color: s <= rating ? 'var(--gold)' : 'var(--hairline)' }}>★</span>
              ))}
              {review && <span style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: 15, color: 'var(--ink-soft)', marginLeft: 8 }}>&ldquo;{review}&rdquo;</span>}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setShowReview(true)} style={{ flex: 1, padding: '10px 0', borderRadius: 11, background: status === 'seen' ? 'rgba(78,210,123,.15)' : 'var(--gold)', color: status === 'seen' ? '#4ED27B' : '#1a1206', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 700, fontSize: 14, border: status === 'seen' ? '1px solid #4ED27B' : 'none', cursor: 'pointer' }}>
              {status === 'seen' ? '✓ Seen — edit review' : '✓ Mark as seen'}
            </button>
            <button onClick={() => onRemove(film)} style={{ width: 44, height: 44, borderRadius: 11, background: 'transparent', border: '1px solid var(--hairline)', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <p style={{ margin: 0, fontFamily: "'Instrument Sans',sans-serif", fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>← swipe to remove · swipe to mark seen →</p>
        </div>
      </div>

      {/* Review modal */}
      {showReview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}>
            <h3 style={{ margin: '0 0 18px', fontFamily: "'Gloock',serif", fontSize: 22, color: 'var(--ink-on-surface)' }}>{film.title}</h3>
            <p style={{ margin: '0 0 14px', fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Your rating</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setLocalRating(s)} style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', color: s <= localRating ? 'var(--gold)' : 'var(--hairline)', transition: '.1s' }}>★</button>
              ))}
            </div>
            <p style={{ margin: '0 0 8px', fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Your review <span style={{ textTransform: 'none', letterSpacing: 0, opacity: .6 }}>(optional)</span></p>
            <textarea
              value={localReview}
              onChange={e => setLocalReview(e.target.value)}
              placeholder="What did you think?"
              rows={3}
              style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '10px 14px', fontFamily: "'Crimson Pro',serif", fontSize: 16, color: 'var(--ink-on-surface)', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowReview(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 11, background: 'transparent', border: '1px solid var(--hairline)', color: 'var(--muted)', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveReview} style={{ flex: 2, padding: '11px 0', borderRadius: 11, background: 'var(--gold)', color: '#1a1206', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                {saving ? 'Saved!' : 'Save review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyReel({ watchlist, onToggleSeen, onRemove, onBack }) {
  const [tab, setTab] = useState('towatch');
  const toWatch = watchlist.filter(e => e.status === 'saved');
  const seen = watchlist.filter(e => e.status === 'seen');
  const active = tab === 'towatch' ? toWatch : seen;

  return (
    <div className="reel-app">
      <header className="app-bar">
        <button className="app-home" onClick={onBack} aria-label="Back">
          <ConnoIcon size={34} bg="var(--gold)" shape="squircle" expression="joy" />
          <span style={{ fontFamily: "'Gloock',serif", fontSize: 20, color: 'var(--ink-on-surface)' }}>REEL</span>
        </button>
        <div className="app-bar-mid">
          <span style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: 16, color: 'var(--muted)' }}>my reel</span>
        </div>
        <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 12.5, color: 'var(--muted)' }}>{watchlist.length} films</div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--hairline)', padding: '0 clamp(14px,4vw,40px)' }}>
        {[['towatch', `To Watch (${toWatch.length})`], ['seen', `Seen (${seen.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '14px 20px', fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 14, color: tab === key ? 'var(--gold)' : 'var(--muted)', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', marginBottom: -1, transition: '.15s' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="chat-scroll" style={{ padding: '24px clamp(14px,4vw,40px)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          {active.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ConnoIcon size={72} bg="var(--cc-avatar-bg)" shape="circle" expression="think" />
              <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: 18, color: 'var(--ink-soft)', marginTop: 20 }}>
                {tab === 'towatch' ? 'Nothing saved yet. Ask Connossaurus for a pick and tap + Add to my reel.' : 'Mark films as seen to track them here.'}
              </p>
            </div>
          )}
          {active.map(entry => (
            <SwipeCard
              key={entry.film.title}
              entry={entry}
              onSeen={(film, rating, review) => onToggleSeen(film, rating, review)}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

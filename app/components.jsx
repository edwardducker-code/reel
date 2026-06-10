'use client';
import { ConnoIcon } from './Connossaurus';
import { FILMS, STREAM_STYLE } from './filmData';

function PosterTile({ film, w = 132 }) {
  const p = film.poster;
  const h = Math.round(w * 1.48);
  return (
    <div style={{
      width: w, height: h, flex: '0 0 auto', borderRadius: 8, overflow: 'hidden',
      position: 'relative', background: p.bg, boxShadow: '0 10px 26px rgba(0,0,0,.45)',
      border: '1px solid rgba(255,255,255,.08)',
    }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 9, background:
        'repeating-linear-gradient(180deg, rgba(0,0,0,.55) 0 6px, transparent 6px 13px)' }}></div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 9, background:
        'repeating-linear-gradient(180deg, rgba(0,0,0,.55) 0 6px, transparent 6px 13px)' }}></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '14px 16px', color: p.ink }}>
        <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 8.5, letterSpacing: '.22em', opacity: .85, fontWeight: 600 }}>{p.kicker}</div>
        <div style={{ fontFamily: "'Gloock',serif", fontSize: w * 0.16, lineHeight: 1.02 }}>{film.title}</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background:
        'radial-gradient(120% 80% at 30% 10%, rgba(255,255,255,.12), transparent 55%)' }}></div>
    </div>
  );
}

function ScoreBadges({ film }) {
  const pill = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 13, lineHeight: 1 };
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={{ ...pill, background: 'rgba(245,197,24,.14)', color: '#F5C518', border: '1px solid rgba(245,197,24,.32)' }}>
        <b style={{ fontWeight: 800, letterSpacing: '.02em' }}>IMDb</b> {film.imdb.toFixed(1)}
      </span>
      <span style={{ ...pill, background: 'rgba(0,224,84,.12)', color: '#4ED27B', border: '1px solid rgba(0,224,84,.28)' }}>
        <span style={{ display: 'inline-flex', gap: 2 }}>
          {['#4ED27B','#52A8E8','#E8743B'].map((c,i) => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block' }}></span>)}
        </span> {film.letterboxd.toFixed(1)}
      </span>
    </div>
  );
}

function WhereChips({ film }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
      <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: 2 }}>Stream</span>
      {film.where.map((w) => (
        <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 12.5, color: 'var(--ink-on-surface)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: STREAM_STYLE[w] || '#888' }}></span>
          {w}
        </span>
      ))}
    </div>
  );
}

export function RecCard({ film, compact = false }) {
  if (!film) return null;
  return (
    <div className="rec-card" style={{ display: 'flex', gap: compact ? 14 : 18, padding: compact ? 14 : 18, maxWidth: 560 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--card-sheen)', pointerEvents: 'none' }}></div>
      <PosterTile film={film} w={compact ? 96 : 128} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0, flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Gloock',serif", fontSize: compact ? 21 : 25, lineHeight: 1.04, color: 'var(--ink-on-surface)' }}>{film.title}</h3>
          <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 12.5, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span>{film.year}</span><span>·</span><span>{film.runtime}</span><span>·</span>
            <span>{film.rating}</span><span>·</span><span>dir. {film.dir}</span>
          </div>
        </div>
        <ScoreBadges film={film} />
        <p style={{ margin: '2px 0', fontFamily: "'Crimson Pro',serif", fontSize: compact ? 15 : 16.5, lineHeight: 1.45, color: 'var(--ink-soft)' }}>{film.blurb}</p>
        <WhereChips film={film} />
      </div>
    </div>
  );
}

export function ChatBubble({ from, mood, children, showAvatar = true }) {
  const isCC = from === 'cc';
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: isCC ? 'flex-start' : 'flex-end', alignItems: 'flex-end' }}>
      {isCC && (
        <div style={{ width: 40, flex: '0 0 auto', visibility: showAvatar ? 'visible' : 'hidden' }}>
          <ConnoIcon size={40} bg="var(--cc-avatar-bg)" shape="circle" expression={mood || 'joy'} />
        </div>
      )}
      <div style={{
        maxWidth: '76%', padding: '11px 15px',
        borderRadius: isCC ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
        background: isCC ? 'var(--bubble-cc)' : 'var(--bubble-user)',
        color: isCC ? 'var(--ink-on-surface)' : 'var(--bubble-user-ink)',
        fontFamily: isCC ? "'Crimson Pro',serif" : "'Instrument Sans',sans-serif",
        fontSize: isCC ? 18 : 15, lineHeight: 1.4,
        border: isCC ? '1px solid var(--hairline)' : 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,.18)',
      }}>{children}</div>
    </div>
  );
}

export function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
      <div style={{ width: 40, flex: '0 0 auto' }}>
        <ConnoIcon size={40} bg="var(--cc-avatar-bg)" shape="circle" expression="think" />
      </div>
      <div style={{ padding: '14px 16px', borderRadius: '4px 16px 16px 16px', background: 'var(--bubble-cc)', border: '1px solid var(--hairline)', display: 'flex', gap: 5 }}>
        {[0,1,2].map((i) => <span key={i} className="td-dot" style={{ animationDelay: `${i * 0.18}s` }}></span>)}
      </div>
    </div>
  );
}

export function QuickChips({ options, onPick, disabled }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'flex-end' }}>
      {options.map((o) => (
        <button key={o} className="quick-chip" disabled={disabled} onClick={() => onPick(o)}>{o}</button>
      ))}
    </div>
  );
}

export function renderText(text) {
  const parts = String(text).split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*')
      ? <em key={i} style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{p.slice(1,-1)}</em>
      : <span key={i}>{p}</span>
  );
}

export { FILMS };

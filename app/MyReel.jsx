'use client';
import { ConnoIcon } from './Connossaurus';
import { FILMS, STREAM_STYLE } from './filmData';

function PosterTile({ film, w = 100 }) {
  const p = film.poster;
  const h = Math.round(w * 1.48);
  return (
    <div style={{
      width: w, height: h, flex: '0 0 auto', borderRadius: 8, overflow: 'hidden',
      position: 'relative', background: p.bg, boxShadow: '0 6px 18px rgba(0,0,0,.5)',
      border: '1px solid rgba(255,255,255,.08)',
    }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 7, background: 'repeating-linear-gradient(180deg, rgba(0,0,0,.55) 0 5px, transparent 5px 11px)' }}></div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 7, background: 'repeating-linear-gradient(180deg, rgba(0,0,0,.55) 0 5px, transparent 5px 11px)' }}></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 12px', color: p.ink }}>
        <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 7, letterSpacing: '.2em', opacity: .85, fontWeight: 600 }}>{p.kicker}</div>
        <div style={{ fontFamily: "'Gloock',serif", fontSize: w * 0.14, lineHeight: 1.05 }}>{film.title}</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 30% 10%, rgba(255,255,255,.12), transparent 55%)' }}></div>
    </div>
  );
}

function FilmRow({ film, status, onToggleSeen, onRemove }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 16px', background: 'var(--surface)',
      border: '1px solid var(--hairline)', borderRadius: 12, alignItems: 'center',
      opacity: status === 'seen' ? 0.7 : 1, transition: '.2s',
    }}>
      <PosterTile film={film} w={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Gloock',serif", fontSize: 17, color: 'var(--ink-on-surface)', lineHeight: 1.1 }}>{film.title}</div>
        <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>
          {film.year} · {film.dir}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {film.where.slice(0,2).map(w => (
            <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: 11, color: 'var(--ink-on-surface)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 2, background: STREAM_STYLE[w] || '#888' }}></span>{w}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => onToggleSeen(film)}
          title={status === 'seen' ? 'Mark unseen' : 'Mark as seen'}
          style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${status === 'seen' ? 'var(--gold)' : 'var(--hairline)'}`, background: status === 'seen' ? 'var(--gold)' : 'transparent', color: status === 'seen' ? '#1a1206' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: '.15s' }}
        >✓</button>
        <button
          onClick={() => onRemove(film)}
          title="Remove"
          style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--hairline)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: '.15s' }}
        >✕</button>
      </div>
    </div>
  );
}

export default function MyReel({ watchlist, onToggleSeen, onRemove, onBack }) {
  const saved = watchlist.filter(e => e.status === 'saved');
  const seen = watchlist.filter(e => e.status === 'seen');

  return (
    <div className="reel-app">
      <header className="app-bar">
        <button className="app-home" onClick={onBack} aria-label="Back">
          <ConnoIcon size={34} bg="var(--gold)" shape="squircle" expression="joy" />
          <span style={{ fontFamily: "'Gloock',serif", fontSize: 20, color: 'var(--ink-on-surface)' }}>REEL</span>
        </button>
        <div className="app-bar-mid">
          <span style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: 16, color: 'var(--muted)' }}>
            my reel
          </span>
        </div>
        <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 12.5, color: 'var(--muted)' }}>
          {watchlist.length} films
        </div>
      </header>

      <div className="chat-scroll" style={{ padding: '24px clamp(14px,4vw,40px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {watchlist.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ConnoIcon size={72} bg="var(--cc-avatar-bg)" shape="circle" expression="think" />
              <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: 20, color: 'var(--ink-soft)', marginTop: 20 }}>
                Nothing here yet. Ask Connossaurus for a recommendation and hit <b style={{ fontStyle: 'normal' }}>Add to my reel</b>.
              </p>
            </div>
          )}

          {saved.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ fontFamily: "'Gloock',serif", fontSize: 22, color: 'var(--ink-on-surface)' }}>To watch</div>
                <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 12, color: 'var(--muted)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)', borderRadius: 999, padding: '2px 10px' }}>{saved.length}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {saved.map(({ film }) => (
                  <FilmRow key={film.title} film={film} status="saved" onToggleSeen={onToggleSeen} onRemove={onRemove} />
                ))}
              </div>
            </section>
          )}

          {seen.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ fontFamily: "'Gloock',serif", fontSize: 22, color: 'var(--ink-on-surface)' }}>Seen</div>
                <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 12, color: 'var(--muted)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)', borderRadius: 999, padding: '2px 10px' }}>{seen.length}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {seen.map(({ film }) => (
                  <FilmRow key={film.title} film={film} status="seen" onToggleSeen={onToggleSeen} onRemove={onRemove} />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

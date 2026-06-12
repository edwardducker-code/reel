'use client'
import { useState, useEffect } from 'react'
import { createClient } from './lib/supabase'
import { ConnoIcon } from './Connossaurus'

export default function MyReel({ onBack, user, onSignOut }) {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('saved') // 'saved' | 'seen'
  const [reviewModal, setReviewModal] = useState(null) // entry being reviewed
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  // Load watchlist from Supabase
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function loadWatchlist() {
      setLoading(true)
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setWatchlist(data || [])
      setLoading(false)
    }
    loadWatchlist()
  }, [user.id])

  async function markSeen(entry) {
    setReviewModal(entry)
    setRating(entry.rating || 0)
    setReviewText(entry.review || '')
  }

  async function saveReview() {
    setSaving(true)
    const { error } = await supabase
      .from('watchlist')
      .update({ status: 'seen', rating, review: reviewText })
      .eq('id', reviewModal.id)

    if (!error) {
      setWatchlist(prev => prev.map(e =>
        e.id === reviewModal.id ? { ...e, status: 'seen', rating, review: reviewText } : e
      ))
    }
    setSaving(false)
    setReviewModal(null)
  }

  async function removeFilm(entryId) {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', entryId)

    if (!error) {
      setWatchlist(prev => prev.filter(e => e.id !== entryId))
    }
  }

  const filtered = watchlist.filter(e => e.status === tab)

  return (
    <div className="myreel-shell">
      {/* Header */}
      <header className="myreel-header">
        <button className="myreel-back" onClick={onBack}>← Back</button>
        <h1 className="myreel-title">My Reel</h1>
        <div className="myreel-user">
          <span className="myreel-email">{user.email}</span>
          <button className="myreel-signout" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="myreel-tabs">
        <button
          className={`myreel-tab ${tab === 'saved' ? 'active' : ''}`}
          onClick={() => setTab('saved')}
        >
          To Watch <span className="tab-count">{watchlist.filter(e => e.status === 'saved').length}</span>
        </button>
        <button
          className={`myreel-tab ${tab === 'seen' ? 'active' : ''}`}
          onClick={() => setTab('seen')}
        >
          Seen <span className="tab-count">{watchlist.filter(e => e.status === 'seen').length}</span>
        </button>
      </div>

      {/* Content */}
      <div className="myreel-list">
        {loading ? (
          <div className="myreel-empty">
            <ConnoIcon expression="think" size={64} />
            <p>Loading your reel...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="myreel-empty">
            <ConnoIcon expression="wink" size={64} />
            <p>{tab === 'saved' ? 'Nothing saved yet — ask Connossaurus for a recommendation!' : 'No films marked as seen yet.'}</p>
            {tab === 'saved' && <button className="myreel-cta" onClick={onBack}>Find a film</button>}
          </div>
        ) : (
          filtered.map(entry => (
            <FilmEntry
              key={entry.id}
              entry={entry}
              onMarkSeen={() => markSeen(entry)}
              onRemove={() => removeFilm(entry.id)}
            />
          ))
        )}
      </div>

      {/* Review modal */}
      {reviewModal && (
        <div className="review-overlay" onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div className="review-modal">
            <h3 className="review-title">{reviewModal.film?.title}</h3>
            <p className="review-sub">How was it?</p>

            {/* Star rating */}
            <div className="stars">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  className={`star ${rating >= n ? 'filled' : ''}`}
                  onClick={() => setRating(n)}
                >★</button>
              ))}
            </div>

            <textarea
              className="review-textarea"
              placeholder="Write a note (optional)..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={3}
            />

            <div className="review-actions">
              <button className="review-cancel" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="review-save" onClick={saveReview} disabled={saving}>
                {saving ? 'Saving...' : 'Mark as seen'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .myreel-shell {
          min-height: 100vh;
          background: var(--color-bg, #1a2e26);
          color: var(--color-cream, #F7F3EC);
          font-family: 'Instrument Sans', sans-serif;
        }
        .myreel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(201,151,58,0.2);
          gap: 1rem;
        }
        .myreel-back {
          background: none;
          border: none;
          color: var(--color-gold, #C9973A);
          font-size: 0.9rem;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          padding: 0;
          white-space: nowrap;
        }
        .myreel-title {
          font-family: 'Gloock', serif;
          font-size: 1.25rem;
          margin: 0;
          color: var(--color-gold, #C9973A);
        }
        .myreel-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .myreel-email {
          font-size: 0.75rem;
          color: var(--color-stone, #8C8478);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .myreel-signout {
          background: none;
          border: 1px solid rgba(201,151,58,0.3);
          border-radius: 6px;
          color: var(--color-stone, #8C8478);
          font-size: 0.75rem;
          padding: 0.25rem 0.6rem;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          white-space: nowrap;
        }
        .myreel-signout:hover { color: var(--color-cream, #F7F3EC); border-color: var(--color-gold, #C9973A); }
        .myreel-tabs {
          display: flex;
          border-bottom: 1px solid rgba(201,151,58,0.2);
          padding: 0 1.5rem;
        }
        .myreel-tab {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--color-stone, #8C8478);
          font-size: 0.9rem;
          padding: 0.75rem 1rem 0.75rem 0;
          margin-right: 1.5rem;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .myreel-tab.active {
          color: var(--color-gold, #C9973A);
          border-bottom-color: var(--color-gold, #C9973A);
        }
        .tab-count {
          background: rgba(201,151,58,0.15);
          color: var(--color-gold, #C9973A);
          border-radius: 10px;
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
        }
        .myreel-list {
          padding: 1rem 1.5rem;
          max-width: 680px;
          margin: 0 auto;
        }
        .myreel-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-stone, #8C8478);
        }
        .myreel-empty p { margin: 1rem 0; font-size: 0.95rem; }
        .myreel-cta {
          background: var(--color-gold, #C9973A);
          color: var(--color-ink, #0F0D0B);
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
        }
        /* Review modal */
        .review-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,13,11,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }
        .review-modal {
          background: var(--color-surface, #1a2e26);
          border: 1px solid rgba(201,151,58,0.4);
          border-radius: 16px;
          padding: 1.5rem;
          width: 100%;
          max-width: 360px;
        }
        .review-title {
          font-family: 'Gloock', serif;
          font-size: 1.1rem;
          color: var(--color-gold, #C9973A);
          margin: 0 0 0.25rem;
        }
        .review-sub {
          color: var(--color-stone, #8C8478);
          font-size: 0.85rem;
          margin: 0 0 1rem;
        }
        .stars {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }
        .star {
          background: none;
          border: none;
          font-size: 1.75rem;
          color: rgba(201,151,58,0.3);
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .star.filled { color: var(--color-gold, #C9973A); }
        .review-textarea {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,151,58,0.3);
          border-radius: 8px;
          padding: 0.75rem;
          color: var(--color-cream, #F7F3EC);
          font-size: 0.9rem;
          font-family: 'Instrument Sans', sans-serif;
          resize: none;
          outline: none;
          box-sizing: border-box;
        }
        .review-textarea:focus { border-color: var(--color-gold, #C9973A); }
        .review-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .review-cancel {
          flex: 1;
          background: none;
          border: 1px solid rgba(201,151,58,0.3);
          border-radius: 8px;
          color: var(--color-stone, #8C8478);
          padding: 0.7rem;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
        }
        .review-save {
          flex: 2;
          background: var(--color-gold, #C9973A);
          border: none;
          border-radius: 8px;
          color: var(--color-ink, #0F0D0B);
          padding: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
        }
        .review-save:disabled { opacity: 0.5; }
      `}</style>
    </div>
  )
}

function FilmEntry({ entry, onMarkSeen, onRemove }) {
  const film = entry.film || {}

  return (
    <div className="film-entry">
      <div className="film-poster-wrap">
        {film.poster
          ? <img className="film-poster" src={film.poster} alt={film.title} />
          : <div className="film-poster-fallback"><span>{film.title?.[0] || '?'}</span></div>
        }
        {entry.status === 'seen' && <div className="film-seen-badge">Seen</div>}
      </div>
      <div className="film-info">
        <p className="film-title">{film.title}{film.year ? <span className="film-year"> ({film.year})</span> : ''}</p>
        {film.director && <p className="film-director">dir. {film.director}</p>}
        {film.runtime && <p className="film-meta">{film.runtime}{film.rating ? ` · ${film.rating}` : ''}</p>}
        {entry.status === 'seen' && entry.rating && (
          <p className="film-stars">{'★'.repeat(entry.rating)}<span style={{opacity:.3}}>{'★'.repeat(5 - entry.rating)}</span></p>
        )}
        {entry.review && <p className="film-review">&ldquo;{entry.review}&rdquo;</p>}
        {film.streaming && film.streaming.length > 0 && (
          <div className="film-streaming">
            {film.streaming.map(s => <span key={s} className="film-stream-chip">{s}</span>)}
          </div>
        )}
      </div>
      <div className="film-actions">
        {entry.status === 'saved' && (
          <button className="film-btn seen" onClick={onMarkSeen}>Mark seen</button>
        )}
        <button className="film-btn remove" onClick={onRemove}>Remove</button>
      </div>

      <style jsx>{`
        .film-entry {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(201,151,58,0.1);
        }
        .film-poster {
          width: 48px;
          height: 72px;
          object-fit: cover;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .film-info { flex: 1; min-width: 0; }
        .film-title {
          font-family: 'Gloock', serif;
          font-size: 1rem;
          color: var(--color-cream, #F7F3EC);
          margin: 0 0 0.2rem;
        }
        .film-director {
          font-size: 0.8rem;
          color: var(--color-stone, #8C8478);
          margin: 0 0 0.25rem;
        }
        .film-rating {
          color: var(--color-gold, #C9973A);
          font-size: 0.85rem;
          margin: 0 0 0.25rem;
          letter-spacing: 1px;
        }
        .film-review {
          font-style: italic;
          font-size: 0.8rem;
          color: var(--color-stone, #8C8478);
          margin: 0;
        }
        .film-actions {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex-shrink: 0;
        }
        .film-btn {
          background: none;
          border: 1px solid;
          border-radius: 6px;
          font-size: 0.75rem;
          padding: 0.3rem 0.6rem;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          white-space: nowrap;
        }
        .film-btn.seen {
          border-color: rgba(201,151,58,0.5);
          color: var(--color-gold, #C9973A);
        }
        .film-btn.seen:hover { background: rgba(201,151,58,0.1); }
        .film-btn.remove {
          border-color: rgba(255,100,100,0.3);
          color: rgba(255,100,100,0.7);
        }
        .film-btn.remove:hover { background: rgba(255,100,100,0.1); }
      `}</style>
    </div>
  )
}

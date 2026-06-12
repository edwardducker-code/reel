'use client';
import { useState, useEffect } from 'react';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const POSTER_BASE_LG = 'https://image.tmdb.org/t/p/w500';

function FilmModal({ film, onClose, onAdd, isAdded }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!film) return;
    fetch(`/api/tmdb?action=details&id=${film.id}`)
      .then(r => r.json())
      .then(d => setDetails(d))
      .catch(() => {});
  }, [film?.id, film]);

  if (!film) return null;

  const f = details || film;
  const posterUrl = f.poster_path ? `${POSTER_BASE_LG}${f.poster_path}` : null;

  return (
    <div className="fmodal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fmodal">
        <button className="fmodal-close" onClick={onClose}>✕</button>
        <div className="fmodal-inner">
          <div className="fmodal-poster-col">
            {posterUrl
              ? <img src={posterUrl} alt={f.title} className="fmodal-poster" />
              : <div className="fmodal-poster-fallback">{f.title?.[0]}</div>
            }
            {f.imdb && (
              <div className="fmodal-score">★ {f.imdb} <span>TMDB</span></div>
            )}
            {f.rating && !f.imdb && (
              <div className="fmodal-score">★ {f.rating} <span>TMDB</span></div>
            )}
          </div>
          <div className="fmodal-info">
            <h2 className="fmodal-title">{f.title}</h2>
            <p className="fmodal-meta">
              {f.year && <span>{f.year}</span>}
              {f.dir && <><span> · </span><span>dir. {f.dir}</span></>}
              {f.runtime && <><span> · </span><span>{f.runtime}</span></>}
            </p>
            {f.tagline && <p className="fmodal-tagline">&ldquo;{f.tagline}&rdquo;</p>}
            {(f.overview || film.overview) && (
              <p className="fmodal-overview">{f.overview || film.overview}</p>
            )}
            {f.genres && f.genres.length > 0 && (
              <div className="fmodal-genres">
                {f.genres.map(g => <span key={g} className="fmodal-genre">{g}</span>)}
              </div>
            )}
            {f.streaming && f.streaming.length > 0 && (
              <div className="fmodal-streaming">
                <span className="fmodal-stream-label">Stream on</span>
                {f.streaming.map(s => <span key={s} className="fmodal-stream-chip">{s}</span>)}
              </div>
            )}
            <button
              className={isAdded ? 'fmodal-btn fmodal-btn--added' : 'fmodal-btn'}
              onClick={() => !isAdded && onAdd(f)}
              disabled={isAdded}
            >
              {isAdded ? '✓ In my reel' : '+ Add to my reel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCarousel({ watchlist = [], onAdd }) {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilm, setActiveFilm] = useState(null);

  useEffect(() => {
    fetch('/api/tmdb?action=featured')
      .then(r => r.json())
      .then(d => { setFilms(d.films || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const watchlistTitles = new Set(watchlist.map(e => e.film?.title));

  if (loading) return (
    <div className="featured-loading">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="featured-skeleton" />
      ))}
    </div>
  );

  if (!films.length) return null;

  return (
    <>
      <section className="featured-section">
        <div className="featured-head">
          <div className="eyebrow">Skip the chat</div>
          <h2 className="sec-h2">Films picked for you</h2>
          <p className="featured-sub">Based on what people like you love watching. Click any film to find out more.</p>
        </div>
        <div className="featured-rail">
          {films.map(film => (
            <button
              key={film.id}
              className="featured-card"
              onClick={() => setActiveFilm(film)}
            >
              {film.poster_path
                ? <img src={`${POSTER_BASE}${film.poster_path}`} alt={film.title} className="featured-poster" />
                : <div className="featured-poster-fallback">{film.title?.[0]}</div>
              }
              <div className="featured-info">
                <p className="featured-title">{film.title}</p>
                <p className="featured-year">{film.year}</p>
              </div>
              {watchlistTitles.has(film.title) && (
                <div className="featured-saved">In my reel</div>
              )}
            </button>
          ))}
        </div>
      </section>

      {activeFilm && (
        <FilmModal
          film={activeFilm}
          onClose={() => setActiveFilm(null)}
          onAdd={(f) => { onAdd(f); setActiveFilm(null); }}
          isAdded={watchlistTitles.has(activeFilm.title)}
        />
      )}
    </>
  );
}

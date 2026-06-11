import { createClient } from './lib/supabase'

/**
 * Saves a film to the user's Supabase watchlist.
 * Call this from TmdbCard when user clicks "Save to My Reel".
 * 
 * @param {object} film - { title, year, director, poster, tmdbId }
 * @param {string} userId - from user.id
 * @returns {{ success: boolean, error?: string, alreadySaved?: boolean }}
 */
export async function saveFilmToReel(film, userId) {
  const supabase = createClient()

  // Check if already saved
  const { data: existing } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', userId)
    .eq('film->>title', film.title)
    .maybeSingle()

  if (existing) return { success: false, alreadySaved: true }

  // Normalise film shape before saving
  const normalisedFilm = {
    title: film.title,
    year: film.year,
    director: film.dir || film.director || '',
    poster: film.poster || (film.poster_path ? `https://image.tmdb.org/t/p/w342${film.poster_path}` : ''),
    tmdbId: film.tmdbId || film.id || '',
    overview: film.overview || '',
    runtime: film.runtime || '',
    rating: film.imdb || film.rating || null,
    streaming: film.streaming || [],
  }

  const { error } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      film: normalisedFilm,
      status: 'saved',
    })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

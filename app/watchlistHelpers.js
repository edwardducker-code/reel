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

  const { error } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      film: film,
      status: 'saved',
    })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

import { createClient } from './supabase'

export async function buildTasteProfile(userId) {
  if (!userId) return ''

  const supabase = createClient()

  const { data, error } = await supabase
    .from('watchlist')
    .select('film, status, rating, review')
    .eq('user_id', userId)
    .eq('status', 'seen')
    .not('rating', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data || data.length === 0) return ''

  const loved = data.filter(e => e.rating >= 4)
  const disliked = data.filter(e => e.rating <= 2)
  const mixed = data.filter(e => e.rating === 3)

  const fmt = (e) => `${e.film.title}${e.film.year ? ` (${e.film.year})` : ''}${e.rating ? ` [${e.rating}★]` : ''}`

  let profile = '\n\n---TASTE PROFILE---\n'
  profile += 'This user has rated films on REEL. Use this to personalise your recommendations.\n'

  if (loved.length > 0) {
    profile += `Loved (4-5★): ${loved.map(fmt).join(', ')}\n`
  }
  if (mixed.length > 0) {
    profile += `Mixed (3★): ${mixed.map(fmt).join(', ')}\n`
  }
  if (disliked.length > 0) {
    profile += `Disliked (1-2★): ${disliked.map(fmt).join(', ')}\n`
  }

  profile += 'Lean towards films that match their loved titles. Avoid styles similar to their disliked titles.\n'
  profile += '---END TASTE PROFILE---'

  return profile
}

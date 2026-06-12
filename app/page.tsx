'use client'
import { useState, useEffect } from 'react'
import Landing from './Landing'
import ChatApp from './ChatApp'
import MyReel from './MyReel'
import AuthModal from './AuthModal'
import { createClient } from './lib/supabase'
import { saveFilmToReel } from './watchlistHelpers'

export default function Home() {
  const [view, setView] = useState('landing')
  const [user, setUser] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [watchlist, setWatchlist] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [dismissedFilms, setDismissedFilms] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any

  // Load watchlist from Supabase when user is available
  useEffect(() => {
    if (!user) { setWatchlist([]); return; }
    async function loadWatchlist() {
      const { data } = await supabase.from('watchlist').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setWatchlist(data);
    }
    loadWatchlist();
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps
  const [showAuth, setShowAuth] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const supabase = createClient()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for auth changes (sign in, sign out, magic link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setView('landing')
  }

  function handleMyReelClick() {
    if (!user) {
      setShowAuth(true)
    } else {
      setView('myreel')
    }
  }

  function handleAuthSuccess() {
    setShowAuth(false)
    setView('myreel')
  }

  if (authLoading) return null // Avoid flash before session loads

  return (
    <>
      {view === 'landing' && (
        <Landing
          onLaunch={() => setView('chat')}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-expect-error JSX prop type mismatch
          watchlist={watchlist}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-expect-error JSX prop type mismatch
          onAddToWatchlist={async (film: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (!user) { setShowAuth(true); return; }
            const result = await saveFilmToReel(film, user.id);
            if (result.success) setWatchlist(prev => [...prev, { film, status: 'saved', id: Date.now() }]);
          }}
        />
      )}

      {view === 'chat' && (
        <ChatApp
          onHome={() => setView('landing')}
          onMyReel={handleMyReelClick}
          watchlist={watchlist}
          onAddToWatchlist={async (film: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (!user) { setShowAuth(true); return; }
            const result = await saveFilmToReel(film, user.id);
            if (result.success) {
              setWatchlist(prev => [...prev, { film, status: 'saved', id: Date.now() }]);
            }
          }}
          user={user}
          onSignIn={() => setShowAuth(true)}
          dismissedFilms={dismissedFilms}
          onDismissFilm={(film: any) => setDismissedFilms(prev => [...prev, film])} // eslint-disable-line @typescript-eslint/no-explicit-any
        />
      )}

      {view === 'myreel' && user && (
        <MyReel
          onBack={() => setView('chat')}
          user={user}
          onSignOut={handleSignOut}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}

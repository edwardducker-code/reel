'use client'
import { useState, useEffect } from 'react'
import Landing from './Landing'
import ChatApp from './ChatApp'
import MyReel from './MyReel'
import AuthModal from './AuthModal'
import { createClient } from './lib/supabase'

export default function Home() {
  const [view, setView] = useState('landing')
  const [user, setUser] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
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
        />
      )}

      {view === 'chat' && (
        <ChatApp
          onHome={() => setView('landing')}
          onMyReel={handleMyReelClick}
          watchlist={[]}
          onAddToWatchlist={() => {}}
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

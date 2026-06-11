'use client'
import { useState } from 'react'
import { createClient } from './lib/supabase'

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createClient()

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    onSuccess()
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setMagicSent(true)
  }

  async function handleMagicLink(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setMagicSent(true)
  }

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        {/* Close */}
        <button className="auth-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="auth-header">
          <span className="auth-logo">🎬</span>
          <h2 className="auth-title">
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Join REEL' : 'Magic link'}
          </h2>
          <p className="auth-sub">
            {mode === 'signin' ? 'Sign in to access your watchlist' :
             mode === 'signup' ? 'Save films, rate them, build your taste' :
             'We\'ll email you a link to sign in instantly'}
          </p>
        </div>

        {magicSent ? (
          <div className="auth-sent">
            <span className="auth-sent-icon">📬</span>
            <p>Check your inbox — we sent a link to <strong>{email}</strong></p>
            <button className="auth-link-btn" onClick={() => setMagicSent(false)}>Try again</button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleMagicLink}>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            {mode !== 'magic' && (
              <input
                className="auth-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            )}
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'One moment...' :
               mode === 'signin' ? 'Sign in' :
               mode === 'signup' ? 'Create account' :
               'Send magic link'}
            </button>
          </form>
        )}

        {/* Mode switcher */}
        <div className="auth-switcher">
          {mode === 'signin' && <>
            <button className="auth-link-btn" onClick={() => { setMode('signup'); setError(null) }}>No account? Sign up</button>
            <span className="auth-dot">·</span>
            <button className="auth-link-btn" onClick={() => { setMode('magic'); setError(null) }}>Magic link instead</button>
          </>}
          {mode === 'signup' && <>
            <button className="auth-link-btn" onClick={() => { setMode('signin'); setError(null) }}>Already have an account? Sign in</button>
          </>}
          {mode === 'magic' && <>
            <button className="auth-link-btn" onClick={() => { setMode('signin'); setError(null) }}>Use password instead</button>
          </>}
        </div>

        {/* Guest option */}
        <div className="auth-guest">
          <button className="auth-guest-btn" onClick={onClose}>Continue as guest</button>
          <p className="auth-guest-note">Recommendations are free. Sign in to save films.</p>
        </div>
      </div>

      <style jsx>{`
        .auth-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 13, 11, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .auth-modal {
          background: var(--color-surface, #1a2e26);
          border: 1px solid var(--color-gold, #C9973A);
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          position: relative;
          color: var(--color-cream, #F7F3EC);
        }
        .auth-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: var(--color-stone, #8C8478);
          font-size: 1rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: color 0.2s;
        }
        .auth-close:hover { color: var(--color-cream, #F7F3EC); }
        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .auth-logo {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .auth-title {
          font-family: 'Gloock', serif;
          font-size: 1.5rem;
          margin: 0 0 0.25rem;
          color: var(--color-gold, #C9973A);
        }
        .auth-sub {
          font-size: 0.875rem;
          color: var(--color-stone, #8C8478);
          margin: 0;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .auth-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,151,58,0.3);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: var(--color-cream, #F7F3EC);
          font-size: 1rem;
          font-family: 'Instrument Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .auth-input:focus {
          border-color: var(--color-gold, #C9973A);
        }
        .auth-input::placeholder { color: var(--color-stone, #8C8478); }
        .auth-error {
          color: #e07070;
          font-size: 0.8rem;
          margin: 0;
          text-align: center;
        }
        .auth-submit {
          background: var(--color-gold, #C9973A);
          color: var(--color-ink, #0F0D0B);
          border: none;
          border-radius: 8px;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Instrument Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .auth-submit:hover { opacity: 0.9; }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-switcher {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .auth-dot { color: var(--color-stone, #8C8478); font-size: 0.75rem; }
        .auth-link-btn {
          background: none;
          border: none;
          color: var(--color-gold, #C9973A);
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0;
          font-family: 'Instrument Sans', sans-serif;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .auth-link-btn:hover { opacity: 0.8; }
        .auth-guest {
          border-top: 1px solid rgba(201,151,58,0.2);
          padding-top: 1rem;
          text-align: center;
        }
        .auth-guest-btn {
          background: transparent;
          border: 1px solid rgba(201,151,58,0.4);
          border-radius: 8px;
          padding: 0.6rem 1.5rem;
          color: var(--color-stone, #8C8478);
          font-size: 0.875rem;
          font-family: 'Instrument Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 0.5rem;
        }
        .auth-guest-btn:hover {
          border-color: var(--color-gold, #C9973A);
          color: var(--color-cream, #F7F3EC);
        }
        .auth-guest-note {
          font-size: 0.75rem;
          color: var(--color-stone, #8C8478);
          margin: 0;
        }
        .auth-sent {
          text-align: center;
          padding: 1rem 0;
        }
        .auth-sent-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
        .auth-sent p { font-size: 0.9rem; margin: 0 0 1rem; line-height: 1.5; }
      `}</style>
    </div>
  )
}

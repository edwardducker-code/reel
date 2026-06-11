'use client';
import { useState, useEffect, useRef } from 'react';
import { ConnoIcon } from './Connossaurus';
import { ChatBubble, TypingDots, QuickChips, renderText } from './components';
import TmdbCard from './TmdbCard';
import { SYSTEM_PROMPT } from './systemPrompt';
import { buildTasteProfile } from './lib/tasteProfile';

const INITIAL_CHIPS = ['Make me cry (the good kind)', 'Something beautiful', 'Cheer me up', 'Surprise me', 'Something intense', 'Watch with family'];

function detectMood(text) {
  const t = text.toLowerCase();
  if (t.includes('cry') || t.includes('sad') || t.includes('devastating')) return 'teary';
  if (t.includes('laugh') || t.includes('fun') || t.includes('cheer') || t.includes('happy') || t.includes('feel-good')) return 'joy';
  if (t.includes('beautiful') || t.includes('stunning') || t.includes('visual')) return 'awe';
  if (t.includes('intense') || t.includes('thriller') || t.includes('think') || t.includes('dark')) return 'think';
  if (t.includes('perfect') || t.includes('exactly') || t.includes('great pick')) return 'smug';
  return 'joy';
}

// Extract film title + optional year from Claude's response
// Matches patterns like: 🎬 Title (Year), **Title** (Year), Title (Year) — Director
function extractFilmMentions(text) {
  const films = [];
  const seen = new Set();

  // Pattern 1: 🎬 Title (Year)
  const emojiPattern = /🎬\s+([^()\n—–-]+?)\s*(?:\((\d{4})\))?(?:\s*[—–-])/g;
  let m;
  while ((m = emojiPattern.exec(text)) !== null) {
    const title = m[1].trim();
    const year = m[2] || null;
    if (title && !seen.has(title.toLowerCase())) {
      seen.add(title.toLowerCase());
      films.push({ title, year });
    }
  }

  // Pattern 2: • Title (Year) — for "Also on your radar" lines
  const bulletPattern = /[•\*]\s+\*{0,2}([^•\*()\n]+?)\*{0,2}\s+\((\d{4})[^)]*\)/g;
  while ((m = bulletPattern.exec(text)) !== null) {
    const title = m[1].trim();
    const year = m[2] || null;
    if (title && !seen.has(title.toLowerCase())) {
      seen.add(title.toLowerCase());
      films.push({ title, year });
    }
  }

  return films;
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

export default function ChatApp({ onHome, onMyReel, watchlist, onAddToWatchlist, onDismissFilm: onDismissFilmProp, dismissedFilms, user, onSignIn }) {
  const [messages, setMessages] = useState([]);
  const [apiMessages, setApiMessages] = useState([]);
  const apiMessagesRef = useRef([]);
  const [typing, setTyping] = useState(false);
  const [chips, setChips] = useState(INITIAL_CHIPS);
  const [inputValue, setInputValue] = useState('');
  const [chipsDisabled, setChipsDisabled] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    startConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  async function startConversation() {
    await wait(500);
    setTyping(true);
    await wait(800);
    setTyping(false);
    addCCMessage("What are we watching tonight? How do you want to *feel*?", 'joy');
  }

  function addCCMessage(text, mood = 'joy') {
    setMessages(prev => [...prev, { type: 'cc', text, mood, id: Date.now() + Math.random() }]);
  }

  function addUserMessage(text) {
    setMessages(prev => [...prev, { type: 'user', text, id: Date.now() + Math.random() }]);
  }

  function addFilmCards(films) {
    films.forEach((film, i) => {
      setMessages(prev => [...prev, { type: 'tmdb', title: film.title, year: film.year, id: Date.now() + Math.random() + i }]);
    });
  }

  async function sendSilent(apiText) {
    setTyping(true);
    const newApiMessages = [...apiMessagesRef.current, { role: 'user', content: apiText }];
    setApiMessages(newApiMessages);
    apiMessagesRef.current = newApiMessages;
    try {
      const tasteProfile = user ? await buildTasteProfile(user.id) : "";
      const res = await fetch("/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApiMessages, systemPrompt: SYSTEM_PROMPT + tasteProfile }),
      });
      const data = await res.json();
      const replyText = data.text || "My reel seems to have jammed. Try again?";
      setTyping(false);
      const mood = detectMood(replyText);
      const films = extractFilmMentions(replyText);
      addCCMessage(replyText, mood);
      if (films.length > 0) { await wait(300); addFilmCards(films); }
      setApiMessages([...newApiMessages, { role: 'assistant', content: replyText }]);
    } catch {
      setTyping(false);
    }
  }

  async function sendMessage(userText) {
    if (!userText.trim()) return;
    setChipsDisabled(true);
    setChips(null);
    addUserMessage(userText);
    setInputValue('');

    const newApiMessages = [...apiMessages, { role: 'user', content: userText }];
    setApiMessages(newApiMessages);
    setTyping(true);

    try {
      const tasteProfile = user ? await buildTasteProfile(user.id) : "";
      const res = await fetch("/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApiMessages, systemPrompt: SYSTEM_PROMPT + tasteProfile }),
      });
      const data = await res.json();
      const replyText = data.text || "My reel seems to have jammed. Try again?";

      setTyping(false);
      const mood = detectMood(replyText);
      const films = extractFilmMentions(replyText);

      addCCMessage(replyText, mood);

      if (films.length > 0) {
        await wait(300);
        addFilmCards(films);
      }

      setApiMessages([...newApiMessages, { role: 'assistant', content: replyText }]);
      setChipsDisabled(false);
    } catch {
      setTyping(false);
      addCCMessage("My reel seems to have jammed. Try again?", 'think');
      setChipsDisabled(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  const watchlistTitles = new Set(watchlist.map(e => e.film.title));

  function onDismissFilm(film) {
    if (onDismissFilmProp) onDismissFilmProp(film);
    sendSilent(`I dismissed ${film.title || 'that film'} — it's not for me. Please suggest a completely different film, different genre and mood. Do not suggest ${film.title || 'that film'} again.`);
  }

  return (
    <div className="reel-app">
      <header className="app-bar">
        <button className="app-home" onClick={onHome} aria-label="Home">
          <ConnoIcon size={34} bg="var(--gold)" shape="squircle" expression="joy" />
          <span style={{ fontFamily: "'Gloock',serif", fontSize: 20, color: 'var(--ink-on-surface)' }}>REEL</span>
        </button>
        <div className="app-bar-mid">
          <span style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: 16, color: 'var(--muted)' }}>
            in conversation with Connossaurus
          </span>
        </div>
        <button
          onClick={onMyReel}
          style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', background: 'var(--chip-bg)', border: '1px solid var(--hairline)', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          🎬 My Reel {watchlist.length > 0 && <span style={{ background: 'var(--gold)', color: '#1a1206', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 6px' }}>{watchlist.length}</span>}
        </button>
        {!user && (
          <button
            onClick={onSignIn}
            style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--gold)', background: 'transparent', border: '1px solid var(--gold)', borderRadius: 9, padding: '7px 14px', cursor: 'pointer' }}
          >
            Sign In
          </button>
        )}
      </header>

      <div className="chat-scroll" ref={scrollRef} style={{ padding: '22px clamp(14px,4vw,40px)' }}>
        <div className="chat-col" style={{ gap: 14 }}>
          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            if (msg.type === 'cc') return (
              <ChatBubble key={msg.id} from="cc" mood={msg.mood} showAvatar={!prev || prev.type !== 'cc'}>
                {renderText(msg.text)}
              </ChatBubble>
            );
            if (msg.type === 'user') return (
              <ChatBubble key={msg.id} from="user">{msg.text}</ChatBubble>
            );
            if (msg.type === 'tmdb') return (
              <div key={msg.id} className="rec-wrap">
                <TmdbCard
                  title={msg.title}
                  year={msg.year}
                  onAdd={onAddToWatchlist}
                  onDismiss={onDismissFilm}
                  isAdded={watchlistTitles.has(msg.title)}
                  isDismissed={(dismissedFilms || []).some(f => f.title === msg.title)}
                />
              </div>
            );
            return null;
          })}
          {typing && <TypingDots />}
          {chips && !chipsDisabled && (
            <QuickChips options={chips} onPick={sendMessage} disabled={chipsDisabled} />
          )}
          <div style={{ height: 4 }}></div>
        </div>
      </div>

      <footer className="composer">
        <div className="composer-inner">
          <input
            className="composer-input"
            placeholder="Tell Connossaurus how you want to feel…"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={typing}
          />
          <button
            className="composer-send"
            aria-label="Send"
            onClick={() => sendMessage(inputValue)}
            disabled={typing || !inputValue.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12l16-8-6 8 6 8-16-8z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div className="composer-hint">Press Enter or tap a suggestion · Connossaurus never spoils</div>
      </footer>
    </div>
  );
}

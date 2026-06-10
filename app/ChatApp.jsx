'use client';
import { useState, useEffect, useRef } from 'react';
import { ConnoIcon } from './Connossaurus';
import { ChatBubble, TypingDots, QuickChips, RecCard, renderText, FILMS } from './components';
import { SYSTEM_PROMPT } from './systemPrompt';

const INITIAL_CHIPS = ['Make me cry (the good kind)', 'Something beautiful', 'Cheer me up', 'Surprise me', 'I want something intense', 'Something I can watch with family'];

function detectMood(text) {
  const t = text.toLowerCase();
  if (t.includes('cry') || t.includes('sad') || t.includes('emotional') || t.includes('ach')) return 'teary';
  if (t.includes('laugh') || t.includes('fun') || t.includes('cheer') || t.includes('happy') || t.includes('comfort')) return 'joy';
  if (t.includes('beautiful') || t.includes('stunning') || t.includes('gorgeous') || t.includes('wow')) return 'awe';
  if (t.includes('intense') || t.includes('thriller') || t.includes('think') || t.includes('mind')) return 'think';
  if (t.includes('perfect') || t.includes('exactly') || t.includes('yes')) return 'smug';
  return 'joy';
}

function extractFilmRecs(text) {
  const filmIds = [];
  const lowerText = text.toLowerCase();
  Object.entries(FILMS).forEach(([id, film]) => {
    if (lowerText.includes(film.title.toLowerCase())) {
      filmIds.push(id);
    }
  });
  return filmIds;
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

export default function ChatApp({ onHome }) {
  const [messages, setMessages] = useState([]);
  const [apiMessages, setApiMessages] = useState([]);
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
    await wait(400);
    setTyping(true);
    await wait(900);
    setTyping(false);
    addCCMessage("Oh good, you're here. Sit, sit.", 'joy');
    await wait(300);
    setTyping(true);
    await wait(700);
    setTyping(false);
    addCCMessage("What are we in the mood for tonight? Tell me how you want to *feel* — I'll do the rest. I've only had 65 million years to practise.", 'joy');
  }

  function addCCMessage(text, mood = 'joy') {
    setMessages(prev => [...prev, { type: 'cc', text, mood, id: Date.now() + Math.random() }]);
  }

  function addUserMessage(text) {
    setMessages(prev => [...prev, { type: 'user', text, id: Date.now() + Math.random() }]);
  }

  function addRecCard(filmId) {
    setMessages(prev => [...prev, { type: 'rec', filmId, id: Date.now() + Math.random() }]);
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApiMessages, systemPrompt: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      const replyText = data.text || "Hmm, my film reel seems to have jammed. Try again?";

      setTyping(false);

      const mood = detectMood(replyText);
      const filmRecs = extractFilmRecs(replyText);

      addCCMessage(replyText, mood);

      for (const filmId of filmRecs) {
        await wait(400);
        addRecCard(filmId);
      }

      setApiMessages([...newApiMessages, { role: 'assistant', content: replyText }]);
      setChipsDisabled(false);
    } catch {
      setTyping(false);
      addCCMessage("My reel seems to have jammed! Something went wrong. Try again?", 'think');
      setChipsDisabled(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
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
        <div className="app-bar-status"><span className="dot-live"></span> here now</div>
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
            if (msg.type === 'rec') {
              const film = FILMS[msg.filmId];
              if (!film) return null;
              return (
                <div key={msg.id} className="rec-wrap">
                  <RecCard film={film} />
                </div>
              );
            }
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
        <div className="composer-hint">Press Enter or tap a suggestion above · Connossaurus never spoils</div>
      </footer>
    </div>
  );
}

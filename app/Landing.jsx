'use client';
import { Connossaurus, ConnoIcon } from './Connossaurus';
import { RecCard, FILMS } from './components';

export default function Landing({ onLaunch }) {
  return (
    <div className="landing">
      <nav className="nav">
        <div className="nav-brand">
          <ConnoIcon size={38} bg="var(--gold)" shape="squircle" expression="joy" />
          <span style={{ fontFamily: "'Gloock',serif", fontSize: 23, color: 'var(--ink-on-surface)' }}>REEL</span>
        </div>
        <div className="nav-links">
          <a>How it works</a>
          <a>The films</a>
          <a>About Connossaurus</a>
        </div>
        <button className="btn-gold btn-sm" onClick={onLaunch}>Start watching</button>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Your film-obsessed friend · est. 65,000,000 BC</div>
          <h1 className="hero-h1">
            The right film,<br/>for exactly<br/><span className="ital">how you feel.</span>
          </h1>
          <p className="hero-sub">
            Meet <b>Connossaurus</b> — a small green dinosaur with impeccable taste and zero chill about cinema.
            Tell him your mood; he hands you the one film you didn&apos;t know you needed. No spoilers, ever.
          </p>
          <div className="hero-cta">
            <button className="btn-gold" onClick={onLaunch}>Ask Connossaurus →</button>
            <span className="hero-cta-note">Free · no account · he&apos;s just happy you came</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-glow"></div>
          <Connossaurus size={360} expression="joy" idle={true} />
          <div className="hero-quote">
            &ldquo;65 million years and I still cry at <span className="g">Cinema Paradiso</span>.&rdquo;
          </div>
        </div>
      </header>

      <section className="how">
        <div className="how-head">
          <div className="eyebrow">How it works</div>
          <h2 className="sec-h2">Three questions. One perfect film.</h2>
        </div>
        <div className="how-grid">
          {[
            ['joy', 'Tell him your mood', 'Cry? Laugh? Be dazzled? Connossaurus speaks fluent feeling — just say it plainly.'],
            ['think', 'He reads the room', 'Six expressions, one obsessive memory. He weighs tone, runtime, and where you can actually watch it.'],
            ['smug', 'You get a lobby card', 'Scores, streaming, and a spoiler-free why — handed over like a film he\'s been dying to show you.'],
          ].map(([mood, title, desc], i) => (
            <div className="how-card" key={i}>
              <ConnoIcon size={66} bg="var(--cc-avatar-bg)" shape="circle" expression={mood} ring />
              <div className="how-step">0{i + 1}</div>
              <h3 className="how-t">{title}</h3>
              <p className="how-d">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="peek">
        <div className="peek-copy">
          <div className="eyebrow">What he hands you</div>
          <h2 className="sec-h2">Not a list. A recommendation.</h2>
          <p className="peek-p">
            Every pick comes as a <i>lobby card</i> — IMDb and Letterboxd scores, where to stream it tonight,
            and a short, <b>spoiler-free</b> reason it&apos;s the one. Then he gets out of your way.
          </p>
          <button className="btn-ghost" onClick={onLaunch}>See him in conversation →</button>
        </div>
        <div className="peek-card">
          <RecCard film={FILMS.mood} />
        </div>
      </section>

      <footer className="foot">
        <div className="foot-brand">
          <ConnoIcon size={44} bg="var(--gold)" shape="squircle" expression="wink" />
          <div>
            <div style={{ fontFamily: "'Gloock',serif", fontSize: 22, color: 'var(--ink-on-surface)' }}>REEL</div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: 15 }}>
              your film-obsessed friend
            </div>
          </div>
        </div>
        <div className="foot-note">Scores shown for illustration. Connossaurus is very real to us.</div>
      </footer>
    </div>
  );
}

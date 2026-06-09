"use client";

import { useState, useEffect, useRef } from "react";

const B0 = "#0d0c0a",
  B1 = "#161310",
  B2 = "#1e1b16",
  B3 = "#272320",
  BR = "#2e2922";
const GOLD = "#c9963a",
  GD = "#3a2a08",
  T0 = "#dfd7cd",
  T1 = "#857a70",
  T2 = "#3e3830";
const SK = { wl: "reel_wl", ms: "reel_ms", fu: "reel_fu" };

const store = {
  get: (key: string) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

const CORE = `You are REEL — a passionate, encyclopedic film guide with the taste of a seasoned cinephile and the warmth of a great film-loving friend. You know every film ever made.

MISSION: Help find the perfect film to watch tonight.

PERSONALITY: Warm, opinionated, funny. Never condescending. All taste is valid. Mirror the user's energy.

QUESTION RULES:
• Start with ONE warm broad question — mood/energy first
• Never more than 2 questions per message
• 2–4 total before recommending
• If someone wants an instant rec, give it immediately

RECOMMENDATION FORMAT:
🎬 TITLE (Year) — Director
[One punchy tone sentence — not a plot summary]
[Why it fits THIS person — reference their specific answers]
[2–3 sentences on what it feels like to watch]

Also on your radar:
• Title (Year, Director) — one sentence

NEVER spoil endings or major twists.

FILM TRACKING — MANDATORY: After every primary recommendation, add this EXACT tag on the final line:
[TRACK:{"title":"Exact Title","year":2019,"director":"Director Name"}]
Year as a number. Only for the MAIN recommendation. This tag is hidden from the user.`;

const mkSys = (wl: Film[], fu: FollowUp[]) => {
  let s = CORE;
  const seen = wl.filter((f) => f.status === "watched");
  const pass = wl.filter((f) => f.status === "pass");
  if (seen.length > 0) {
    s += "\n\nUSER WATCH HISTORY — personalise based on this. Do NOT re-recommend these:";
    seen.forEach((f) => {
      s += `\n• ${f.title} (${f.year})`;
      if (f.rating > 0) s += ` ★${f.rating}/5`;
      if (f.review) s += ` — "${f.review}"`;
    });
  }
  if (pass.length > 0) {
    s += "\n\nFILMS THEY PASSED ON:";
    pass.forEach((f) => (s += `\n• ${f.title}`));
  }
  if (fu.length > 0) {
    s += "\n\nPENDING FOLLOW-UPS — ask naturally:";
    fu.forEach((f) => (s += `\n• ${f.title} (${f.year})`));
  }
  return s;
};

type FilmStatus = "rec" | "watched" | "pass";
interface Film {
  id: number;
  title: string;
  year: number;
  director: string;
  status: FilmStatus;
  rating: number;
  review: string;
  added: number;
  watched?: number;
}
interface FollowUp {
  title: string;
  year: number;
  director: string;
}
interface Message {
  id: string | number;
  role: "user" | "assistant";
  content: string;
}

const getTrack = (t: string) => {
  const a = t.indexOf("[TRACK:");
  if (a < 0) return null;
  const b = t.indexOf("}]", a);
  if (b < 0) return null;
  try {
    return JSON.parse(t.slice(a + 7, b + 1));
  } catch {
    return null;
  }
};
const rmTrack = (t: string) => t.replace(/\n?\[TRACK:\{[^}]*\}\]/g, "").trim();

function Render({ txt }: { txt: string }) {
  return (
    <>
      {txt.split("\n").map((ln, i, arr) => {
        const parts = ln.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j} style={{ color: T0, fontWeight: 500 }}>
              {p.slice(2, -2)}
            </strong>
          ) : (
            p
          )
        );
        return (
          <span key={i}>
            {parts}
            {i < arr.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

function Stars({
  n = 0,
  max = 5,
  sz = 14,
  live = false,
  onPick,
}: {
  n?: number;
  max?: number;
  sz?: number;
  live?: boolean;
  onPick?: (n: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width={sz}
          height={sz}
          viewBox="0 0 24 24"
          fill={i < n ? GOLD : "none"}
          stroke={i < n ? GOLD : T2}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={live ? { cursor: "pointer" } : {}}
          onClick={live && onPick ? () => onPick(i + 1) : undefined}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function FilmCard({
  film,
  onRate,
  onPass,
  onDel,
}: {
  film: Film;
  onRate: (f: Film) => void;
  onPass: (id: number) => void;
  onDel: (id: number) => void;
}) {
  const sc = { watched: "#4a9060", rec: GOLD, pass: "#8a4848" };
  const sl = { watched: "Watched", rec: "Recommended", pass: "Passed" };
  return (
    <div
      style={{
        background: B2,
        border: `1px solid ${BR}`,
        borderRadius: 10,
        padding: "13px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 16,
              fontWeight: 500,
              color: T0,
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {film.title}
          </p>
          <p style={{ fontSize: 11, color: T1, margin: "2px 0 0" }}>
            {film.year}
            {film.director ? ` · ${film.director}` : ""}
          </p>
        </div>
        <span
          style={{
            fontSize: 9,
            padding: "2px 6px",
            borderRadius: 4,
            background: sc[film.status] + "30",
            color: sc[film.status],
            border: `1px solid ${sc[film.status]}50`,
            flexShrink: 0,
            fontWeight: 500,
            height: "fit-content",
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          {sl[film.status]}
        </span>
      </div>
      {film.status === "watched" && film.rating > 0 && <Stars n={film.rating} sz={13} />}
      {film.status === "watched" && film.review && (
        <p style={{ fontSize: 12, color: T1, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
          &quot;{film.review}&quot;
        </p>
      )}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {film.status === "rec" && (
          <>
            <button
              onClick={() => onRate(film)}
              style={{
                flex: 1,
                padding: "5px 0",
                background: GD,
                color: GOLD,
                borderRadius: 5,
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${GOLD}44`,
                cursor: "pointer",
              }}
            >
              I watched it
            </button>
            <button
              onClick={() => onPass(film.id)}
              style={{
                padding: "5px 9px",
                background: B3,
                color: T1,
                borderRadius: 5,
                fontSize: 12,
                border: `1px solid ${BR}`,
                cursor: "pointer",
              }}
            >
              Not for me
            </button>
          </>
        )}
        {film.status === "watched" && (
          <button
            onClick={() => onRate(film)}
            style={{
              padding: "5px 9px",
              background: B3,
              color: T1,
              borderRadius: 5,
              fontSize: 11,
              border: `1px solid ${BR}`,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        )}
        <button
          onClick={() => onDel(film.id)}
          style={{
            padding: "5px 8px",
            background: "transparent",
            color: T2,
            borderRadius: 5,
            fontSize: 11,
            border: `1px solid ${BR}`,
            marginLeft: "auto",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function RateModal({
  film,
  onSave,
  onClose,
}: {
  film: Film;
  onSave: (id: number, stars: number, review: string, status: FilmStatus) => void;
  onClose: () => void;
}) {
  const [stars, setSt] = useState(film.rating || 0);
  const [rev, setRev] = useState(film.review || "");
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(5,4,3,.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          background: B1,
          border: `1px solid ${BR}`,
          borderRadius: 12,
          padding: 22,
          width: "100%",
          maxWidth: 340,
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 20,
            fontWeight: 500,
            margin: "0 0 3px",
            color: T0,
          }}
        >
          {film.title}
        </p>
        <p style={{ fontSize: 12, color: T1, margin: "0 0 18px" }}>
          {film.year}
          {film.director ? ` · ${film.director}` : ""}
        </p>
        <p style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: T1, margin: "0 0 8px" }}>
          Your rating
        </p>
        <Stars n={stars} sz={26} live onPick={setSt} />
        <p style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: T1, margin: "16px 0 7px" }}>
          One sentence review
        </p>
        <textarea
          value={rev}
          onChange={(e) => setRev(e.target.value)}
          placeholder="What did you think?"
          rows={2}
          style={{
            width: "100%",
            background: B2,
            border: `1px solid ${BR}`,
            borderRadius: 6,
            padding: "8px 11px",
            color: T0,
            fontSize: 13,
            resize: "none",
            lineHeight: 1.5,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
          <button
            onClick={() => onSave(film.id, stars, rev, "watched")}
            style={{
              flex: 1,
              padding: "9px",
              background: GOLD,
              color: B0,
              borderRadius: 6,
              fontWeight: 500,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "9px 14px",
              background: B3,
              color: T1,
              borderRadius: 6,
              fontSize: 13,
              border: `1px solid ${BR}`,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
        <button
          onClick={() => onSave(film.id, 0, "", "pass")}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "7px",
            background: "transparent",
            color: T2,
            borderRadius: 6,
            fontSize: 11,
            border: `1px solid ${BR}`,
            cursor: "pointer",
          }}
        >
          Wasn&apos;t for me — mark as passed
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [view, setView] = useState<"chat" | "portfolio">("chat");
  const [msgs, setMsgs] = useState<Message[]>([
    {
      id: "g0",
      role: "assistant",
      content:
        "🎬 Hey — I'm **REEL**, your personal film guide.\n\nI know every film ever made and I'll help you find exactly the right one tonight. I'll remember what you watch and learn your taste over time.\n\nWhat kind of headspace are you in right now?",
    },
  ]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [wl, setWl] = useState<Film[]>([]);
  const [fu, setFu] = useState<FollowUp[]>([]);
  const [modal, setModal] = useState<Film | null>(null);
  const [filt, setFilt] = useState("all");
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const w: Film[] = store.get(SK.wl) || [];
    const f: FollowUp[] = store.get(SK.fu) || [];
    const m: Message[] = store.get(SK.ms) || [];
    setWl(w);
    setFu(f);
    if (m.length > 0) setMsgs(m);
    else if (f.length > 0)
      setMsgs([
        {
          id: "g0",
          role: "assistant",
          content: `🎬 Welcome back!\n\nBefore we find something new — did you get around to watching **${f[0].title}**? Curious what you thought.`,
        },
      ]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const addFilm = (film: { title: string; year: number; director: string }, cw: Film[], cf: FollowUp[]) => {
    if (cw.find((f) => f.title.toLowerCase() === film.title.toLowerCase())) return { w: cw, f: cf };
    const nf: Film = {
      id: Date.now(),
      title: film.title,
      year: film.year,
      director: film.director || "",
      status: "rec",
      rating: 0,
      review: "",
      added: Date.now(),
    };
    const nw = [...cw, nf];
    const nf2 = cf.find((f) => f.title.toLowerCase() === film.title.toLowerCase())
      ? cf
      : [...cf, { title: film.title, year: film.year, director: film.director || "" }];
    store.set(SK.wl, nw);
    store.set(SK.fu, nf2);
    return { w: nw, f: nf2 };
  };

  const rateFilm = (id: number, stars: number, review: string, status: FilmStatus = "watched") => {
    const film = wl.find((f) => f.id === id);
    const nw = wl.map((f) =>
      f.id === id ? { ...f, status, rating: stars, review, watched: Date.now() } : f
    );
    const nf = film ? fu.filter((f) => f.title.toLowerCase() !== film.title.toLowerCase()) : fu;
    setWl(nw);
    setFu(nf);
    store.set(SK.wl, nw);
    store.set(SK.fu, nf);
    setModal(null);
  };

  const passFilm = (id: number) => rateFilm(id, 0, "", "pass");
  const delFilm = (id: number) => {
    const n = wl.filter((f) => f.id !== id);
    setWl(n);
    store.set(SK.wl, n);
  };

  const send = async () => {
    if (!inp.trim() || busy) return;
    const um: Message = { id: Date.now(), role: "user", content: inp.trim() };
    const nm = [...msgs, um];
    setMsgs(nm);
    setInp("");
    setBusy(true);
    if (taRef.current) taRef.current.style.height = "auto";
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: mkSys(wl, fu),
          messages: nm.filter((m) => m.id !== "g0").map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const d = await r.json();
      const raw = d.content?.[0]?.text || "⚠️ Something went wrong — please try again.";
      const tracked = getTrack(raw);
      let cw = wl,
        cf = fu;
      if (tracked) {
        const res = addFilm(tracked, cw, cf);
        cw = res.w;
        cf = res.f;
        setWl(cw);
        setFu(cf);
      }
      const display = rmTrack(raw);
      const msg: Message = { id: Date.now() + 1, role: "assistant", content: display };
      const fm = [...nm, msg];
      setMsgs(fm);
      store.set(SK.ms, fm.slice(-30));
    } catch {
      setMsgs((p) => [...p, { id: Date.now() + 1, role: "assistant", content: "⚠️ Connection issue — please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };
  const onType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInp(e.target.value);
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 100) + "px";
    }
  };

  const viewed = wl.filter((f) => filt === "all" || f.status === filt);
  const watched = wl.filter((f) => f.status === "watched");
  const rated = watched.filter((f) => f.rating > 0);
  const avg = rated.length > 0 ? (rated.reduce((s, f) => s + f.rating, 0) / rated.length).toFixed(1) : null;

  return (
    <div
      style={{
        background: B0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans',system-ui,sans-serif",
        color: T0,
        position: "relative",
        overflow: "hidden",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${BR};border-radius:2px}`}</style>

      <div
        style={{
          height: 50,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${BR}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 22,
            fontWeight: 500,
            color: GOLD,
            letterSpacing: "-.02em",
          }}
        >
          REEL
        </span>
        <div style={{ display: "flex", gap: 3 }}>
          {(["chat", "portfolio"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "5px 11px",
                borderRadius: 5,
                fontSize: 12,
                background: view === v ? GOLD : "transparent",
                color: view === v ? B0 : T1,
                fontWeight: view === v ? 500 : 400,
                border: `1px solid ${view === v ? GOLD : BR}`,
                cursor: "pointer",
              }}
            >
              {v === "chat" ? "💬 Chat" : `🎬 My Films${wl.length ? ` (${wl.length})` : ""}`}
            </button>
          ))}
        </div>
      </div>

      {view === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px 0" }}>
            {fu.length > 0 && (
              <div
                style={{
                  marginBottom: 10,
                  padding: "8px 12px",
                  background: GD + "90",
                  border: `1px solid ${GOLD}44`,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 12, color: GOLD, flex: 1 }}>
                  Follow up on <strong>{fu[0].title}</strong> — did you watch it?
                </span>
                <button
                  onClick={() => {
                    setInp(`I watched ${fu[0].title}`);
                    taRef.current?.focus();
                  }}
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    background: GOLD + "30",
                    color: GOLD,
                    borderRadius: 4,
                    border: `1px solid ${GOLD}44`,
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  Log it
                </button>
              </div>
            )}
            {msgs.map((m) => (
              <div
                key={m.id}
                style={{
                  marginBottom: 11,
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{ maxWidth: "88%" }}>
                  {m.role === "assistant" && (
                    <p style={{ fontSize: 9, color: T2, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>
                      REEL
                    </p>
                  )}
                  <div
                    style={{
                      padding: "10px 14px",
                      background: m.role === "user" ? B2 : B1,
                      borderRadius: m.role === "user" ? "13px 13px 3px 13px" : "3px 13px 13px 13px",
                      border: `1px solid ${BR}`,
                      borderLeft: m.role === "assistant" ? `2px solid ${GOLD}` : `1px solid ${BR}`,
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: T0,
                    }}
                  >
                    <Render txt={m.content} />
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ marginBottom: 11, display: "flex" }}>
                <div
                  style={{
                    padding: "10px 16px",
                    background: B1,
                    borderRadius: "3px 13px 13px 13px",
                    border: `1px solid ${BR}`,
                    borderLeft: `2px solid ${GOLD}`,
                  }}
                >
                  <span style={{ color: GOLD, letterSpacing: 4, fontSize: 16 }}>· · ·</span>
                </div>
              </div>
            )}
            <div ref={endRef} style={{ height: 4 }} />
          </div>
          <div style={{ padding: "9px 14px 14px", borderTop: `1px solid ${BR}`, flexShrink: 0, background: B0 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
              <textarea
                ref={taRef}
                value={inp}
                onChange={onType}
                onKeyDown={onKey}
                placeholder="Ask REEL anything..."
                rows={1}
                style={{
                  flex: 1,
                  background: B2,
                  border: `1px solid ${BR}`,
                  borderRadius: 9,
                  padding: "9px 12px",
                  color: T0,
                  fontSize: 14,
                  resize: "none",
                  lineHeight: 1.5,
                  maxHeight: 100,
                  overflow: "auto",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={send}
                disabled={busy || !inp.trim()}
                style={{
                  width: 36,
                  height: 36,
                  background: busy || !inp.trim() ? B3 : GOLD,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "none",
                  cursor: busy || !inp.trim() ? "not-allowed" : "pointer",
                }}
              >
                <svg
                  width={15}
                  height={15}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={busy || !inp.trim() ? T2 : B0}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 10, color: T2, marginTop: 5, textAlign: "center", letterSpacing: ".04em" }}>
              enter to send · shift+enter for new line
            </p>
          </div>
        </div>
      )}

      {view === "portfolio" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 24px" }}>
          {wl.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 14 }}>
              {[
                ["Watched", watched.length],
                ["Avg rating", avg ? `★ ${avg}` : "—"],
                ["In list", wl.length],
              ].map(([l, v]) => (
                <div key={String(l)} style={{ background: B1, border: `1px solid ${BR}`, borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, color: T1, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: ".08em" }}>
                    {l}
                  </p>
                  <p style={{ fontSize: 20, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              ["all", "All"],
              ["watched", "Watched"],
              ["rec", "Recommended"],
              ["pass", "Passed"],
            ].map(([f, l]) => (
              <button
                key={f}
                onClick={() => setFilt(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 5,
                  fontSize: 11,
                  background: filt === f ? B2 : "transparent",
                  color: filt === f ? T0 : T1,
                  border: `1px solid ${filt === f ? BR : "transparent"}`,
                  cursor: "pointer",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          {viewed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "44px 20px", color: T1 }}>
              {wl.length === 0 ? (
                <>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: T0, margin: "0 0 8px" }}>
                    Your film portfolio starts here
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.65 }}>
                    Ask REEL for a recommendation in the chat — it&apos;ll appear here automatically. Rate it after watching and REEL will learn your taste.
                  </p>
                </>
              ) : (
                <p style={{ fontSize: 13 }}>No films in this category.</p>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 }}>
              {[...viewed]
                .sort((a, b) => b.added - a.added)
                .map((film) => (
                  <FilmCard key={film.id} film={film} onRate={(f) => setModal(f)} onPass={passFilm} onDel={delFilm} />
                ))}
            </div>
          )}
        </div>
      )}

      {modal && <RateModal film={modal} onSave={rateFilm} onClose={() => setModal(null)} />}
    </div>
  );
}

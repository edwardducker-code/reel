'use client';

const CC = {
  body:   '#2D4A3E',
  bodyDk: '#223A30',
  bodyLt: '#375A4A',
  bodyHi: '#4E7361',
  gold:   '#C9973A',
  goldDk: '#A87E2E',
  cream:  '#F7F3EC',
  ink:    '#0F0D0B',
  paper:  '#EDE7DA',
  stone:  '#8C8478',
};

const EYE = { lx: 134, rx: 210, y: 150, r: 33 };

function Eyes({ pr = 16, look = [0, 2], lid = 0, conv = 3, shine = true }) {
  const { lx, rx, y, r } = EYE;
  return (
    <g>
      {[[lx, 1], [rx, -1]].map(([cx, s], i) => {
        const px = look[0] + s * conv, py = look[1];
        return (
          <g key={i}>
            <ellipse cx={cx} cy={y} rx={r} ry={r} fill={CC.cream} stroke={CC.ink} strokeWidth="5" />
            <path d={`M ${cx - r + 5} ${y - 6} A ${r - 3} ${r - 3} 0 0 1 ${cx + r - 5} ${y - 6}`}
              fill="none" stroke={CC.ink} strokeWidth="7" strokeLinecap="round" opacity="0.10" />
            <circle cx={cx + px} cy={y + py} r={pr + 6} fill={CC.goldDk} />
            <circle cx={cx + px} cy={y + py} r={pr + 4} fill={CC.gold} />
            <circle cx={cx + px} cy={y + py} r={pr} fill={CC.ink} />
            {shine && (<>
              <circle cx={cx + px - 6} cy={y + py - 7} r={5.5} fill={CC.cream} />
              <circle cx={cx + px + 5} cy={y + py + 6} r={2.6} fill={CC.cream} opacity="0.85" />
            </>)}
            {lid > 0 && (
              <path d={`M ${cx - r - 3} ${y} a ${r + 3} ${r + 3} 0 0 1 ${2 * (r + 3)} 0 Z`}
                fill={CC.body} stroke={CC.ink} strokeWidth="5" strokeLinejoin="round"
                transform={`scale(1, ${lid})`}
                style={{ transformBox: 'view-box', transformOrigin: `${cx}px ${y - r}px` }} />
            )}
          </g>
        );
      })}
    </g>
  );
}

const FACES = {
  joy: () => (<>
    <Eyes look={[0, -2]} />
    <path d="M150 214 Q183 248 216 214" fill={CC.ink} stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M158 216 Q183 236 208 216 Z" fill="#7a2f33" />
    <path d="M106 122 q22 -11 44 -1" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M194 120 q22 -9 44 1" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
  </>),
  awe: () => (<>
    <Eyes pr={15} look={[0, 1]} />
    <ellipse cx="183" cy="222" rx="13" ry="16" fill="#7a2f33" stroke={CC.ink} strokeWidth="5" />
    <path d="M108 118 q22 -13 44 -4" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M194 114 q22 -8 44 5" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
  </>),
  smug: () => (<>
    <Eyes lid={0.42} look={[5, 0]} pr={12} />
    <path d="M150 216 Q186 236 220 210" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M108 126 q22 -6 44 0" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M196 124 q20 2 42 -2" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
  </>),
  teary: () => (<>
    <Eyes look={[0, 3]} pr={14} />
    <path d="M104 178 q-3 14 4 20 q7 -6 4 -20 Z" fill={CC.gold} stroke={CC.ink} strokeWidth="3" />
    <path d="M152 216 q12 14 31 14 q19 0 31 -14" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M106 122 q22 -9 44 3" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M194 124 q22 -12 44 -3" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
  </>),
  think: () => (<>
    <Eyes look={[7, -5]} pr={12} />
    <path d="M156 220 q22 6 44 -4" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M106 124 q22 -12 44 -2" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M196 114 q22 -2 42 9" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
  </>),
  wink: () => (<>
    <g>
      <ellipse cx={EYE.lx} cy={EYE.y} rx={EYE.r} ry={EYE.r} fill={CC.cream} stroke={CC.ink} strokeWidth="5" />
      <circle cx={EYE.lx + 4} cy={EYE.y} r={18} fill={CC.gold} />
      <circle cx={EYE.lx + 4} cy={EYE.y} r={13} fill={CC.ink} />
      <circle cx={EYE.lx} cy={EYE.y - 5} r={4.5} fill={CC.cream} />
      <path d={`M ${EYE.rx - 30} ${EYE.y + 2} q 30 22 60 0`} fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    </g>
    <path d="M150 214 Q183 244 216 212" fill={CC.ink} stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M106 122 q22 -11 44 -1" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M194 120 q22 -9 44 1" fill="none" stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
  </>),
};

function Beret() {
  return (
    <g transform="rotate(32 183 96)">
      <ellipse cx="183" cy="86" rx="78" ry="22" fill={CC.goldDk} stroke={CC.ink} strokeWidth="6" />
      <path d="M104 56 C112 26 176 18 196 28 C214 20 268 30 270 60 C272 86 240 102 183 102 C126 102 98 84 104 56 Z"
        fill={CC.gold} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
      <path d="M120 82 C150 96 220 96 256 78 C246 92 210 100 183 100 C150 100 128 92 120 82 Z" fill={CC.goldDk} opacity="0.5" />
      <circle cx="150" cy="18" r="8" fill={CC.goldDk} stroke={CC.ink} strokeWidth="5" />
      <path d="M126 48 C150 32 188 32 214 42" fill="none" stroke={CC.cream} strokeWidth="6" strokeLinecap="round" opacity="0.42" />
    </g>
  );
}

function Head({ expression = 'joy', beret = true }) {
  const Face = FACES[expression] || FACES.joy;
  return (
    <g>
      <path d="M70 150 C66 86 120 44 184 46 C252 48 300 92 300 154 C300 196 280 224 250 240 C214 258 150 258 116 240 C86 224 72 196 70 150 Z"
        fill={CC.body} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
      <path d="M84 152 C80 102 120 60 176 56 C140 72 108 106 104 160 C95 160 87 158 84 152 Z" fill={CC.bodyHi} opacity="0.55" />
      <path d="M298 150 C300 194 280 224 250 240 C232 248 210 252 196 250 C238 240 270 212 282 168 C288 158 294 152 298 150 Z" fill={CC.bodyDk} opacity="0.4" />
      <path d="M150 214 C150 200 216 200 216 214 C216 236 196 250 183 250 C170 250 150 236 150 214 Z" fill={CC.bodyDk} opacity="0.35" />
      <ellipse cx="168" cy="206" rx="4" ry="5" fill={CC.ink} />
      <ellipse cx="198" cy="206" rx="4" ry="5" fill={CC.ink} />
      <ellipse cx="104" cy="186" rx="15" ry="9" fill={CC.gold} opacity="0.28" />
      <ellipse cx="262" cy="186" rx="15" ry="9" fill={CC.gold} opacity="0.28" />
      {beret && <Beret />}
      <Face />
    </g>
  );
}

function Clapperboard() {
  return (
    <g>
      <rect x="246" y="250" width="120" height="84" rx="10" fill={CC.ink} transform="rotate(-8 306 292)" />
      <g transform="rotate(-26 252 252)">
        <rect x="244" y="236" width="124" height="22" rx="6" fill={CC.ink} />
        {[0,1,2,3,4].map(i => (
          <path key={i} d={`M ${256 + i * 24} 236 l 14 0 l -10 22 l -14 0 Z`} fill={CC.cream} />
        ))}
      </g>
      <g transform="rotate(-8 306 292)">
        <rect x="252" y="262" width="108" height="14" fill={CC.cream} opacity="0.18" />
        <line x1="270" y1="290" x2="350" y2="290" stroke={CC.cream} strokeWidth="3" opacity="0.5" />
        <line x1="270" y1="304" x2="330" y2="304" stroke={CC.cream} strokeWidth="3" opacity="0.5" />
        <circle cx="350" cy="320" r="6" fill={CC.gold} />
      </g>
    </g>
  );
}

export function ConnoIcon({ size = 96, expression = 'joy', beret = true, bg = CC.ink, ring = false, shape = 'circle' }) {
  const r = shape === 'squircle' ? 78 : 200;
  return (
    <svg width={size} height={size} viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg">
      {shape !== 'none' && (
        <rect x="6" y="6" width="368" height="368" rx={r} fill={bg}
          stroke={ring ? CC.gold : 'none'} strokeWidth={ring ? 10 : 0} />
      )}
      <g transform="translate(-25 22) scale(1.18)">
        <Head expression={expression} beret={beret} />
      </g>
    </svg>
  );
}

export function Connossaurus({ size = 360, expression = 'joy', beret = true, idle = true, className = '' }) {
  const w = size, h = size * (440 / 400);
  return (
    <svg className={className} width={w} height={h} viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}>
      <g className={idle ? 'cc-idle' : ''}>
        <path d="M236 300 C300 300 366 286 384 232 C392 256 372 332 300 344 C262 350 240 330 232 308 Z"
          fill={CC.body} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
        <path d="M250 294 C300 292 352 280 378 242 C360 268 312 282 262 284 C256 288 252 291 250 294 Z" fill={CC.bodyHi} opacity="0.4" />
        <path d="M232 318 q34 0 38 40 q2 22 -16 30 l-30 0 q-8 -30 -2 -50 q4 -16 10 -20 Z"
          fill={CC.bodyDk} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
        <path d="M120 250 C108 180 150 150 196 152 C250 154 282 196 280 262 C278 322 240 360 192 360 C140 360 130 312 120 250 Z"
          fill={CC.body} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
        <path d="M126 252 C118 204 140 170 178 158 C152 174 134 212 140 264 C142 302 154 332 174 350 C150 340 130 306 126 252 Z" fill={CC.bodyHi} opacity="0.4" />
        <path d="M150 318 q-30 4 -34 44 q-2 22 16 28 l40 0 q10 -26 4 -50 q-6 -22 -26 -22 Z"
          fill={CC.body} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
        <path d="M114 384 q-8 14 4 20 l44 0 q10 -8 4 -20 Z" fill={CC.bodyLt} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
        {[126, 142, 158].map(x => <line key={x} x1={x} y1="392" x2={x} y2="404" stroke={CC.ink} strokeWidth="4" strokeLinecap="round" />)}
        <path d="M156 250 C150 300 168 340 196 342 C228 342 246 300 238 254 C212 244 182 244 156 250 Z"
          fill={CC.paper} opacity="0.9" />
        {[268, 286, 304].map((y, i) => <line key={i} x1={172 - i} y1={y} x2={222 + i} y2={y} stroke={CC.bodyDk} strokeWidth="3" opacity="0.25" strokeLinecap="round" />)}
        <path d="M252 250 q34 6 40 36 q3 16 -12 20 q-14 2 -20 -12 q-8 -22 -22 -30 Z" fill={CC.bodyDk} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
        <Clapperboard />
        <path d="M150 232 q-26 -6 -40 14 q-10 16 4 26 q14 8 24 -6 q8 -14 24 -16 Z" fill={CC.bodyLt} stroke={CC.ink} strokeWidth="6" strokeLinejoin="round" />
        <g className={idle ? 'cc-head' : ''}>
          <Head expression={expression} beret={beret} />
        </g>
        {idle && [EYE.lx, EYE.rx].map((cx, i) => (
          <g key={i} className="cc-blink" style={{ transformBox: 'view-box', transformOrigin: `${cx}px 118px` }}>
            <path d={`M ${cx - 36} 150 a 36 36 0 0 1 72 0 Z`} fill={CC.body} stroke={CC.ink} strokeWidth="5" strokeLinejoin="round" />
            <line x1={cx - 30} y1="150" x2={cx + 30} y2="150" stroke={CC.ink} strokeWidth="5" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default Connossaurus;

/**
 * Reel symbol artwork. One shared <defs> sprite is rendered once per page
 * (see <SymbolDefs />) and every symbol references its gradients, so a 15-cell
 * board doesn't ship 15 copies of the same gradient stops.
 */

export function SymbolDefs() {
  return (
    <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <linearGradient id="cbChrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#d3d6de" />
          <stop offset="58%" stopColor="#6f7380" />
          <stop offset="100%" stopColor="#eceef3" />
        </linearGradient>
        <linearGradient id="cbRedDisc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4a44" />
          <stop offset="55%" stopColor="#e31e24" />
          <stop offset="100%" stopColor="#8c0d11" />
        </linearGradient>
        <radialGradient id="cbSheen" cx="0.35" cy="0.25" r="0.75">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const CHROME = "url(#cbChrome)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ bull */

export function BullSymbol() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <circle cx="50" cy="50" r="45" fill="url(#cbRedDisc)" />
      <circle cx="50" cy="50" r="45" fill="url(#cbSheen)" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />

      <g transform="translate(50 56) scale(0.82) translate(-50 -56)">
        {/* horns: wider than the head and clearly separate — the one cue that
            stops a front-facing bull from reading as a cat */}
        <path
          d="M34 47Q14 44 9 22"
          fill="none"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M66 47Q86 44 91 22"
          fill="none"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* head, tapering into a broad muzzle */}
        <path
          fill="#ffffff"
          d="M50 36c-16 0-27 8-27 20 0 7 3 12.5 8 16.5 2.5 6.5 9.5 11.5 19 11.5s16.5-5 19-11.5c5-4 8-9.5 8-16.5 0-12-11-20-27-20z"
        />

        {/* face, punched back to the disc colour */}
        <path d="M31.5 51l12 4-12 4z" fill="#a50f14" />
        <path d="M68.5 51l-12 4 12 4z" fill="#a50f14" />
        <path
          d="M45.5 76.5v-4M54.5 76.5v-4"
          stroke="#a50f14"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------- fillers */

function Card() {
  return (
    <Frame>
      <rect x="10" y="26" width="80" height="50" rx="7" fill={CHROME} />
      <rect x="10" y="36" width="80" height="11" fill="#1b1b21" />
      <rect x="19" y="55" width="16" height="12" rx="2.5" fill="#1b1b21" opacity="0.55" />
      <rect x="42" y="60" width="30" height="4" rx="2" fill="#1b1b21" opacity="0.4" />
    </Frame>
  );
}

function Lock() {
  return (
    <Frame>
      <path d="M32 46V36a18 18 0 0 1 36 0v10" fill="none" stroke={CHROME} strokeWidth="9" strokeLinecap="round" />
      <rect x="21" y="44" width="58" height="42" rx="8" fill={CHROME} />
      <path d="M40 65l7 8 14-16" fill="none" stroke="#1b1b21" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

function Globe() {
  return (
    <Frame>
      <circle cx="50" cy="50" r="35" fill="none" stroke={CHROME} strokeWidth="7" />
      <ellipse cx="50" cy="50" rx="15" ry="35" fill="none" stroke={CHROME} strokeWidth="5" />
      <path d="M17 38h66M17 62h66M15 50h70" stroke={CHROME} strokeWidth="5" strokeLinecap="round" />
    </Frame>
  );
}

function Bank() {
  return (
    <Frame>
      <path d="M50 16 88 36H12z" fill={CHROME} />
      <rect x="20" y="42" width="9" height="32" fill={CHROME} />
      <rect x="37" y="42" width="9" height="32" fill={CHROME} />
      <rect x="54" y="42" width="9" height="32" fill={CHROME} />
      <rect x="71" y="42" width="9" height="32" fill={CHROME} />
      <rect x="12" y="78" width="76" height="9" rx="3" fill={CHROME} />
    </Frame>
  );
}

function Phone() {
  return (
    <Frame>
      <rect x="26" y="12" width="48" height="76" rx="9" fill={CHROME} />
      <rect x="32" y="22" width="36" height="56" rx="4" fill="#1b1b21" />
      <path d="M46 40a12 12 0 0 1 0 18M53 34a20 20 0 0 1 0 30" fill="none" stroke={CHROME} strokeWidth="4.5" strokeLinecap="round" />
      <rect x="38" y="66" width="24" height="8" rx="3" fill={CHROME} />
    </Frame>
  );
}

function Shield() {
  return (
    <Frame>
      <path d="M50 12l32 12v24c0 18-13 32-32 40-19-8-32-22-32-40V24z" fill={CHROME} />
      <path d="M37 51l9 10 18-20" fill="none" stroke="#1b1b21" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

function Chart() {
  return (
    <Frame>
      <rect x="16" y="60" width="14" height="26" rx="3" fill={CHROME} />
      <rect x="36" y="46" width="14" height="40" rx="3" fill={CHROME} />
      <rect x="56" y="32" width="14" height="54" rx="3" fill={CHROME} />
      <path d="M20 40l22-14 16 10 22-20" fill="none" stroke={CHROME} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 14h18v18" fill="none" stroke={CHROME} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

function Coins() {
  return (
    <Frame>
      <g stroke="#0d0d11" strokeWidth="2.5">
        <ellipse cx="71" cy="76" rx="17" ry="7" fill={CHROME} />
        <ellipse cx="71" cy="66" rx="17" ry="7" fill={CHROME} />
        <ellipse cx="36" cy="80" rx="24" ry="9.5" fill={CHROME} />
        <ellipse cx="36" cy="68" rx="24" ry="9.5" fill={CHROME} />
        <ellipse cx="36" cy="56" rx="24" ry="9.5" fill={CHROME} />
        <ellipse cx="36" cy="44" rx="24" ry="9.5" fill={CHROME} />
      </g>
    </Frame>
  );
}

function Cloud() {
  return (
    <Frame>
      <path
        d="M30 68a17 17 0 0 1-1-34 24 24 0 0 1 45 6 15 15 0 0 1-3 28z"
        fill={CHROME}
      />
      <path d="M42 60v22M42 60l-7 8M42 60l7 8" fill="none" stroke="#1b1b21" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 82V60M60 82l-7-8M60 82l7-8" fill="none" stroke="#1b1b21" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

function Laptop() {
  return (
    <Frame>
      <rect x="20" y="22" width="60" height="42" rx="5" fill={CHROME} />
      <rect x="26" y="28" width="48" height="30" rx="2" fill="#1b1b21" />
      <path d="M33 50l10-9 8 6 13-14" fill="none" stroke={CHROME} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 70h80l-6 10H16z" fill={CHROME} />
    </Frame>
  );
}

function Pie() {
  return (
    <Frame>
      <path d="M50 50V14a36 36 0 1 0 36 36z" fill={CHROME} />
      <path d="M58 8a36 36 0 0 1 34 34H58z" fill={CHROME} opacity="0.55" />
      <circle cx="50" cy="50" r="7" fill="#1b1b21" />
    </Frame>
  );
}

const REGISTRY: Record<string, () => React.ReactElement> = {
  bull: BullSymbol,
  card: Card,
  lock: Lock,
  globe: Globe,
  bank: Bank,
  phone: Phone,
  shield: Shield,
  chart: Chart,
  coins: Coins,
  cloud: Cloud,
  laptop: Laptop,
  pie: Pie,
};

export function ReelSymbol({ id }: { id: string }) {
  const Component = REGISTRY[id] ?? Card;
  return <Component />;
}

export type GameMode = "casino" | "classroom" | "catch";

export type PlayResult = "win" | "lose";

export type PrizeTier = {
  /** stable id, used for inventory counters */
  id: string;
  /** shown big on the prize screen */
  label: string;
  /** one line of flavour under the label */
  blurb: string;
  /** what the player may choose from at the booth */
  options: string[];
  /** relative odds inside the winning pool */
  weight: number;
  /** hard cap for the whole event; null = unlimited */
  cap: number | null;
  /** grand prizes get the confetti + siren treatment */
  isGrand: boolean;
};

/** Exactly what the player did, kept for post-event analysis. */
export type PlayDetail =
  | { kind: "classroom"; answers: { id: string; picked: number | null; correct: boolean }[] }
  | { kind: "catch"; caught: string[]; missed: string[]; declined: string[]; kept?: string[] }
  | { kind: "casino"; bulls: number };

export type Entry = {
  id: string;
  /** The token. Issued at email capture, typed in to unlock the spin, and the
   *  same code they show at the booth if they win — one code per person. */
  code: string;
  email: string;
  consent: boolean;
  locale: string;
  /** the phone session that issued this token, when it came from a QR scan */
  session: string | null;
  /** when the email was captured and the token issued */
  createdAt: string;
  tokenEmailSent: boolean;
  /** how we know the address is real: delivery, or a Google sign-in */
  verifiedBy: "email" | "google" | "none";

  /* --- filled in once they actually play; null means they never did --- */
  playedAt: string | null;
  mode: GameMode | null;
  result: PlayResult | null;
  score: number | null;
  scoreOutOf: number | null;
  detail: PlayDetail | null;
  /** true when the wheel lost and they took the question instead */
  usedSecondChance: boolean;

  /* --- the prize, once there is one --- */
  tierId: string | null;
  tierLabel: string | null;
  tierOptions: string[];
  /** which one the booth actually handed over */
  chosenPrize: string | null;
  emailSent: boolean;
  redeemedAt: string | null;
};

export type Outcome = {
  result: PlayResult;
  tier: PrizeTier;
  /** 5 reels x 3 rows of symbol ids, only for casino mode */
  grid: string[][] | null;
  /** row index (0-2) that forms the winning line, casino only */
  winningRow: number | null;
};

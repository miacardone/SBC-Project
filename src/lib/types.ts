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
  code: string;
  email: string;
  mode: GameMode;
  result: PlayResult;
  /** game score, null for slots */
  score: number | null;
  /** out of how many, null for slots */
  scoreOutOf: number | null;
  /** BCP-47 code of the language they played in */
  locale: string;
  /** per-question / per-card breakdown, null for older rows */
  detail: PlayDetail | null;
  tierId: string;
  tierLabel: string;
  /** snapshot of what this player may pick from, in case the table changes */
  tierOptions: string[];
  /** which one the booth actually handed over */
  chosenPrize: string | null;
  consent: boolean;
  emailSent: boolean;
  createdAt: string;
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

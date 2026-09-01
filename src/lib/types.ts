export type GameMode = "casino" | "classroom";

export type PlayResult = "win" | "lose";

export type PrizeTier = {
  /** stable id, used in codes + inventory counters */
  id: string;
  /** shown big on the prize screen */
  label: string;
  /** the thing they physically pick up at the booth */
  item: string;
  /** one line of flavour under the label */
  blurb: string;
  /** relative odds inside the winning pool */
  weight: number;
  /** hard cap for the whole event; null = unlimited */
  cap: number | null;
  /** grand prizes get the confetti + siren treatment */
  isGrand: boolean;
};

export type Entry = {
  id: string;
  code: string;
  email: string;
  mode: GameMode;
  result: PlayResult;
  /** quiz score, null for slots */
  score: number | null;
  tierId: string;
  tierLabel: string;
  tierItem: string;
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
  /** row indexes (0-2) that form the winning line, casino only */
  winningRow: number | null;
};

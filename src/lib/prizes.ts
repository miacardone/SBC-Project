import type { PrizeTier } from "./types";

/**
 * Booth inventory. Edit `cap` to match what you actually shipped to the event —
 * once a tier is exhausted the engine stops handing it out and rolls down to the
 * next tier instead of promising something the booth can't deliver.
 */
export const PRIZE_TIERS: PrizeTier[] = [
  {
    id: "grand",
    label: "JACKPOT",
    item: "$25 gift card",
    blurb: "Five bulls. Nobody does that. Go collect.",
    weight: 3,
    cap: 15,
    isGrand: true,
  },
  {
    id: "plush",
    label: "BIG WIN",
    item: "Plush bull",
    blurb: "The cb911 bull, in huggable form.",
    weight: 22,
    cap: 120,
    isGrand: false,
  },
  {
    id: "spinner",
    label: "WINNER",
    item: "cb911 fidget spinner",
    blurb: "Spins better than a chargeback cycle.",
    weight: 45,
    cap: 250,
    isGrand: false,
  },
];

/** Everybody walks away with something. This is the floor. */
export const CONSOLATION: PrizeTier = {
  id: "consolation",
  label: "NICE TRY",
  item: "Sticker pack + koozie",
  blurb: "House always wins. You still get merch.",
  weight: 0,
  cap: null,
  isGrand: false,
};

/** Base odds that a slot pull is a winning pull. */
export const SLOT_WIN_RATE = Number(process.env.SLOT_WIN_RATE ?? 0.35);

/** Quiz score (out of QUIZ_LENGTH) needed to count as a win. */
export const QUIZ_PASS_SCORE = Number(process.env.QUIZ_PASS_SCORE ?? 4);

export function tierById(id: string): PrizeTier {
  if (id === CONSOLATION.id) return CONSOLATION;
  return PRIZE_TIERS.find((t) => t.id === id) ?? CONSOLATION;
}

/**
 * Weighted draw across the tiers that still have stock.
 * `awarded` is the running count per tier id for this event.
 */
export function drawWinningTier(awarded: Record<string, number>): PrizeTier {
  const available = PRIZE_TIERS.filter(
    (t) => t.cap === null || (awarded[t.id] ?? 0) < t.cap
  );
  if (available.length === 0) return CONSOLATION;

  const total = available.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * total;
  for (const tier of available) {
    roll -= tier.weight;
    if (roll <= 0) return tier;
  }
  return available[available.length - 1];
}

/**
 * A quiz player who passes gets a tier scaled to how well they did, still
 * bounded by inventory. A perfect run is the only way into the jackpot pool.
 */
export function drawQuizTier(
  score: number,
  quizLength: number,
  awarded: Record<string, number>
): PrizeTier {
  const perfect = score >= quizLength;
  const pool = PRIZE_TIERS.filter((t) => {
    if (t.isGrand && !perfect) return false;
    return t.cap === null || (awarded[t.id] ?? 0) < t.cap;
  });
  if (pool.length === 0) return CONSOLATION;

  const total = pool.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * total;
  for (const tier of pool) {
    roll -= tier.weight;
    if (roll <= 0) return tier;
  }
  return pool[pool.length - 1];
}

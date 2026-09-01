import { envNumber } from "./env";
import type { PrizeTier } from "./types";

/**
 * Booth inventory.
 *
 * A player wins a *tier*, not a specific object — they pick what they actually
 * want from that tier's `options` when they hand their code over at the booth.
 * That keeps the kiosk honest when one item runs out faster than the others.
 *
 * Set `cap` to what you physically shipped to the event. Once a tier is
 * exhausted the engine stops handing it out and rolls down to the next one.
 */
export const PRIZE_TIERS: PrizeTier[] = [
  {
    id: "grand",
    label: "JACKPOT",
    blurb: "Nobody does that. Go collect.",
    options: ["$25 gift card", "cb911 hoodie", "Premium plush bull"],
    weight: 3,
    cap: 15,
    isGrand: true,
  },
  {
    id: "plush",
    label: "BIG WIN",
    blurb: "The good shelf. Take your pick.",
    options: ["Plush bull", "Insulated tumbler", "Wireless charger"],
    weight: 22,
    cap: 120,
    isGrand: false,
  },
  {
    id: "spinner",
    label: "WINNER",
    blurb: "Spins better than a chargeback cycle.",
    options: ["cb911 fidget spinner", "Enamel pin set", "Phone stand"],
    weight: 45,
    cap: 250,
    isGrand: false,
  },
];

/** Everybody walks away with something. This is the floor. */
export const CONSOLATION: PrizeTier = {
  id: "consolation",
  label: "NICE TRY",
  blurb: "House always wins. You still get merch.",
  options: ["Sticker pack", "Koozie", "Pen + notepad"],
  weight: 0,
  cap: null,
  isGrand: false,
};

/** Base odds that a slot pull is a winning pull. */
export const SLOT_WIN_RATE = envNumber("SLOT_WIN_RATE", 0.35);

export function tierById(id: string): PrizeTier {
  if (id === CONSOLATION.id) return CONSOLATION;
  return PRIZE_TIERS.find((t) => t.id === id) ?? CONSOLATION;
}

function pickWeighted(pool: PrizeTier[]): PrizeTier {
  if (pool.length === 0) return CONSOLATION;
  const total = pool.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * total;
  for (const tier of pool) {
    roll -= tier.weight;
    if (roll <= 0) return tier;
  }
  return pool[pool.length - 1];
}

function inStock(awarded: Record<string, number>) {
  return (tier: PrizeTier) => tier.cap === null || (awarded[tier.id] ?? 0) < tier.cap;
}

/** Weighted draw across the tiers that still have stock. */
export function drawWinningTier(awarded: Record<string, number>): PrizeTier {
  return pickWeighted(PRIZE_TIERS.filter(inStock(awarded)));
}

/**
 * A skill-game player who passes gets a tier scaled to how well they did, still
 * bounded by inventory. Only a flawless run reaches the jackpot pool.
 */
export function drawSkillTier(
  score: number,
  outOf: number,
  awarded: Record<string, number>
): PrizeTier {
  const perfect = score >= outOf;
  return pickWeighted(
    PRIZE_TIERS.filter((t) => (t.isGrand ? perfect : true)).filter(inStock(awarded))
  );
}

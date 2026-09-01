export const REELS = 5;
export const ROWS = 3;

/** Bulls needed on the payline to win. */
export const BULLS_TO_WIN = 3;

export const BULL = "bull";

/** Everything that isn't a bull. Weighted by how often it should appear. */
export const FILLER_SYMBOLS = [
  "card",
  "lock",
  "globe",
  "bank",
  "phone",
  "shield",
  "chart",
  "coins",
  "cloud",
  "laptop",
  "pie",
] as const;

export const ALL_SYMBOLS = [BULL, ...FILLER_SYMBOLS] as const;
export type SymbolId = (typeof ALL_SYMBOLS)[number];

function filler(): string {
  return FILLER_SYMBOLS[Math.floor(Math.random() * FILLER_SYMBOLS.length)];
}

/**
 * Build a 5x3 grid (indexed [reel][row]) that visually justifies an outcome the
 * server already decided. Row 1 is the payline.
 *
 * Wins are left-aligned runs of bulls on the payline, the way a real slot pays.
 * Losses deliberately land on 2 bulls a lot of the time — the near miss is what
 * makes the machine fun to stand at.
 */
export function buildGrid(result: "win" | "lose", isGrand: boolean): {
  grid: string[][];
  winningRow: number | null;
} {
  const payline = 1;
  const bullCount = result === "win"
    ? isGrand
      ? REELS
      : Math.random() < 0.35
        ? 4
        : BULLS_TO_WIN
    : Math.random() < 0.55
      ? BULLS_TO_WIN - 1
      : Math.floor(Math.random() * (BULLS_TO_WIN - 1));

  const grid: string[][] = [];
  for (let reel = 0; reel < REELS; reel++) {
    const column: string[] = [];
    for (let row = 0; row < ROWS; row++) {
      if (row === payline) {
        column.push(reel < bullCount ? BULL : filler());
      } else {
        // A stray bull off the payline keeps the board alive without paying.
        column.push(Math.random() < 0.12 ? BULL : filler());
      }
    }
    grid.push(column);
  }

  return { grid, winningRow: result === "win" ? payline : null };
}

/** How many bulls are actually sitting on the payline. */
export function paylineBulls(grid: string[][]): number {
  let count = 0;
  for (const column of grid) {
    if (column[1] === BULL) count++;
    else break;
  }
  return count;
}

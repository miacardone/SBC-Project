import type { GameMode, PlayResult } from "./types";

export type PrizeView = {
  id: string;
  label: string;
  blurb: string;
  options: string[];
  isGrand: boolean;
};

export type OutcomeResponse = {
  id: string;
  mode: GameMode;
  result: PlayResult;
  grid: string[][] | null;
  winningRow: number | null;
  /** false when the server couldn't persist the play — claim will rebuild it */
  stored: boolean;
  prize: PrizeView;
};

export type ClaimResponse = {
  code: string;
  options: string[];
  emailSent: boolean;
  skipped?: boolean;
  emailConfigured?: boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Ask the server for a result. Venue wifi is unreliable and a dropped request
 * would cost somebody their turn, so this retries before giving up.
 */
export async function requestOutcome(
  mode: GameMode,
  score?: number,
  attempts = 3
): Promise<OutcomeResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(400 * attempt);
    try {
      const res = await fetch("/api/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, score }),
      });
      if (!res.ok) throw new Error(`outcome ${res.status}`);
      return (await res.json()) as OutcomeResponse;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("outcome request failed");
}

export async function requestClaim(payload: {
  outcome: OutcomeResponse;
  email?: string;
  consent?: boolean;
  skipEmail?: boolean;
}): Promise<ClaimResponse> {
  const { outcome } = payload;
  const res = await fetch("/api/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: outcome.id,
      email: payload.email,
      consent: payload.consent,
      skipEmail: payload.skipEmail,
      // only consulted if the play never reached storage
      tierId: outcome.prize.id,
      mode: outcome.mode,
    }),
  });
  const data = (await res.json()) as ClaimResponse & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "claim failed");
  return data;
}

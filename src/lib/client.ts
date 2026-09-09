import type { PlayDetail, PlayResult } from "./types";

export type PrizeView = {
  id: string;
  label: string;
  blurb: string;
  options: string[];
  isGrand: boolean;
};

export type PlayResponse = {
  code: string;
  stage: "wheel" | "second-chance" | "decline";
  result: PlayResult;
  grid: string[][] | null;
  winningRow: number | null;
  /** true only after a losing spin, while the question is still on the table */
  secondChanceAvailable: boolean;
  prize: PrizeView;
};

export type PlayError =
  | "unknown-token"
  | "already-played"
  | "already-won"
  | "spin-first"
  | "storage"
  | "network";

export class PlayFailed extends Error {
  constructor(readonly reason: PlayError) {
    super(reason);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Venue wifi drops requests, and a dropped one would cost somebody their spin,
 * so this retries. A refusal from the server — a token that doesn't exist or
 * has already been played — is final and is never retried.
 */
export async function play(
  body: { code: string; stage: "wheel" | "second-chance" | "decline"; score?: number; detail?: PlayDetail },
  attempts = 3
): Promise<PlayResponse> {
  let last: PlayError = "network";
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(400 * attempt);
    try {
      const res = await fetch("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) return (await res.json()) as PlayResponse;

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      const reason = (data.error ?? "storage") as PlayError;
      if (res.status === 404 || res.status === 409 || res.status === 400) {
        throw new PlayFailed(reason);
      }
      last = reason;
    } catch (err) {
      if (err instanceof PlayFailed) throw err;
      last = "network";
    }
  }
  throw new PlayFailed(last);
}

export async function requestToken(body: {
  email: string;
  consent: boolean;
  locale: string;
  session: string;
}): Promise<string> {
  const res = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { code?: string; error?: string };
  if (!res.ok || !data.code) throw new Error(data.error ?? "token failed");
  return data.code;
}

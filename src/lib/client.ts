import type { GameMode, PlayResult } from "./types";

export type PrizeView = {
  id: string;
  label: string;
  item: string;
  blurb: string;
  isGrand: boolean;
};

export type OutcomeResponse = {
  id: string;
  result: PlayResult;
  grid: string[][] | null;
  winningRow: number | null;
  prize: PrizeView;
};

export type ClaimResponse = {
  code: string;
  emailSent: boolean;
  skipped?: boolean;
  emailConfigured?: boolean;
};

export async function requestOutcome(
  mode: GameMode,
  score?: number
): Promise<OutcomeResponse> {
  const res = await fetch("/api/outcome", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, score }),
  });
  if (!res.ok) throw new Error("outcome request failed");
  return (await res.json()) as OutcomeResponse;
}

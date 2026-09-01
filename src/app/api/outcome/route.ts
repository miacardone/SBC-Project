import { NextResponse } from "next/server";
import { makeId, makePrizeCode } from "@/lib/code";
import {
  CONSOLATION,
  drawQuizTier,
  drawWinningTier,
  QUIZ_PASS_SCORE,
  SLOT_WIN_RATE,
} from "@/lib/prizes";
import { QUIZ_LENGTH } from "@/lib/quiz";
import { buildGrid } from "@/lib/slots";
import { awardedCounts, saveEntry } from "@/lib/store";
import type { Entry, GameMode, PlayResult, PrizeTier } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { mode?: GameMode; score?: number };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const mode: GameMode = body.mode === "classroom" ? "classroom" : "casino";
  const awarded = await awardedCounts();

  let result: PlayResult;
  let tier: PrizeTier;
  let score: number | null = null;

  if (mode === "classroom") {
    score = Math.max(0, Math.min(QUIZ_LENGTH, Math.round(body.score ?? 0)));
    result = score >= QUIZ_PASS_SCORE ? "win" : "lose";
    tier = result === "win" ? drawQuizTier(score, QUIZ_LENGTH, awarded) : CONSOLATION;
  } else {
    result = Math.random() < SLOT_WIN_RATE ? "win" : "lose";
    tier = result === "win" ? drawWinningTier(awarded) : CONSOLATION;
  }

  // An inventory cap can knock a "win" back down to the consolation shelf.
  if (result === "win" && tier.id === CONSOLATION.id) result = "lose";

  const { grid, winningRow } =
    mode === "casino" ? buildGrid(result, tier.isGrand) : { grid: null, winningRow: null };

  const entry: Entry = {
    id: makeId(),
    code: makePrizeCode(),
    email: "",
    mode,
    result,
    score,
    tierId: tier.id,
    tierLabel: tier.label,
    tierItem: tier.item,
    consent: false,
    emailSent: false,
    createdAt: new Date().toISOString(),
    redeemedAt: null,
  };
  await saveEntry(entry);

  // The code is deliberately withheld until they hit the claim screen.
  return NextResponse.json({
    id: entry.id,
    result,
    grid,
    winningRow,
    prize: { id: tier.id, label: tier.label, item: tier.item, blurb: tier.blurb, isGrand: tier.isGrand },
  });
}

import { NextResponse } from "next/server";
import { makeId, makePrizeCode } from "@/lib/code";
import {
  CONSOLATION,
  drawSkillTier,
  drawWinningTier,
  SLOT_WIN_RATE,
} from "@/lib/prizes";
import { QUIZ_LENGTH, QUIZ_PASS_SCORE } from "@/lib/quiz";
import { CATCH_PASS, CATCH_TOTAL } from "@/lib/catch";
import { buildGrid } from "@/lib/slots";
import { awardedCounts, saveEntry } from "@/lib/store";
import type { Entry, GameMode, PlayDetail, PlayResult, PrizeTier } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  mode?: GameMode;
  score?: number;
  locale?: string;
  detail?: PlayDetail;
};

/** Never trust the shape or the size of what a kiosk posts. */
function cleanDetail(raw: unknown, mode: GameMode): PlayDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const names = (v: unknown) =>
    Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string").slice(0, 40).map((x) => x.slice(0, 80))
      : [];

  if (mode === "classroom" && Array.isArray(d.answers)) {
    return {
      kind: "classroom",
      answers: d.answers.slice(0, 20).map((a) => {
        const entry = (a ?? {}) as Record<string, unknown>;
        return {
          id: typeof entry.id === "string" ? entry.id.slice(0, 60) : "",
          picked: typeof entry.picked === "number" ? entry.picked : null,
          correct: entry.correct === true,
        };
      }),
    };
  }
  if (mode === "catch") {
    return {
      kind: "catch",
      caught: names(d.caught),
      missed: names(d.missed),
      declined: names(d.declined),
      kept: names(d.kept),
    };
  }
  if (mode === "casino") {
    return { kind: "casino", bulls: typeof d.bulls === "number" ? d.bulls : 0 };
  }
  return null;
}

const MODES: GameMode[] = ["casino", "classroom", "catch"];

/** Pass mark and denominator for each skill game. */
const SKILL: Record<string, { outOf: number; pass: number }> = {
  classroom: { outOf: QUIZ_LENGTH, pass: QUIZ_PASS_SCORE },
  catch: { outOf: CATCH_TOTAL, pass: CATCH_PASS },
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const mode: GameMode = MODES.includes(body.mode as GameMode)
    ? (body.mode as GameMode)
    : "casino";

  // A storage hiccup must never cost a player their turn, so the counts fall
  // back to empty and the round still pays out.
  let awarded: Record<string, number> = {};
  try {
    awarded = await awardedCounts();
  } catch (err) {
    console.error("[outcome] could not read awarded counts:", err);
  }

  let result: PlayResult;
  let tier: PrizeTier;
  let score: number | null = null;
  let scoreOutOf: number | null = null;

  const skill = SKILL[mode];
  if (skill) {
    scoreOutOf = skill.outOf;
    score = Math.max(0, Math.min(skill.outOf, Math.round(body.score ?? 0)));
    result = score >= skill.pass ? "win" : "lose";
    tier = result === "win" ? drawSkillTier(score, skill.outOf, awarded) : CONSOLATION;
  } else {
    result = Math.random() < SLOT_WIN_RATE ? "win" : "lose";
    tier = result === "win" ? drawWinningTier(awarded) : CONSOLATION;
  }

  // An inventory cap can knock a "win" back down to the consolation shelf.
  if (result === "win" && tier.id === CONSOLATION.id) result = "lose";

  const { grid, winningRow } =
    mode === "casino"
      ? buildGrid(result, tier.isGrand)
      : { grid: null, winningRow: null };

  const entry: Entry = {
    id: makeId(),
    code: makePrizeCode(),
    email: "",
    mode,
    result,
    score,
    scoreOutOf,
    locale: typeof body.locale === "string" ? body.locale.slice(0, 12) : "en",
    detail: cleanDetail(body.detail, mode),
    tierId: tier.id,
    tierLabel: tier.label,
    tierOptions: tier.options,
    chosenPrize: null,
    consent: false,
    emailSent: false,
    createdAt: new Date().toISOString(),
    redeemedAt: null,
  };

  let stored = true;
  try {
    await saveEntry(entry);
  } catch (err) {
    stored = false;
    console.error("[outcome] FAILED TO PERSIST PLAY — check storage:", err);
  }

  // The code itself is withheld until the claim screen.
  return NextResponse.json({
    id: entry.id,
    mode,
    result,
    grid,
    winningRow,
    stored,
    prize: {
      id: tier.id,
      label: tier.label,
      blurb: tier.blurb,
      options: tier.options,
      isGrand: tier.isGrand,
    },
  });
}

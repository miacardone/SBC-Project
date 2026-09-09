import { NextResponse } from "next/server";
import { normalizeCode } from "@/lib/code";
import { sendPrizeEmail } from "@/lib/email";
import {
  CONSOLATION,
  drawSkillTier,
  drawWinningTier,
  WHEEL_WIN_RATE,
} from "@/lib/prizes";
import { QUIZ_LENGTH, QUIZ_PASS_SCORE } from "@/lib/quiz";
import { buildGrid } from "@/lib/slots";
import { awardedCounts, getEntry, incrementTier, updateEntry } from "@/lib/store";
import type { Entry, PlayDetail, PlayResult, PrizeTier } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Stage = "wheel" | "second-chance" | "decline";

type Body = {
  code?: string;
  stage?: Stage;
  score?: number;
  detail?: PlayDetail;
};

/** Never trust the shape or the size of what a kiosk posts. */
function cleanDetail(raw: unknown): PlayDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (!Array.isArray(d.answers)) return null;
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

function prizeView(tier: PrizeTier) {
  return {
    id: tier.id,
    label: tier.label,
    blurb: tier.blurb,
    options: tier.options,
    isGrand: tier.isGrand,
  };
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const code = normalizeCode(body.code ?? "");
  if (!code) return NextResponse.json({ error: "unknown-token" }, { status: 400 });

  let entry: Entry | null;
  try {
    entry = await getEntry(code);
  } catch (err) {
    console.error("[play] storage read failed:", err);
    return NextResponse.json({ error: "storage" }, { status: 503 });
  }
  if (!entry) return NextResponse.json({ error: "unknown-token" }, { status: 404 });

  const stage: Stage =
    body.stage === "second-chance" || body.stage === "decline" ? body.stage : "wheel";

  // One spin and at most one second chance per token, enforced here rather
  // than trusted from the screen.
  if (entry.result === "win") {
    return NextResponse.json({ error: "already-won" }, { status: 409 });
  }
  if (stage === "wheel" && entry.playedAt) {
    return NextResponse.json({ error: "already-played" }, { status: 409 });
  }
  if (stage !== "wheel" && !entry.playedAt) {
    return NextResponse.json({ error: "spin-first" }, { status: 409 });
  }
  if (stage !== "wheel" && entry.usedSecondChance) {
    return NextResponse.json({ error: "already-played" }, { status: 409 });
  }

  let awarded: Record<string, number> = {};
  try {
    awarded = await awardedCounts();
  } catch (err) {
    console.error("[play] could not read awarded counts:", err);
  }

  let result: PlayResult;
  let tier: PrizeTier;
  let score: number | null = null;
  let scoreOutOf: number | null = null;
  let detail: PlayDetail | null = null;

  if (stage === "decline") {
    // They passed on the second chance. Whatever they already hold stands.
    result = "lose";
    tier = CONSOLATION;
  } else if (stage === "second-chance") {
    scoreOutOf = QUIZ_LENGTH;
    score = Math.max(0, Math.min(QUIZ_LENGTH, Math.round(body.score ?? 0)));
    detail = cleanDetail(body.detail);
    result = score >= QUIZ_PASS_SCORE ? "win" : "lose";
    tier = result === "win" ? drawSkillTier(score, QUIZ_LENGTH, awarded) : CONSOLATION;
  } else {
    result = Math.random() < WHEEL_WIN_RATE ? "win" : "lose";
    tier = result === "win" ? drawWinningTier(awarded) : CONSOLATION;
  }

  // An exhausted tier quietly becomes a loss rather than a promise the booth
  // can't keep.
  if (result === "win" && tier.id === CONSOLATION.id) result = "lose";

  // A losing spin still awards the consolation straight away, so somebody who
  // wanders off mid-second-chance still holds a prize the booth can honour.
  // The email waits until the outcome is settled, so nobody gets two.
  const secondChanceAvailable = stage === "wheel" && result === "lose";
  const settled = !secondChanceAvailable;

  const patch: Partial<Entry> = {
    playedAt: new Date().toISOString(),
    usedSecondChance: stage === "second-chance" ? true : entry.usedSecondChance,
    tierId: tier.id,
    tierLabel: tier.label,
    tierOptions: tier.options,
  };
  if (stage === "wheel") {
    patch.mode = "casino";
    patch.result = result;
  }
  if (stage === "second-chance") {
    patch.mode = "classroom";
    patch.result = result;
    patch.score = score;
    patch.scoreOutOf = scoreOutOf;
    patch.detail = detail;
  }

  const updated = await updateEntry(code, patch);
  if (!updated) return NextResponse.json({ error: "storage" }, { status: 503 });

  // Consolation has no cap, so awarding it on a losing spin and again on a
  // losing second chance costs nothing; a real tier is only ever counted once.
  if (tier.id !== entry.tierId) await incrementTier(tier.id);

  if (settled) {
    sendPrizeEmail(updated)
      .then((sent) => (sent ? updateEntry(code, { emailSent: true }) : null))
      .catch((err) => console.error("[play] prize email failed:", err));
  }

  const { grid, winningRow } =
    stage === "wheel" ? buildGrid(result, tier.isGrand) : { grid: null, winningRow: null };

  return NextResponse.json({
    code: updated.code,
    stage,
    result,
    grid,
    winningRow,
    /** offered only after a losing spin */
    secondChanceAvailable,
    prize: prizeView(tier),
  });
}

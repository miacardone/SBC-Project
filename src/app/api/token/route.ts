import { NextResponse } from "next/server";
import { makeId, makeToken } from "@/lib/code";
import { checkEmail, maskEmail } from "@/lib/email-check";
import { emailConfigured, sendTokenEmail } from "@/lib/email";
import { getEntryBySession, saveEntry } from "@/lib/store";
import type { Entry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  email?: string;
  consent?: boolean;
  locale?: string;
  /** present when the phone claimed a kiosk's QR session */
  session?: string;
};

/**
 * Capture the address and mint the token.
 *
 * A typed address is not proof of anything, so the token is NOT returned to a
 * typed request — it is emailed, and having to open the inbox is what makes the
 * address real. The one exception is a booth whose email sending isn't
 * configured: there the token is shown anyway and the row is flagged
 * unverified, because a kiosk nobody can play is a worse failure than a soft
 * lead list, and the console says so in a banner.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "syntax" }, { status: 400 });
  }

  const verdict = await checkEmail(body.email ?? "");
  if (!verdict.ok) {
    return NextResponse.json({ error: verdict.reason }, { status: 400 });
  }

  const session = typeof body.session === "string" ? body.session.slice(0, 40) : null;

  // A phone that submits twice — double tap, back button — must not mint a
  // second token for the same kiosk session.
  if (session) {
    const existing = await getEntryBySession(session);
    if (existing) {
      return NextResponse.json(
        existing.verifiedBy === "none"
          ? { code: existing.code, verified: false }
          : { delivered: true, hint: maskEmail(existing.email) }
      );
    }
  }

  const entry: Entry = {
    id: makeId(),
    code: makeToken(),
    email: verdict.email,
    consent: Boolean(body.consent),
    locale: typeof body.locale === "string" ? body.locale.slice(0, 12) : "en",
    session,
    createdAt: new Date().toISOString(),
    tokenEmailSent: false,
    verifiedBy: "none",
    playedAt: null,
    mode: null,
    result: null,
    score: null,
    scoreOutOf: null,
    detail: null,
    usedSecondChance: false,
    tierId: null,
    tierLabel: null,
    tierOptions: [],
    chosenPrize: null,
    emailSent: false,
    redeemedAt: null,
  };

  // No sender configured: hand the token over and mark the row unverified
  // rather than stranding the queue.
  if (!emailConfigured) {
    console.warn("[token] email not configured — issuing an unverified token");
    try {
      await saveEntry(entry);
    } catch (err) {
      console.error("[token] FAILED TO PERSIST — check storage:", err);
      return NextResponse.json({ error: "storage" }, { status: 503 });
    }
    return NextResponse.json({ code: entry.code, verified: false });
  }

  const sent = await sendTokenEmail(entry);
  if (!sent) {
    return NextResponse.json({ error: "undeliverable" }, { status: 502 });
  }

  entry.tokenEmailSent = true;
  entry.verifiedBy = "email";
  try {
    await saveEntry(entry);
  } catch (err) {
    console.error("[token] FAILED TO PERSIST — check storage:", err);
    return NextResponse.json({ error: "storage" }, { status: 503 });
  }

  // Deliberately no code in the response: the inbox is the verification.
  return NextResponse.json({ delivered: true, hint: maskEmail(entry.email) });
}

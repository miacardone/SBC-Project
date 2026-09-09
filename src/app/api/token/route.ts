import { NextResponse } from "next/server";
import { makeId, makeToken } from "@/lib/code";
import { sendTokenEmail } from "@/lib/email";
import { getEntryBySession, saveEntry } from "@/lib/store";
import type { Entry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Body = {
  email?: string;
  consent?: boolean;
  locale?: string;
  /** present when the phone claimed a kiosk's QR session */
  session?: string;
};

/**
 * Capture the email and mint the token. The token is returned in the response
 * so the phone can show it the instant they tap share — waiting on an inbox at
 * a trade show is how you lose the queue. The email goes out as well, so they
 * still have it after they walk away.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid-email" }, { status: 400 });
  }

  const session = typeof body.session === "string" ? body.session.slice(0, 40) : null;

  // A phone that submits twice — double tap, back button — must not mint a
  // second token for the same kiosk session.
  if (session) {
    const existing = await getEntryBySession(session);
    if (existing) {
      return NextResponse.json({ code: existing.code, reused: true });
    }
  }

  const entry: Entry = {
    id: makeId(),
    code: makeToken(),
    email,
    consent: Boolean(body.consent),
    locale: typeof body.locale === "string" ? body.locale.slice(0, 12) : "en",
    session,
    createdAt: new Date().toISOString(),
    tokenEmailSent: false,
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

  try {
    await saveEntry(entry);
  } catch (err) {
    console.error("[token] FAILED TO PERSIST — check storage:", err);
    return NextResponse.json(
      { error: "Storage is down — please grab a Chargebacks911 rep." },
      { status: 503 }
    );
  }

  // Best effort. They already have the token on screen.
  sendTokenEmail(entry)
    .then(() => undefined)
    .catch((err: unknown) => console.error("[token] email failed:", err));

  return NextResponse.json({ code: entry.code });
}

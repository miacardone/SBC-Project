import { NextResponse } from "next/server";
import { sendPrizeEmail, emailConfigured } from "@/lib/email";
import { listEntries, updateEntry } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Body = { id?: string; email?: string; consent?: boolean; skipEmail?: boolean };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "missing play id" }, { status: 400 });
  }

  const entries = await listEntries();
  const entry = entries.find((e) => e.id === body.id);
  if (!entry) {
    return NextResponse.json({ error: "that play has expired" }, { status: 404 });
  }

  // Player declined to hand over an email — they still get their code on screen.
  if (body.skipEmail) {
    return NextResponse.json({ code: entry.code, emailSent: false, skipped: true });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "that doesn't look like an email" }, { status: 400 });
  }

  const updated = await updateEntry(entry.code, {
    email,
    consent: Boolean(body.consent),
  });
  if (!updated) {
    return NextResponse.json({ error: "could not save that" }, { status: 500 });
  }

  const sent = await sendPrizeEmail(updated);
  if (sent) await updateEntry(entry.code, { emailSent: true });

  return NextResponse.json({
    code: entry.code,
    emailSent: sent,
    emailConfigured,
  });
}

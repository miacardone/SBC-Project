import { NextResponse } from "next/server";
import { emailConfigured, sendPrizeEmail } from "@/lib/email";
import { makePrizeCode } from "@/lib/code";
import { tierById } from "@/lib/prizes";
import { listEntries, saveEntry, updateEntry } from "@/lib/store";
import type { Entry, GameMode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Body = {
  id?: string;
  email?: string;
  consent?: boolean;
  skipEmail?: boolean;
  /** only used to rebuild a play whose write failed — validated server-side */
  tierId?: string;
  mode?: GameMode;
  score?: number | null;
};

/**
 * Rebuild a play that never made it to storage. This only runs when
 * /api/outcome logged a persistence failure; the tier is looked up in the
 * server's own table, so the client can't invent a prize that doesn't exist.
 */
async function recover(body: Body): Promise<Entry | null> {
  const tier = tierById(body.tierId ?? "");
  const entry: Entry = {
    id: body.id ?? makePrizeCode(),
    code: makePrizeCode(),
    email: "",
    mode: body.mode ?? "casino",
    result: tier.id === "consolation" ? "lose" : "win",
    score: body.score ?? null,
    scoreOutOf: null,
    tierId: tier.id,
    tierLabel: tier.label,
    tierOptions: tier.options,
    chosenPrize: null,
    consent: false,
    emailSent: false,
    createdAt: new Date().toISOString(),
    redeemedAt: null,
  };
  try {
    await saveEntry(entry);
    console.warn("[claim] recovered an unpersisted play:", entry.code);
    return entry;
  } catch (err) {
    console.error("[claim] could not recover play:", err);
    return null;
  }
}

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

  let entry: Entry | null = null;
  try {
    entry = (await listEntries()).find((e) => e.id === body.id) ?? null;
  } catch (err) {
    console.error("[claim] could not read entries:", err);
  }
  if (!entry) entry = await recover(body);
  if (!entry) {
    return NextResponse.json(
      { error: "Storage is down — please grab a Chargebacks911 rep." },
      { status: 503 }
    );
  }

  // Player declined to hand over an email — they still get their code on screen.
  if (body.skipEmail) {
    return NextResponse.json({
      code: entry.code,
      options: entry.tierOptions,
      emailSent: false,
      skipped: true,
    });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "that doesn't look like an email" }, { status: 400 });
  }

  const updated =
    (await updateEntry(entry.code, { email, consent: Boolean(body.consent) })) ?? {
      ...entry,
      email,
      consent: Boolean(body.consent),
    };

  const sent = await sendPrizeEmail(updated);
  if (sent) await updateEntry(entry.code, { emailSent: true });

  return NextResponse.json({
    code: entry.code,
    options: entry.tierOptions,
    emailSent: sent,
    emailConfigured,
  });
}

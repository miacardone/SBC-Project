import { NextResponse } from "next/server";
import { checkPin, unauthorized } from "@/lib/admin";
import { normalizeCode } from "@/lib/code";
import { getEntry, updateEntry } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  code?: string;
  /** which option the player picked; omit to just look the code up */
  chosenPrize?: string;
  undo?: boolean;
};

export async function POST(request: Request) {
  if (!checkPin(request)) return unauthorized();

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const code = normalizeCode(body.code ?? "");
  const entry = await getEntry(code);
  if (!entry) {
    return NextResponse.json({ error: `No prize found for ${code}` }, { status: 404 });
  }

  if (body.undo) {
    const reverted = await updateEntry(code, { redeemedAt: null, chosenPrize: null });
    return NextResponse.json({ entry: reverted, status: "reopened" });
  }

  // No choice sent yet — this is the lookup half. Tell the operator what the
  // player is entitled to and let them tap the one actually handed over.
  if (!body.chosenPrize) {
    return NextResponse.json({
      entry,
      status: entry.redeemedAt ? "already-redeemed" : "ready",
    });
  }

  if (!entry.tierOptions.includes(body.chosenPrize)) {
    return NextResponse.json(
      { error: "That prize isn't in this code's tier." },
      { status: 400 }
    );
  }

  if (entry.redeemedAt) {
    return NextResponse.json({ entry, status: "already-redeemed" });
  }

  const updated = await updateEntry(code, {
    redeemedAt: new Date().toISOString(),
    chosenPrize: body.chosenPrize,
  });
  return NextResponse.json({ entry: updated, status: "redeemed" });
}

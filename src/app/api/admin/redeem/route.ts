import { NextResponse } from "next/server";
import { checkPin, unauthorized } from "@/lib/admin";
import { normalizeCode } from "@/lib/code";
import { getEntry, updateEntry } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { code?: string; undo?: boolean };

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
    const reverted = await updateEntry(code, { redeemedAt: null });
    return NextResponse.json({ entry: reverted, status: "reopened" });
  }

  if (entry.redeemedAt) {
    return NextResponse.json({ entry, status: "already-redeemed" });
  }

  const updated = await updateEntry(code, { redeemedAt: new Date().toISOString() });
  return NextResponse.json({ entry: updated, status: "redeemed" });
}

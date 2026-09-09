import { NextResponse } from "next/server";
import { normalizeCode } from "@/lib/code";
import { getEntry } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Validates a typed token before the machine unlocks. Nothing is spent here —
 * the spin itself is a separate, guarded write — so a mistyped code costs the
 * player nothing but a retry.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("code") ?? "";
  const code = normalizeCode(raw);
  if (!code) return NextResponse.json({ ok: false, reason: "unknown-token" });

  const entry = await getEntry(code);
  if (!entry) return NextResponse.json({ ok: false, reason: "unknown-token" });
  if (entry.playedAt) return NextResponse.json({ ok: false, reason: "already-played" });

  return NextResponse.json({ ok: true });
}

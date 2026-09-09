import { NextResponse } from "next/server";
import { getEntryBySession } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Polled by the kiosk while its QR is on screen. One key read, so a booth day
 * of polling stays cheap.
 */
export async function GET(request: Request) {
  const session = new URL(request.url).searchParams.get("session");
  if (!session) return NextResponse.json({ error: "missing session" }, { status: 400 });

  const entry = await getEntryBySession(session);
  if (!entry) return NextResponse.json({ issued: false });

  // The kiosk is told a token exists, never what it is — they still have to
  // read it off their own phone and type it in.
  return NextResponse.json({ issued: true });
}

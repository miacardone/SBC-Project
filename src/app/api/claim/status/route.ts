import { NextResponse } from "next/server";
import { getEntryById } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The kiosk polls this while the QR code is on screen. As soon as the player
 * finishes on their phone the booth screen can move on by itself.
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const entry = await getEntryById(id);
  if (!entry) return NextResponse.json({ claimed: false });

  if (!entry.email) return NextResponse.json({ claimed: false });

  return NextResponse.json({
    claimed: true,
    code: entry.code,
    options: entry.tierOptions,
    emailSent: entry.emailSent,
  });
}

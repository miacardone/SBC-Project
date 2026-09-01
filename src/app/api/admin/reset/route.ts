import { NextResponse } from "next/server";
import { checkPin, unauthorized } from "@/lib/admin";
import { clearAll } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { confirm?: string };

/** Destructive and unrecoverable, so it needs the PIN and a typed confirmation. */
export async function POST(request: Request) {
  if (!checkPin(request)) return unauthorized();

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (body.confirm !== "RESET") {
    return NextResponse.json(
      { error: "Type RESET to confirm." },
      { status: 400 }
    );
  }

  const removed = await clearAll();
  console.warn(`[admin] cleared ${removed} plays`);
  return NextResponse.json({ removed });
}

import { NextResponse } from "next/server";
import { checkPin, unauthorized } from "@/lib/admin";
import { listEntries } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: string | number | boolean | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  if (!checkPin(request)) return unauthorized();

  const entries = await listEntries();
  const url = new URL(request.url);

  if (url.searchParams.get("format") === "csv") {
    const header = [
      "email",
      "code",
      "tier",
      "eligible_for",
      "prize_taken",
      "game",
      "result",
      "score",
      "score_out_of",
      "consent",
      "email_sent",
      "redeemed_at",
      "played_at",
    ];
    const rows = entries
      .filter((e) => e.email)
      .map((e) =>
        [
          e.email,
          e.code,
          e.tierId,
          e.tierOptions.join(" | "),
          e.chosenPrize,
          e.mode,
          e.result,
          e.score,
          e.scoreOutOf,
          e.consent,
          e.emailSent,
          e.redeemedAt,
          e.createdAt,
        ].map(csvCell).join(",")
      );
    const csv = [header.join(","), ...rows].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="cb911-leads.csv"`,
      },
    });
  }

  return NextResponse.json({ entries });
}

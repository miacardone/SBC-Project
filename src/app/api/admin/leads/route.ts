import { NextResponse } from "next/server";
import { checkPin, unauthorized } from "@/lib/admin";
import { listEntries } from "@/lib/store";
import { QUESTIONS } from "@/lib/quiz";
import { LOCALE_NAMES } from "@/lib/i18n/locales";
import type { Entry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A readable account of the round, so the CSV is useful without a decoder. */
function summarize(entry: Entry): string {
  const d = entry.detail;
  if (!d) return "";

  if (d.kind === "classroom") {
    return d.answers
      .map((a, i) => {
        const q = QUESTIONS.find((x) => x.id === a.id);
        const label = q ? q.prompt : a.id;
        const chose =
          a.picked === null ? "no answer" : (q?.options[a.picked] ?? `option ${a.picked + 1}`);
        return `Q${i + 1} ${a.correct ? "OK" : "X"}: ${label} -> ${chose}`;
      })
      .join(" ; ");
  }
  if (d.kind === "catch") {
    return [
      `caught: ${d.caught.join(", ") || "none"}`,
      `missed: ${d.missed.join(", ") || "none"}`,
      `wrongly declined: ${d.declined.join(", ") || "none"}`,
    ].join(" ; ");
  }
  return `bulls on the payline: ${d.bulls}`;
}

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
      "language",
      "answers",
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
          LOCALE_NAMES[e.locale] ?? e.locale ?? "",
          summarize(e),
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

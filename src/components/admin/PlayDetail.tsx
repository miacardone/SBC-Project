import { QUESTIONS } from "@/lib/quiz";
import { LOCALE_NAMES } from "@/lib/i18n/locales";
import type { Entry } from "@/lib/types";

/**
 * The booth console and the printed report both need the same account of a
 * round, so it lives here once. Always rendered in English — this is staff and
 * post-event reading, whatever language the player used.
 */
export function PlayDetail({ entry, print = false }: { entry: Entry; print?: boolean }) {
  const muted = print ? "text-neutral-500" : "text-white/40";
  const body = print ? "text-neutral-800" : "text-white/80";
  const good = print ? "text-emerald-700" : "text-emerald-300";
  const bad = print ? "text-red-700" : "text-cb-red-hot";
  const rule = print ? "border-neutral-200" : "border-edge";

  const d = entry.detail;

  if (!d) {
    return <p className={`text-sm ${muted}`}>No breakdown recorded for this play.</p>;
  }

  if (d.kind === "classroom") {
    return (
      <ol className="flex flex-col gap-2">
        {d.answers.map((a, i) => {
          const q = QUESTIONS.find((x) => x.id === a.id);
          const chose = a.picked === null ? "ran out of time" : q?.options[a.picked];
          return (
            <li key={`${a.id}-${i}`} className={`border-b ${rule} pb-2 last:border-0`}>
              <div className={`text-sm font-semibold ${body}`}>
                {i + 1}. {q?.prompt ?? a.id}
              </div>
              <div className={`mt-0.5 text-sm ${a.correct ? good : bad}`}>
                {a.correct ? "✓" : "✗"} answered: {chose}
              </div>
              {!a.correct && q && (
                <div className={`text-sm ${good}`}>correct: {q.options[q.answer]}</div>
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  if (d.kind === "catch") {
    const group = (title: string, rows: string[], tone: string) => (
      <div>
        <div className={`text-xs font-semibold uppercase tracking-[0.2em] ${muted}`}>
          {title} ({rows.length})
        </div>
        <div className={`mt-1 text-sm ${rows.length ? tone : muted}`}>
          {rows.length ? rows.join(", ") : "none"}
        </div>
      </div>
    );
    return (
      <div className="flex flex-col gap-3">
        {group("Fraud caught", d.caught, good)}
        {group("Fraud that got through", d.missed, bad)}
        {group("Good customers wrongly declined", d.declined, bad)}
      </div>
    );
  }

  return (
    <p className={`text-sm ${body}`}>
      {d.bulls} bull{d.bulls === 1 ? "" : "s"} landed on the payline.
    </p>
  );
}

/** One-line header shared by the modal and the report. */
export function playSummary(entry: Entry): string {
  const parts: string[] = [entry.mode];
  if (entry.score !== null && entry.scoreOutOf !== null) {
    parts.push(`${entry.score}/${entry.scoreOutOf}`);
  }
  parts.push(entry.result === "win" ? "win" : "no win");
  if (entry.locale) parts.push(LOCALE_NAMES[entry.locale] ?? entry.locale);
  return parts.join(" · ");
}

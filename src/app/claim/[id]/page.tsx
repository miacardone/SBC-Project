import { getEntryById } from "@/lib/store";
import { ClaimForm } from "./ClaimForm";
import { fill, getDictionary } from "@/lib/i18n/dictionaries";
import { localeDir } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/locales/en";
import type { Entry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** What the player just did, in one line, so the phone confirms it's their play. */
function scoreLine(entry: Entry, t: Dictionary): string {
  const vars = { score: entry.score ?? 0, total: entry.scoreOutOf ?? 0 };
  if (entry.mode === "classroom" && entry.score !== null) {
    return fill(t.phone.scoredQuiz, vars);
  }
  if (entry.mode === "catch" && entry.score !== null) {
    return fill(t.phone.caughtFraud, vars);
  }
  return entry.result === "win" ? t.phone.beatSlots : t.phone.playedSlots;
}

function Shell({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  return (
    <div className="h-full overflow-auto" lang={lang} dir={localeDir(lang)}>
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 px-5 py-10">
        <div className="text-center">
          <div className="font-[family-name:var(--font-display)] text-5xl leading-none">
            <span className="text-white">cb</span>
            <span className="text-cb-red">911</span>
          </div>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/30">
            reclaim <span className="text-cb-red/70">your</span> revenue
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function ClaimPage({ params, searchParams }: PageProps<"/claim/[id]">) {
  const { id } = await params;
  // The kiosk puts the player's language in the QR link, so the phone opens in
  // whatever they picked at the booth.
  const { lang } = await searchParams;
  const locale = typeof lang === "string" ? lang : "en";
  const t = getDictionary(locale);
  const entry = await getEntryById(id);

  if (!entry) {
    return (
      <Shell lang={locale}>
        <div className="rounded-2xl border border-edge bg-panel p-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white">
            {t.phone.expiredTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">{t.phone.expiredBody}</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell lang={locale}>
      <div className="text-center">
        <div
          className={`font-[family-name:var(--font-display)] text-5xl uppercase leading-none ${
            entry.result === "win" ? "text-cb-red" : "text-white"
          }`}
        >
          {(t.tiers as Record<string, { label: string }>)[entry.tierId]?.label ?? entry.tierLabel}
        </div>
        <p className="mt-2 text-sm text-white/50">{scoreLine(entry, t)}</p>
      </div>

      <div className="rounded-2xl border border-edge bg-panel p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
          {t.phone.eligible}
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {entry.tierOptions.map((option) => (
            <li
              key={option}
              className="rounded-xl border border-cb-red/40 bg-cb-red/10 px-4 py-3 text-center font-semibold text-white"
            >
              {(t.prizes as Record<string, string>)[option] ?? option}
            </li>
          ))}
        </ul>
      </div>

      <ClaimForm
        id={entry.id}
        existingCode={entry.email ? entry.code : null}
        dict={t}
      />
    </Shell>
  );
}

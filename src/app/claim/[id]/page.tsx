import { getEntryById } from "@/lib/store";
import { ClaimForm } from "./ClaimForm";
import type { Entry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** What the player just did, in one line, so the phone confirms it's their play. */
function scoreLine(entry: Entry): string {
  if (entry.mode === "classroom" && entry.score !== null) {
    return `You scored ${entry.score}/${entry.scoreOutOf} on the Chargeback Challenge`;
  }
  if (entry.mode === "catch" && entry.score !== null) {
    return `You caught ${entry.score} of ${entry.scoreOutOf} fraudulent orders`;
  }
  return entry.result === "win" ? "You beat the slot machine" : "You played the slot machine";
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-auto">
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

export default async function ClaimPage({ params }: PageProps<"/claim/[id]">) {
  const { id } = await params;
  const entry = await getEntryById(id);

  if (!entry) {
    return (
      <Shell>
        <div className="rounded-2xl border border-edge bg-panel p-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white">
            Link expired
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            We can&apos;t find that play. Grab anyone at the Chargebacks911 booth — they can
            sort you out.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="text-center">
        <div
          className={`font-[family-name:var(--font-display)] text-5xl uppercase leading-none ${
            entry.result === "win" ? "text-cb-red" : "text-white"
          }`}
        >
          {entry.tierLabel}
        </div>
        <p className="mt-2 text-sm text-white/50">{scoreLine(entry)}</p>
      </div>

      <div className="rounded-2xl border border-edge bg-panel p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
          You&apos;re eligible for — pick one at the booth
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {entry.tierOptions.map((option) => (
            <li
              key={option}
              className="rounded-xl border border-cb-red/40 bg-cb-red/10 px-4 py-3 text-center font-semibold text-white"
            >
              {option}
            </li>
          ))}
        </ul>
      </div>

      <ClaimForm id={entry.id} existingCode={entry.email ? entry.code : null} />
    </Shell>
  );
}

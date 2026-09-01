"use client";

import { Backdrop, CornerControls, Logo, PillButton } from "./Chrome";
import { fill, useI18n } from "@/lib/i18n";
import {
  CATCH_PASS,
  CATCH_TOTAL,
  TRUE_COST_MULTIPLIER,
  money,
  type CatchResult,
  type Transaction,
} from "@/lib/catch";

type Props = {
  result: CatchResult;
  onContinue: () => void;
  onHome: () => void;
};

const sum = (rows: Transaction[]) => rows.reduce((total, r) => total + r.amount, 0);

export function CatchResults({ result, onContinue, onHome }: Props) {
  const { t } = useI18n();
  const caught = result.caught.length;
  const perfect = caught >= CATCH_TOTAL;
  const passed = caught >= CATCH_PASS;

  const protectedRevenue = sum(result.caught);
  const lost = sum(result.missed);
  const trueCost = lost * TRUE_COST_MULTIPLIER;
  const turnedAway = sum(result.declined);
  const kept = result.kept.length;

  // The one line that sums up the round: what you saved, minus what walked out
  // the door in either direction.
  const net = protectedRevenue - trueCost - turnedAway;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-[3vmin]">
      <Backdrop intensity={0.5} />
      <CornerControls>
        <PillButton onClick={onHome}>{t.common.home}</PillButton>
      </CornerControls>

      <div className="@container relative z-10 flex w-[min(94vw,104vh)] max-w-[1400px] flex-col gap-[2cqw]">
        {/* headline */}
        <div className="flex items-center justify-between gap-[2cqw]">
          <Logo className="w-[11cqw] text-[3.4cqw]" />
          <div className="text-center">
            <div className="font-[family-name:var(--font-display)] text-[2.6cqw] uppercase leading-none text-white/50">
              {t.catchResults.youCaught}
            </div>
            <div
              className={`font-[family-name:var(--font-display)] text-[8cqw] leading-none ${
                perfect ? "text-gold" : passed ? "text-cb-red" : "text-white"
              }`}
            >
              {caught}
              <span className="text-white/25">/{CATCH_TOTAL}</span>
            </div>
          </div>
          <div className="w-[11cqw] text-right text-[1.4cqw] font-semibold uppercase leading-tight tracking-[0.2em] text-white/35">
            {perfect
              ? t.catchResults.jackpotUnlocked
              : passed
                ? t.catchResults.prizeUnlocked
                : t.catchResults.everyoneWins}
          </div>
        </div>

        {/* the damage */}
        <div className="grid grid-cols-2 gap-[1.4cqw] landscape:grid-cols-4">
          <Stat
            label={t.catchResults.revenueProtected}
            value={money(protectedRevenue)}
            note={fill(t.catchResults.ordersStopped, { count: caught })}
            tone="good"
          />
          <Stat
            label={t.catchResults.lostToChargebacks}
            value={money(lost)}
            note={
              lost > 0
                ? fill(t.catchResults.trueCost, { amount: money(trueCost) })
                : t.catchResults.nothingGotThrough
            }
            tone={lost > 0 ? "bad" : "good"}
          />
          <Stat
            label={t.catchResults.goodCustomersLost}
            value={String(result.declined.length)}
            note={
              result.declined.length > 0
                ? fill(t.catchResults.ordersDeclined, { amount: money(turnedAway) })
                : t.catchResults.noneDeclined
            }
            tone={result.declined.length > 0 ? "bad" : "good"}
          />
          <Stat
            label={t.catchResults.customersKept}
            value={String(kept)}
            note={t.catchResults.servedWithoutFriction}
            tone="good"
          />
        </div>

        {/* bottom line */}
        <div
          className={`rounded-[1.6cqw] border-2 p-[2cqw] text-center ${
            net >= 0 ? "border-emerald-400/50 bg-emerald-400/10" : "border-cb-red/60 bg-cb-red/10"
          }`}
        >
          <span className="text-[1.5cqw] font-semibold uppercase tracking-[0.3em] text-white/45">
            {t.catchResults.netPosition}
          </span>
          <div
            className={`mt-[0.6cqw] font-[family-name:var(--font-display)] text-[5cqw] leading-none ${
              net >= 0 ? "text-emerald-300" : "text-cb-red-hot"
            }`}
          >
            {net >= 0 ? "+" : "−"}
            {money(Math.abs(net))}
          </div>
          <p className="mt-[0.8cqw] text-[1.7cqw] text-white/50">
            {t.catchResults.netExplain}
          </p>
        </div>

        {/* what slipped past */}
        {(result.missed.length > 0 || result.declined.length > 0) && (
          <div className="flex flex-col gap-[1cqw]">
            {result.missed.slice(0, 2).map((row) => (
              <Row
                key={`m-${row.id}`}
                row={row}
                tell={cardTell(t, row)}
                verdict={t.catchResults.gotThrough}
                tone="bad"
              />
            ))}
            {result.declined.slice(0, 1).map((row) => (
              <Row
                key={`d-${row.id}`}
                row={row}
                tell={cardTell(t, row)}
                verdict={t.catchResults.wasLegit}
                tone="warn"
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onContinue}
          className="relative mx-auto overflow-hidden rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[6cqw] py-[1.6cqw] font-[family-name:var(--font-display)] text-[3.2cqw] uppercase leading-none tracking-wide text-white shadow-[0_0_4cqw_-1cqw_rgb(227_30_36_/_0.95)] transition active:scale-[0.97]"
        >
          <span className="relative z-10">{t.catchResults.seeMyPrize}</span>
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md animate-sweep" />
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: "good" | "bad";
}) {
  return (
    <div className="rounded-[1.4cqw] border-2 border-edge bg-black/40 p-[1.8cqw]">
      <div className="text-[1.3cqw] font-semibold uppercase tracking-[0.22em] text-white/40">
        {label}
      </div>
      <div
        className={`mt-[0.6cqw] font-[family-name:var(--font-display)] text-[4cqw] leading-none ${
          tone === "good" ? "text-emerald-300" : "text-cb-red-hot"
        }`}
      >
        {value}
      </div>
      <div className="mt-[0.6cqw] text-[1.4cqw] leading-tight text-white/40">{note}</div>
    </div>
  );
}

/** Merchants stay as written; only the tell is translated. */
function cardTell(t: ReturnType<typeof useI18n>["t"], row: Transaction): string {
  return (t.cards as Record<string, string>)[row.merchant] ?? row.tell;
}

function Row({
  row,
  tell,
  verdict,
  tone,
}: {
  row: Transaction;
  tell: string;
  verdict: string;
  tone: "bad" | "warn";
}) {
  return (
    <div
      className={`flex items-center gap-[1.6cqw] rounded-[1.2cqw] border-2 bg-black/40 px-[1.6cqw] py-[1.2cqw] ${
        tone === "bad" ? "border-cb-red/40" : "border-amber-400/40"
      }`}
    >
      <span
        className={`shrink-0 rounded-lg px-[1.2cqw] py-[0.6cqw] font-[family-name:var(--font-display)] text-[1.6cqw] uppercase leading-none ${
          tone === "bad" ? "bg-cb-red text-white" : "bg-amber-400 text-black"
        }`}
      >
        {verdict}
      </span>
      <span className="text-[1.8cqw] font-semibold text-white">{row.merchant}</span>
      <span className="text-[1.8cqw] text-white/50">{money(row.amount)}</span>
      <span className="ml-auto truncate text-[1.6cqw] text-white/45">{tell}</span>
    </div>
  );
}

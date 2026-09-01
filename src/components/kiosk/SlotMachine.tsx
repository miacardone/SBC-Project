"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bulbs, Logo } from "./Chrome";
import { useI18n } from "@/lib/i18n";
import { requestOutcome } from "@/lib/client";
import { ReelSymbol } from "@/components/Symbols";
import { FILLER_SYMBOLS, BULLS_TO_WIN } from "@/lib/slots";
import type { OutcomeResponse } from "@/lib/client";

const PAD = 18;
const BASE_MS = 1500;
const STAGGER_MS = 280;

function randomFiller() {
  return FILLER_SYMBOLS[Math.floor(Math.random() * FILLER_SYMBOLS.length)];
}

/* ------------------------------------------------------------------ reel */

function Reel({
  column,
  nonce,
  index,
  spinning,
}: {
  column: string[];
  nonce: number;
  index: number;
  spinning: boolean;
}) {
  const strip = useMemo(() => {
    void nonce;
    return [...Array.from({ length: PAD }, randomFiller), ...column];
  }, [column, nonce]);

  const stripRef = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(!spinning);

  useEffect(() => {
    const el = stripRef.current;
    if (!el || !spinning) return;

    setSettled(false);
    // Snap to the top of the strip with no transition, then release it so the
    // whole strip rolls past the window and decelerates onto the final 3.
    el.style.transition = "none";
    el.style.transform = "translateY(0)";
    void el.offsetHeight;

    const duration = BASE_MS + index * STAGGER_MS;
    // Percentage translation is relative to the strip's own height, so the
    // reels land correctly at any screen size without measuring anything.
    const travel = ((strip.length - 3) / strip.length) * 100;
    el.style.transition = `transform ${duration}ms cubic-bezier(0.16, 0.68, 0.2, 1)`;
    el.style.transform = `translateY(-${travel}%)`;

    const timer = setTimeout(() => setSettled(true), duration);
    return () => clearTimeout(timer);
  }, [spinning, nonce, index, strip.length]);

  return (
    <div className="relative aspect-[1/3] overflow-hidden rounded-[1cqw] bg-gradient-to-b from-[#17171d] to-[#0b0b0f] shadow-[inset_0_0_3cqw_rgb(0_0_0_/_0.9)]">
      <div ref={stripRef} className="will-change-transform">
        {strip.map((symbol, i) => (
          <div
            key={`${nonce}-${i}`}
            className="flex aspect-square w-full items-center justify-center p-[1.4cqw]"
          >
            <ReelSymbol id={symbol} />
          </div>
        ))}
      </div>
      {!settled && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- machine */

const IDLE_GRID: string[][] = Array.from({ length: 5 }, () => [
  randomFiller(),
  randomFiller(),
  randomFiller(),
]);

type Props = {
  onFinish: (outcome: OutcomeResponse) => void;
  onQuit: () => void;
};

export function SlotMachine({ onFinish, onQuit }: Props) {
  const { t, locale } = useI18n();
  const [phase, setPhase] = useState<"ready" | "arming" | "spinning" | "result">("ready");
  const [grid, setGrid] = useState<string[][]>(IDLE_GRID);
  const [nonce, setNonce] = useState(0);
  const [outcome, setOutcome] = useState<OutcomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [win, setWin] = useState(0);

  const balance = 9911 - 9.11 * nonce + win;

  const spin = useCallback(async () => {
    if (phase === "arming" || phase === "spinning") return;
    setPhase("arming");
    setError(null);
    setWin(0);

    try {
      const data = await requestOutcome("casino", undefined, locale);

      setOutcome(data);
      setGrid(data.grid ?? IDLE_GRID);
      setNonce((n) => n + 1);
      setPhase("spinning");

      const total = BASE_MS + 4 * STAGGER_MS + 260;
      setTimeout(() => {
        if (data.result === "win") setWin(data.prize.isGrand ? 9911 : 911);
        setPhase("result");
      }, total);
    } catch {
      setError(t.slots.hiccup);
      setPhase("ready");
    }
  }, [phase, t.slots.hiccup, locale]);

  // Once the reels land, give people a beat to enjoy it, then move on.
  useEffect(() => {
    if (phase !== "result" || !outcome) return;
    const timer = setTimeout(() => onFinish(outcome), outcome.result === "win" ? 2600 : 1800);
    return () => clearTimeout(timer);
  }, [phase, outcome, onFinish]);

  const spinning = phase === "spinning";
  const busy = phase === "arming" || spinning;
  const won = phase === "result" && outcome?.result === "win";

  return (
    <div className="flex h-full w-full items-center justify-center p-[2vmin]">
      <div
        className="@container relative w-[min(92vw,80vh)] rounded-[2.5cqw] border-2 border-edge bg-gradient-to-b from-[#1a1a20] to-[#0a0a0d] p-[2.5cqw] shadow-[0_4cqw_10cqw_rgb(0_0_0_/_0.8)]"
      >
        {/* cabinet header */}
        <Logo className="text-[9cqw]" />
        <div className="mx-auto mt-[1.6cqw] h-px w-[70%] bg-gradient-to-r from-transparent via-cb-red/70 to-transparent" />

        {/* marquee */}
        <div
          className={`relative mx-auto mt-[2.2cqw] w-[86%] rounded-[1.4cqw] border-2 px-[3cqw] py-[2.8cqw] text-center transition-colors ${
            won ? "border-gold bg-gold/10" : "border-cb-red/70 bg-cb-red/5"
          }`}
        >
          <Bulbs count={22} className="absolute inset-x-[1.4cqw] top-[0.7cqw]" />
          <Bulbs count={22} className="absolute inset-x-[1.4cqw] bottom-[0.7cqw]" />
          <div className="font-[family-name:var(--font-display)] text-[5.2cqw] uppercase leading-none">
            {phase === "result" ? (
              won ? (
                <span className="text-gold">{t.slots.winner}</span>
              ) : (
                <span className="text-white/70">{t.slots.soClose}</span>
              )
            ) : (
              <>
                <span className="text-white">
                  {BULLS_TO_WIN} {t.slots.bulls}
                </span>{" "}
                <span className="text-cb-red">{t.slots.equalsWin}</span>
              </>
            )}
          </div>
        </div>

        {/* reels */}
        <div className="relative mt-[2.6cqw] rounded-[1.6cqw] border-[0.5cqw] border-cb-red/80 bg-black p-[1.2cqw] shadow-[0_0_5cqw_-1cqw_rgb(227_30_36_/_0.8)]">
          <Bulbs vertical count={9} className="absolute -left-[2.4cqw] inset-y-[2cqw]" />
          <Bulbs vertical count={9} className="absolute -right-[2.4cqw] inset-y-[2cqw]" />

          <div className="relative grid grid-cols-5 gap-[0.9cqw]">
            {grid.map((column, i) => (
              <Reel key={i} column={column} nonce={nonce} index={i} spinning={spinning} />
            ))}

            {/* payline */}
            <div
              className={`pointer-events-none absolute inset-x-0 top-1/2 h-[0.4cqw] -translate-y-1/2 transition-opacity duration-300 ${
                won ? "bg-gold shadow-[0_0_2cqw_0.4cqw_rgb(255_201_60_/_0.9)] opacity-100" : "bg-cb-red/60 opacity-60"
              }`}
            />
          </div>
        </div>

        {/* meters */}
        <div className="mt-[2.4cqw] grid grid-cols-3 gap-[1.4cqw]">
          <Meter label={t.slots.balance} value={`$${balance.toFixed(2)}`} accent />
          <Meter label={t.slots.bet} value="$9.11" />
          <Meter label={t.slots.win} value={`$${win.toFixed(2)}`} highlight={win > 0} />
        </div>

        {/* controls */}
        <div className="mt-[1.4cqw] grid grid-cols-[1fr_2fr_1fr] gap-[1.4cqw]">
          <button
            type="button"
            onClick={onQuit}
            disabled={busy}
            className="rounded-[1.2cqw] border border-edge bg-gradient-to-b from-panel to-pit py-[1.6cqw] font-[family-name:var(--font-display)] text-[2.4cqw] uppercase tracking-wider text-white/70 transition active:scale-95 disabled:opacity-30"
          >
            {t.slots.back}
          </button>

          <button
            type="button"
            onClick={spin}
            disabled={busy || phase === "result"}
            className="relative overflow-hidden rounded-[1.2cqw] border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep py-[1.6cqw] font-[family-name:var(--font-display)] text-[4.4cqw] uppercase leading-none tracking-wide text-white shadow-[0_0_5cqw_-1cqw_rgb(227_30_36_/_1),inset_0_0.3cqw_0_rgb(255_255_255_/_0.4)] transition active:scale-[0.97] disabled:opacity-50"
          >
            <span className="relative z-10">{busy ? t.slots.rolling : phase === "result" ? "—" : t.slots.spin}</span>
            {!busy && phase !== "result" && (
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md animate-sweep" />
            )}
          </button>

          <div className="flex items-center justify-center rounded-[1.2cqw] border border-edge bg-pit px-[1cqw] text-center font-[family-name:var(--font-sans)] text-[1.5cqw] font-semibold uppercase leading-tight tracking-[0.15em] text-white/45">
            {t.slots.everySpin}
            <br />
            {t.slots.winsMerch}
          </div>
        </div>

        {error && (
          <p className="mt-[1.4cqw] text-center text-[1.9cqw] text-cb-red-hot">{error}</p>
        )}

        <div className="mt-[2cqw] text-center font-[family-name:var(--font-sans)] text-[1.6cqw] font-semibold uppercase tracking-[0.4em] text-white/25">
          chargebacks911
        </div>
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  accent = false,
  highlight = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.2cqw] border bg-gradient-to-b from-[#141419] to-[#0a0a0e] px-[1.4cqw] py-[1.2cqw] text-center transition-colors ${
        highlight ? "border-gold/70" : "border-edge"
      }`}
    >
      <div
        className={`text-[1.5cqw] font-semibold uppercase tracking-[0.24em] ${
          accent ? "text-cb-red" : "text-white/45"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-[0.5cqw] font-[family-name:var(--font-display)] text-[3.2cqw] leading-none ${
          highlight ? "text-gold" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

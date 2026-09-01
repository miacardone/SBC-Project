"use client";

import { useEffect, useState } from "react";
import { Backdrop, Confetti, CornerControls, Logo, PillButton } from "./Chrome";
import { ReelSymbol } from "@/components/Symbols";
import type { OutcomeResponse } from "@/lib/client";

type Props = {
  outcome: OutcomeResponse;
  /** e.g. "Caught 8 of 10" — omitted for the slots */
  scoreLine?: string | null;
  onContinue: () => void;
  onHome: () => void;
};

export function PrizeReveal({ outcome, scoreLine, onContinue, onHome }: Props) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 40);
    return () => clearTimeout(t);
  }, []);

  const won = outcome.result === "win";
  const grand = outcome.prize.isGrand;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-[4vmin] text-center">
      <Backdrop intensity={won ? 1.2 : 0.5} />
      {grand && <Confetti />}
      <CornerControls>
        <PillButton onClick={onHome}>Home</PillButton>
      </CornerControls>

      <div className="relative z-10 flex w-full max-w-[130vmin] flex-col items-center gap-[2.6vmin]">
        <Logo className="text-[5.5vmin]" />

        {scoreLine && (
          <div className="animate-pop rounded-full border-2 border-edge bg-panel px-[3.4vmin] py-[1.2vmin] font-[family-name:var(--font-display)] text-[2.8vmin] uppercase leading-none tracking-wide text-white">
            {scoreLine}
          </div>
        )}

        <div
          className={`transition-all duration-500 ${shown ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
        >
          <div
            className={`font-[family-name:var(--font-display)] text-[12vmin] uppercase leading-[0.9] ${
              grand
                ? "text-gold [text-shadow:0_0_6vmin_rgb(255_201_60_/_0.7)]"
                : won
                  ? "text-cb-red [text-shadow:0_0_6vmin_rgb(227_30_36_/_0.7)]"
                  : "text-white"
            }`}
          >
            {outcome.prize.label}
          </div>
          <p className="mt-[1vmin] text-[2.3vmin] font-medium text-white/55">
            {outcome.prize.blurb}
          </p>
        </div>

        {/* what they can choose from */}
        <div
          className={`animate-rise [animation-delay:220ms] w-full max-w-[110vmin] rounded-[2.4vmin] border-2 p-[2.6vmin] ${
            grand
              ? "border-gold/70 bg-gold/10"
              : won
                ? "border-cb-red/70 bg-cb-red/10"
                : "border-edge bg-panel"
          }`}
        >
          <div className="flex items-center justify-center gap-[1.6vmin]">
            <div className="h-[6vmin] w-[6vmin] shrink-0">
              <ReelSymbol id={won ? "bull" : "coins"} />
            </div>
            <span className="text-[1.7vmin] font-semibold uppercase tracking-[0.32em] text-white/45">
              Pick any one of these at the booth
            </span>
          </div>

          <div className="mt-[2vmin] flex flex-wrap items-stretch justify-center gap-[1.6vmin]">
            {outcome.prize.options.map((option) => (
              <div
                key={option}
                className="flex-1 basis-[28vmin] rounded-[1.6vmin] border border-white/15 bg-black/45 px-[2vmin] py-[1.8vmin]"
              >
                <span className="font-[family-name:var(--font-display)] text-[3.4vmin] uppercase leading-tight text-white">
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="relative overflow-hidden rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[6vmin] py-[2vmin] font-[family-name:var(--font-display)] text-[4vmin] uppercase leading-none tracking-wide text-white shadow-[0_0_6vmin_-1vmin_rgb(227_30_36_/_0.95)] transition active:scale-[0.97]"
        >
          <span className="relative z-10">Get my code</span>
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md animate-sweep" />
        </button>
      </div>
    </div>
  );
}

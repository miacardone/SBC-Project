"use client";

import { useEffect, useState } from "react";
import { Backdrop, Confetti, Logo } from "./Chrome";
import { ReelSymbol } from "@/components/Symbols";
import { QUIZ_LENGTH } from "@/lib/quiz";
import type { OutcomeResponse } from "@/lib/client";
import type { GameMode } from "@/lib/types";

type Props = {
  outcome: OutcomeResponse;
  mode: GameMode;
  score: number | null;
  onContinue: () => void;
};

export function PrizeReveal({ outcome, mode, score, onContinue }: Props) {
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

      <div className="relative z-10 flex w-full max-w-[130vmin] flex-col items-center gap-[3vmin]">
        <Logo className="text-[6vmin]" />

        {mode === "classroom" && score !== null && (
          <div className="animate-pop rounded-full border-2 border-edge bg-panel px-[3.4vmin] py-[1.2vmin] font-[family-name:var(--font-display)] text-[3vmin] uppercase leading-none tracking-wide text-white">
            You scored{" "}
            <span className={score >= QUIZ_LENGTH ? "text-gold" : "text-cb-red"}>
              {score}/{QUIZ_LENGTH}
            </span>
          </div>
        )}

        <div
          className={`transition-all duration-500 ${shown ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
        >
          <div
            className={`font-[family-name:var(--font-display)] text-[13vmin] uppercase leading-[0.9] ${
              grand ? "text-gold [text-shadow:0_0_6vmin_rgb(255_201_60_/_0.7)]" : won ? "text-cb-red [text-shadow:0_0_6vmin_rgb(227_30_36_/_0.7)]" : "text-white"
            }`}
          >
            {outcome.prize.label}
          </div>
          <p className="mt-[1vmin] text-[2.4vmin] font-medium text-white/55">
            {outcome.prize.blurb}
          </p>
        </div>

        <div
          className={`animate-rise [animation-delay:220ms] flex w-full max-w-[100vmin] items-center gap-[3vmin] rounded-[2.4vmin] border-2 p-[3vmin] text-left ${
            grand ? "border-gold/70 bg-gold/10" : won ? "border-cb-red/70 bg-cb-red/10" : "border-edge bg-panel"
          }`}
        >
          <div className="h-[14vmin] w-[14vmin] shrink-0">
            <ReelSymbol id={won ? "bull" : "coins"} />
          </div>
          <div className="min-w-0">
            <div className="text-[1.7vmin] font-semibold uppercase tracking-[0.32em] text-white/45">
              You&apos;re taking home
            </div>
            <div className="mt-[0.8vmin] font-[family-name:var(--font-display)] text-[6vmin] uppercase leading-none text-white">
              {outcome.prize.item}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="relative overflow-hidden rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[6vmin] py-[2.2vmin] font-[family-name:var(--font-display)] text-[4.4vmin] uppercase leading-none tracking-wide text-white shadow-[0_0_6vmin_-1vmin_rgb(227_30_36_/_0.95)] transition active:scale-[0.97]"
        >
          <span className="relative z-10">Claim it</span>
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md animate-sweep" />
        </button>

        <p className="text-[1.8vmin] font-semibold uppercase tracking-[0.3em] text-white/30">
          Next: we email you the code
        </p>
      </div>
    </div>
  );
}

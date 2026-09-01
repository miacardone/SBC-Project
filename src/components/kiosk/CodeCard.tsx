"use client";

import { useEffect, useState } from "react";
import { Backdrop, Bulbs, Logo } from "./Chrome";
import type { ClaimResponse } from "@/lib/client";

type Props = {
  claim: ClaimResponse;
  onDone: () => void;
  /** seconds before the kiosk resets itself for the next person */
  resetIn?: number;
};

export function CodeCard({ claim, onDone, resetIn = 30 }: Props) {
  const [left, setLeft] = useState(resetIn);

  useEffect(() => {
    const id = setInterval(() => setLeft((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left <= 0) onDone();
  }, [left, onDone]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-[3vmin] text-center">
      <Backdrop intensity={0.7} />

      <div className="relative z-10 flex w-full max-w-[120vmin] flex-col items-center gap-[2.4vmin]">
        <Logo className="text-[5vmin]" />

        <h1 className="font-[family-name:var(--font-display)] text-[5.5vmin] uppercase leading-none text-white">
          Show this at the <span className="text-cb-red">booth</span>
        </h1>

        <div className="relative w-full rounded-[2.4vmin] border-[0.5vmin] border-dashed border-cb-red bg-black/70 px-[4vmin] py-[3vmin]">
          <Bulbs count={20} className="absolute inset-x-[2vmin] top-[1.2vmin]" />
          <Bulbs count={20} className="absolute inset-x-[2vmin] bottom-[1.2vmin]" />
          <div className="text-[1.7vmin] font-semibold uppercase tracking-[0.4em] text-white/40">
            Prize code
          </div>
          <div className="mt-[1.2vmin] font-[family-name:var(--font-display)] text-[10vmin] leading-none tracking-[0.08em] text-white [text-shadow:0_0_5vmin_rgb(227_30_36_/_0.6)]">
            {claim.code}
          </div>
        </div>

        <div className="w-full rounded-[2vmin] border-2 border-edge bg-panel p-[2.2vmin]">
          <div className="text-[1.6vmin] font-semibold uppercase tracking-[0.34em] text-white/40">
            You&apos;re eligible for — choose one
          </div>
          <div className="mt-[1.4vmin] flex flex-wrap items-center justify-center gap-[1.4vmin]">
            {claim.options.map((option) => (
              <span
                key={option}
                className="rounded-full border border-cb-red/50 bg-cb-red/10 px-[2.4vmin] py-[1vmin] font-[family-name:var(--font-display)] text-[2.6vmin] uppercase leading-none text-white"
              >
                {option}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[2vmin] font-medium text-white/60">
          {claim.skipped
            ? "Write it down or snap a photo — we didn't email this one."
            : claim.emailSent
              ? "A copy is on its way to your inbox."
              : "Snap a photo of this screen — the email may take a minute."}
        </p>

        <button
          type="button"
          onClick={onDone}
          className="rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[6vmin] py-[1.8vmin] font-[family-name:var(--font-display)] text-[3.4vmin] uppercase leading-none tracking-wide text-white shadow-[0_0_5vmin_-1vmin_rgb(227_30_36_/_0.9)] transition active:scale-[0.97]"
        >
          Done — next player
        </button>

        <p className="text-[1.6vmin] font-semibold uppercase tracking-[0.3em] text-white/25">
          Resetting in {Math.max(0, left)}s
        </p>
      </div>
    </div>
  );
}

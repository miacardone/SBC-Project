"use client";

import { Backdrop, Bulbs, Logo } from "./Chrome";
import { ReelSymbol } from "@/components/Symbols";

const TICKER = [
  "everyone wins something",
  "plush bulls",
  "$25 gift cards",
  "fidget spinners",
  "beat the house",
  "learn something",
];

const FLOATERS = ["bull", "card", "shield", "coins", "globe", "lock", "chart", "bull"];

export function AttractScreen({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-center"
    >
      <Backdrop />

      {/* drifting symbols behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]">
        {FLOATERS.map((symbol, i) => (
          <div
            key={i}
            className="absolute h-[16vmin] w-[16vmin] animate-glow"
            style={{
              left: `${6 + i * 12}%`,
              top: `${(i % 3) * 30 + 8}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${5 + i}s`,
            }}
          >
            <ReelSymbol id={symbol} />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-[4vmin] px-[6vmin]">
        <Logo className="text-[16vmin]" />

        <div className="relative w-full max-w-[110vmin] rounded-[2vmin] border-2 border-cb-red/70 bg-cb-red/5 px-[6vmin] py-[3vmin]">
          <Bulbs count={26} className="absolute inset-x-[2vmin] top-[1.2vmin]" />
          <Bulbs count={26} className="absolute inset-x-[2vmin] bottom-[1.2vmin]" />
          <div className="font-[family-name:var(--font-display)] text-[7vmin] uppercase leading-none text-white animate-glow">
            Tap to play
          </div>
        </div>

        <p className="max-w-[100vmin] text-[2.6vmin] font-medium leading-snug text-white/60">
          Spin the slots or take the Chargeback Challenge.
          <br />
          <span className="text-white">Every single player walks away with a prize.</span>
        </p>
      </div>

      {/* ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-edge bg-black/70 py-[1.6vmin]">
        <div className="flex w-max animate-drift whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex">
              {TICKER.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="mx-[3vmin] font-[family-name:var(--font-display)] text-[2.4vmin] uppercase tracking-[0.2em] text-white/45"
                >
                  {item}
                  <span className="ml-[3vmin] text-cb-red">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

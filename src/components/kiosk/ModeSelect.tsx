"use client";

import { Backdrop, Logo } from "./Chrome";
import { LanguagePicker } from "./LanguagePicker";
import { ReelSymbol } from "@/components/Symbols";
import { useI18n } from "@/lib/i18n";
import type { GameMode } from "@/lib/types";

type Props = {
  onPick: (mode: GameMode) => void;
  onQuit: () => void;
};

/** Visual identity per game; all copy comes from the dictionary. */
const CARDS: { mode: GameMode; symbols: string[]; accent: string }[] = [
  { mode: "casino", symbols: ["bull", "coins"], accent: "border-cb-red/60 from-cb-red-hot/25" },
  { mode: "classroom", symbols: ["shield", "chart"], accent: "border-white/40 from-white/15" },
  { mode: "catch", symbols: ["lock", "globe"], accent: "border-gold/50 from-gold/15" },
];

export function ModeSelect({ onPick, onQuit }: Props) {
  const { t } = useI18n();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-[3vmin]">
      <Backdrop intensity={0.6} />

      <button
        type="button"
        onClick={onQuit}
        className="absolute left-[3vmin] top-[3vmin] z-20 rounded-full border border-edge bg-panel px-[2.6vmin] py-[1.2vmin] text-[1.7vmin] font-semibold uppercase tracking-[0.2em] text-white/60 transition active:scale-95"
      >
        {t.modes.back}
      </button>

      <div className="absolute right-[3vmin] top-[3vmin] z-20">
        <LanguagePicker />
      </div>

      <div className="relative z-10 flex w-full max-w-[180vmin] flex-col items-center gap-[3vmin]">
        <div className="flex flex-col items-center gap-[1.4vmin]">
          <Logo className="text-[6vmin]" />
          <h1 className="font-[family-name:var(--font-display)] text-[5.5vmin] uppercase leading-none text-white">
            {t.modes.title} <span className="text-cb-red">{t.modes.titleAccent}</span>
          </h1>
        </div>

        <div className="grid w-full grid-cols-1 gap-[2.4vmin] landscape:grid-cols-3">
          {CARDS.map((card, i) => {
            const copy = t.modes[card.mode];
            return (
            <button
              key={card.mode}
              type="button"
              onClick={() => onPick(card.mode)}
              style={{ animationDelay: `${i * 0.08}s` }}
              className={`animate-rise relative flex flex-col items-start overflow-hidden rounded-[2.4vmin] border-2 bg-panel bg-gradient-to-b to-transparent p-[2.8vmin] text-left transition active:scale-[0.98] ${card.accent}`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-[2vmin] -top-[2vmin] flex gap-[1vmin] opacity-15"
              >
                {card.symbols.map((s) => (
                  <div key={s} className="h-[11vmin] w-[11vmin]">
                    <ReelSymbol id={s} />
                  </div>
                ))}
              </div>

              <span className="rounded-full border border-white/20 bg-black/40 px-[1.6vmin] py-[0.6vmin] text-[1.4vmin] font-semibold uppercase tracking-[0.28em] text-white/60">
                {copy.kicker}
              </span>

              <h2 className="relative mt-[1.6vmin] font-[family-name:var(--font-display)] text-[7vmin] uppercase leading-none text-white">
                {copy.title}
              </h2>

              <p className="relative mt-[0.8vmin] text-[2vmin] font-medium text-white/70">
                {copy.blurb}
              </p>

              <ul className="relative mt-[2vmin] mb-[2.4vmin] flex flex-col gap-[0.9vmin]">
                {copy.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-[1.2vmin] text-[1.75vmin] text-white/55">
                    <span className="h-[0.8vmin] w-[0.8vmin] shrink-0 rounded-full bg-cb-red" />
                    {b}
                  </li>
                ))}
              </ul>

              <span className="relative mt-auto inline-flex items-center rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[2.8vmin] py-[1.4vmin] font-[family-name:var(--font-display)] text-[2.6vmin] uppercase leading-none tracking-wide text-white shadow-[0_0_4vmin_-1vmin_rgb(227_30_36_/_0.9)]">
                {t.modes.play} {copy.title}
              </span>
            </button>
            );
          })}
        </div>

        <p className="text-[1.9vmin] font-semibold uppercase tracking-[0.3em] text-white/30">
          {t.modes.footer}
        </p>
      </div>
    </div>
  );
}

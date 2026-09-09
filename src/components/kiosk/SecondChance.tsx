"use client";

import { Backdrop, CornerControls, Logo, PillButton } from "./Chrome";
import { ReelSymbol } from "@/components/Symbols";
import { useI18n } from "@/lib/i18n";

type Props = {
  onTake: () => void;
  onDecline: () => void;
  onHome: () => void;
};

/** Offered the moment the wheel fails to pay, which is almost always. */
export function SecondChance({ onTake, onDecline, onHome }: Props) {
  const { t } = useI18n();

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-[4vmin] text-center">
      <Backdrop intensity={0.7} />
      <CornerControls>
        <PillButton onClick={onHome}>{t.common.home}</PillButton>
      </CornerControls>

      <div className="relative z-10 flex w-full max-w-[120vmin] flex-col items-center gap-[3vmin]">
        <Logo className="text-[5vmin]" />

        <div className="animate-pop">
          <div className="font-[family-name:var(--font-display)] text-[10vmin] uppercase leading-[0.9] text-white">
            {t.flow.secondChanceTitle}
          </div>
          <div className="font-[family-name:var(--font-display)] text-[7vmin] uppercase leading-[0.9] text-cb-red [text-shadow:0_0_6vmin_rgb(227_30_36_/_0.7)]">
            {t.flow.secondChanceAccent}
          </div>
        </div>

        <div className="h-[14vmin] w-[14vmin] opacity-80">
          <ReelSymbol id="shield" />
        </div>

        <p className="max-w-[95vmin] text-[2.4vmin] font-medium leading-snug text-white/65">
          {t.flow.secondChanceBody}
        </p>

        <button
          type="button"
          onClick={onTake}
          className="relative overflow-hidden rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[6vmin] py-[2.2vmin] font-[family-name:var(--font-display)] text-[4.2vmin] uppercase leading-none tracking-wide text-white shadow-[0_0_6vmin_-1vmin_rgb(227_30_36_/_0.95)] transition active:scale-[0.97]"
        >
          <span className="relative z-10">{t.flow.takeSecondChance}</span>
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md animate-sweep" />
        </button>

        <button
          type="button"
          onClick={onDecline}
          className="text-[1.9vmin] font-semibold uppercase tracking-[0.24em] text-white/35 underline underline-offset-4 transition active:scale-95"
        >
          {t.flow.declineSecondChance}
        </button>
      </div>
    </div>
  );
}

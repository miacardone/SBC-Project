"use client";

import { Fragment, useState } from "react";
import { Backdrop, CornerControls, Logo, PillButton } from "./Chrome";
import { useI18n } from "@/lib/i18n";

type Props = {
  busy: boolean;
  error: string | null;
  onSubmit: (token: string) => void;
  onHome: () => void;
};

/** The token alphabet, laid out for thumbs rather than for typists. */
const KEYS = "ACDEFGHJKLMNPQRTUVWXY2346789".split("");
const LENGTH = 6;

export function TokenScreen({ busy, error, onSubmit, onHome }: Props) {
  const { t } = useI18n();
  const [chars, setChars] = useState<string[]>([]);

  const push = (c: string) => setChars((v) => (v.length < LENGTH ? [...v, c] : v));
  const pop = () => setChars((v) => v.slice(0, -1));
  const ready = chars.length === LENGTH;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-[3vmin]">
      <Backdrop intensity={0.45} />
      <CornerControls>
        <PillButton onClick={onHome}>{t.flow.startOver}</PillButton>
      </CornerControls>

      <div className="relative z-10 flex w-full max-w-[130vmin] flex-col items-center gap-[2.4vmin]">
        <Logo className="text-[5vmin]" />

        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[6vmin] uppercase leading-none text-white">
            {t.flow.tokenTitle} <span className="text-cb-red">{t.flow.tokenAccent}</span>
          </h1>
          <p className="mt-[1vmin] text-[2.1vmin] font-medium text-white/55">
            {t.flow.tokenSubtitle}
          </p>
        </div>

        {/* the six slots */}
        <div className="flex items-center gap-[1.4vmin]">
          {Array.from({ length: LENGTH }).map((_, i) => (
            <Fragment key={i}>
              {i === 3 && <span className="text-[5vmin] text-white/25">–</span>}
              <div
                className={`flex h-[12vmin] w-[9vmin] items-center justify-center rounded-[1.4vmin] border-2 font-[family-name:var(--font-display)] text-[6vmin] leading-none transition-colors ${
                  chars[i]
                    ? "border-cb-red bg-cb-red/10 text-white"
                    : "border-edge bg-black/50 text-white/20"
                }`}
              >
                {chars[i] ?? "•"}
              </div>
            </Fragment>
          ))}
        </div>

        {error && (
          <p className="text-[2vmin] font-semibold text-cb-red-hot">{error}</p>
        )}

        {/* keypad */}
        <div className="grid w-full grid-cols-7 gap-[1vmin] landscape:grid-cols-14">
          {KEYS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => push(c)}
              className="flex min-h-[8vmin] items-center justify-center rounded-xl border border-edge bg-panel font-[family-name:var(--font-display)] text-[3.4vmin] leading-none text-white/90 transition active:scale-95 active:bg-white/15"
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex w-full gap-[1.4vmin]">
          <button
            type="button"
            onClick={pop}
            className="min-h-[9vmin] flex-1 rounded-2xl border border-edge bg-panel font-[family-name:var(--font-display)] text-[3vmin] uppercase tracking-wide text-white/70 transition active:scale-95"
          >
            ⌫
          </button>
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => onSubmit(chars.join(""))}
            className="min-h-[9vmin] flex-[3] rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep font-[family-name:var(--font-display)] text-[3.4vmin] uppercase tracking-wide text-white shadow-[0_0_5vmin_-1vmin_rgb(227_30_36_/_0.9)] transition active:scale-95 disabled:opacity-30 disabled:shadow-none"
          >
            {busy ? t.flow.checking : t.flow.unlock}
          </button>
        </div>
      </div>
    </div>
  );
}

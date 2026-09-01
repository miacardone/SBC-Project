"use client";

import { useState } from "react";
import { Backdrop, Logo } from "./Chrome";
import { Keyboard } from "./Keyboard";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Props = {
  prizeItem: string;
  busy: boolean;
  error: string | null;
  onSubmit: (email: string, consent: boolean) => void;
  onSkip: () => void;
};

export function EmailCapture({ prizeItem, busy, error, onSubmit, onSkip }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const valid = EMAIL_RE.test(email);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-[3vmin]">
      <Backdrop intensity={0.4} />

      <div className="relative z-10 flex w-full max-w-[130vmin] flex-col items-center gap-[2.4vmin]">
        <Logo className="text-[5vmin]" />

        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[6vmin] uppercase leading-none text-white">
            Where do we send <span className="text-cb-red">your code?</span>
          </h1>
          <p className="mt-[1vmin] text-[2.1vmin] font-medium text-white/55">
            Your {prizeItem.toLowerCase()} is waiting at the booth — the code is your claim ticket.
          </p>
        </div>

        {/* the field */}
        <div
          className={`flex min-h-[10vmin] w-full items-center justify-center rounded-[1.8vmin] border-2 px-[3vmin] transition-colors ${
            error ? "border-cb-red bg-cb-red/10" : valid ? "border-emerald-400/70 bg-emerald-400/5" : "border-edge bg-black/50"
          }`}
        >
          <span className="truncate font-[family-name:var(--font-display)] text-[4.6vmin] leading-none tracking-wide text-white">
            {email || <span className="text-white/25">you@company.com</span>}
          </span>
          <span className="ml-[0.4vmin] inline-block h-[4.6vmin] w-[0.4vmin] animate-glow bg-cb-red" />
        </div>

        {error && (
          <p className="text-[2vmin] font-semibold text-cb-red-hot">{error}</p>
        )}

        <Keyboard
          onKey={(char) => setEmail((v) => (v.length < 64 ? v + char : v))}
          onBackspace={() => setEmail((v) => v.slice(0, -1))}
          onClear={() => setEmail("")}
          onSubmit={() => valid && !busy && onSubmit(email, consent)}
          canSubmit={valid && !busy}
          submitLabel={busy ? "Sending…" : "Get my code"}
        />

        {/* consent + escape hatch */}
        <div className="flex w-full flex-wrap items-center justify-between gap-[2vmin]">
          <button
            type="button"
            onClick={() => setConsent((c) => !c)}
            className="flex max-w-[80%] items-center gap-[1.6vmin] text-left"
          >
            <span
              className={`flex h-[4vmin] w-[4vmin] shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                consent ? "border-cb-red bg-cb-red text-white" : "border-edge bg-black/50 text-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-[2.4vmin] w-[2.4vmin]" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-[1.8vmin] leading-snug text-white/55">
              Send me chargeback tips and product news from Chargebacks911. Optional — you get
              your code either way.
            </span>
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={busy}
            className="shrink-0 text-[1.8vmin] font-semibold uppercase tracking-[0.24em] text-white/35 underline underline-offset-4 transition active:scale-95 disabled:opacity-40"
          >
            No email — just show it
          </button>
        </div>
      </div>
    </div>
  );
}

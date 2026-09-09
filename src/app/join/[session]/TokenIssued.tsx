"use client";

import type { Dictionary } from "@/lib/i18n/locales/en";
import type { TokenResult } from "@/lib/client";

/** The one screen both lanes end on. */
export function TokenIssued({
  issued,
  t,
  booth,
}: {
  issued: TokenResult;
  t: Dictionary;
  booth: string;
}) {
  // Emailed: the inbox is the proof, so the code is deliberately not here.
  if (issued.delivered) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div className="rounded-2xl border-2 border-cb-red/60 bg-cb-red/10 px-5 py-7">
          <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/40">
            {t.flow.tokenIssued}
          </div>
          <div className="mt-3 text-xl font-semibold leading-snug text-white">
            {t.flow.checkInbox.replace("{hint}", issued.hint)}
          </div>
        </div>
        <p className="text-base leading-relaxed text-white/65">{t.flow.checkInboxHint}</p>
        <p className="text-sm leading-relaxed text-white/40">
          {t.flow.boothLine.replace("{booth}", booth)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border-2 border-dashed border-cb-red bg-black/60 px-5 py-7 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/40">
          {t.flow.tokenIssued}
        </div>
        <div className="mt-2 select-text font-[family-name:var(--font-display)] text-5xl tracking-[0.12em] text-white">
          {issued.code}
        </div>
      </div>
      <p className="text-center text-base leading-relaxed text-white/70">
        {t.flow.scanSteps[2]}
      </p>
      <p className="text-center text-sm leading-relaxed text-white/45">
        {t.flow.boothLine.replace("{booth}", booth)}
      </p>
    </div>
  );
}

export function ConsentBox({
  consent,
  setConsent,
  t,
}: {
  consent: boolean;
  setConsent: (next: boolean) => void;
  t: Dictionary;
}) {
  return (
    <button
      type="button"
      onClick={() => setConsent(!consent)}
      className="flex items-start gap-3 text-left"
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          consent ? "border-cb-red bg-cb-red text-white" : "border-edge bg-black/60 text-transparent"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="text-sm leading-snug text-white/55">{t.email.consent}</span>
    </button>
  );
}

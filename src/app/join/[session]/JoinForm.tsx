"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/locales/en";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Props = { session: string; locale: string; t: Dictionary; booth: string };

export function JoinForm({ session, locale, t, booth }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const submit = async () => {
    if (!EMAIL_RE.test(email) || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, session, locale }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) {
        setError(data.error === "invalid-email" ? t.email.invalid : t.phone.problem);
        return;
      }
      setCode(data.code);
    } catch {
      setError(t.phone.offline);
    } finally {
      setBusy(false);
    }
  };

  if (code) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border-2 border-dashed border-cb-red bg-black/60 px-5 py-7 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/40">
            {t.flow.tokenIssued}
          </div>
          <div className="mt-2 select-text font-[family-name:var(--font-display)] text-5xl tracking-[0.12em] text-white">
            {code}
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

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
          {t.phone.emailLabel}
        </span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.email.placeholder}
          className="w-full rounded-xl border-2 border-edge bg-black/60 px-4 py-4 text-lg text-white outline-none focus:border-cb-red"
        />
      </label>

      <button type="button" onClick={() => setConsent((c) => !c)} className="flex items-start gap-3 text-left">
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

      {error && <p className="text-sm font-semibold text-cb-red-hot">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={!EMAIL_RE.test(email) || busy}
        className="rounded-xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep py-4 font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-white transition active:scale-[0.98] disabled:opacity-35"
      >
        {busy ? t.flow.sending : t.flow.getToken}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ConsentBox } from "./TokenIssued";
import { requestToken, TokenFailed, tokenMessage, type TokenResult } from "@/lib/client";
import type { Dictionary } from "@/lib/i18n/locales/en";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** The typed lane. No Clerk anywhere in here, so it works with sign-in off. */
export function EmailForm({
  session,
  locale,
  t,
  onIssued,
  onBack,
}: {
  session: string;
  locale: string;
  t: Dictionary;
  onIssued: (result: TokenResult) => void;
  onBack?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!EMAIL_RE.test(email) || busy) return;
    setBusy(true);
    setError(null);
    try {
      onIssued(await requestToken({ email, consent, session, locale }));
    } catch (err) {
      setError(tokenMessage(err instanceof TokenFailed ? err.reason : "storage", t));
    } finally {
      setBusy(false);
    }
  };

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

      <ConsentBox consent={consent} setConsent={setConsent} t={t} />

      {error && <p className="text-sm font-semibold text-cb-red-hot">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={!EMAIL_RE.test(email) || busy}
        className="rounded-xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep py-4 font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-white transition active:scale-[0.98] disabled:opacity-35"
      >
        {busy ? t.flow.sending : t.flow.getToken}
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white/35 underline underline-offset-4"
        >
          {t.flow.backToQr}
        </button>
      )}
    </div>
  );
}

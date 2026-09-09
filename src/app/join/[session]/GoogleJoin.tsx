"use client";

import { useState } from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import { ConsentBox } from "./TokenIssued";
import { requestToken, TokenFailed, tokenMessage, type TokenResult } from "@/lib/client";
import { isFreeEmailDomain } from "@/lib/free-domains";
import type { Dictionary } from "@/lib/i18n/locales/en";

/**
 * Only ever rendered inside the Clerk provider, so the hooks here are safe.
 * When no key is configured the parent never mounts this at all.
 */
export function GoogleJoin({
  session,
  locale,
  t,
  onIssued,
  onType,
}: {
  session: string;
  locale: string;
  t: Dictionary;
  onIssued: (result: TokenResult) => void;
  onType: () => void;
}) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [showCard, setShowCard] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  // Signing in with a personal Gmail is the obvious failure mode here, so say
  // so on the confirm screen rather than after they commit.
  const personal = googleEmail
    ? isFreeEmailDomain(googleEmail.slice(googleEmail.lastIndexOf("@") + 1))
    : false;

  const claim = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // No email in the body: the server reads the session and trusts only that.
      onIssued(await requestToken({ consent, session, locale }));
    } catch (err) {
      setError(tokenMessage(err instanceof TokenFailed ? err.reason : "storage", t));
    } finally {
      setBusy(false);
    }
  };

  if (isLoaded && isSignedIn && googleEmail) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border-2 border-emerald-400/50 bg-emerald-400/10 px-4 py-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Google
          </div>
          <div className="mt-1 select-text break-all text-lg font-semibold text-white">
            {googleEmail}
          </div>
        </div>

        {personal ? (
          <p className="rounded-xl border-2 border-cb-red/60 bg-cb-red/10 px-4 py-3 text-sm font-semibold leading-snug text-cb-red-hot">
            {t.flow.workEmailOnly}
          </p>
        ) : (
          <ConsentBox consent={consent} setConsent={setConsent} t={t} />
        )}
        {error && <p className="text-sm font-semibold text-cb-red-hot">{error}</p>}

        <button
          type="button"
          onClick={claim}
          disabled={busy || personal}
          className="rounded-xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep py-4 font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-white transition active:scale-[0.98] disabled:opacity-35"
        >
          {busy ? t.flow.sending : t.flow.getToken}
        </button>

        <button
          type="button"
          onClick={onType}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white/35 underline underline-offset-4"
        >
          {t.flow.useAnotherEmail}
        </button>
      </div>
    );
  }

  if (showCard) {
    return (
      <div className="flex flex-col items-center gap-4">
        <SignIn
          routing="hash"
          forceRedirectUrl={`/join/${session}?lang=${locale}`}
          signUpForceRedirectUrl={`/join/${session}?lang=${locale}`}
        />
        <button
          type="button"
          onClick={() => setShowCard(false)}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white/35 underline underline-offset-4"
        >
          {t.flow.backToQr}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setShowCard(true)}
        disabled={!isLoaded}
        className="flex items-center justify-center gap-3 rounded-xl border-2 border-white/20 bg-white px-4 py-4 text-lg font-semibold text-neutral-900 transition active:scale-[0.98] disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
        </svg>
        {t.flow.continueWithGoogle}
      </button>
      <p className="text-center text-xs uppercase tracking-[0.25em] text-white/30">
        {t.flow.googleFastest}
      </p>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-edge" />
        <span className="text-xs uppercase tracking-[0.3em] text-white/25">
          {t.flow.orDivider}
        </span>
        <span className="h-px flex-1 bg-edge" />
      </div>

      <button
        type="button"
        onClick={onType}
        className="rounded-xl border-2 border-edge bg-black/40 py-4 text-base font-semibold text-white/75 transition active:scale-[0.98]"
      >
        {t.flow.orType}
      </button>
    </div>
  );
}

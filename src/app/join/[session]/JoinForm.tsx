"use client";

import { useState } from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import type { Dictionary } from "@/lib/i18n/locales/en";

import { requestToken, TokenFailed, tokenMessage, type TokenResult } from "@/lib/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type Props = { session: string; locale: string; t: Dictionary; booth: string };

export function JoinForm({ session, locale, t, booth }: Props) {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const [mode, setMode] = useState<"choose" | "google" | "typing">("choose");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<TokenResult | null>(null);

  const googleEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  /** Signed in with Google: the address is already proven, so no typing. */
  const claimWithGoogle = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setIssued(await requestToken({ consent, session, locale }));
    } catch (err) {
      setError(tokenMessage(err instanceof TokenFailed ? err.reason : "storage", t));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!EMAIL_RE.test(email) || busy) return;
    setBusy(true);
    setError(null);
    try {
      setIssued(await requestToken({ email, consent, session, locale }));
    } catch (err) {
      setError(
        tokenMessage(err instanceof TokenFailed ? err.reason : "storage", t)
      );
    } finally {
      setBusy(false);
    }
  };

  if (issued) {
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

  const consentCheckbox = (
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
  );

  // Signed in with Google — one tap and the token is theirs.
  if (userLoaded && isSignedIn && googleEmail && mode !== "typing") {
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

        {consentCheckbox}
        {error && <p className="text-sm font-semibold text-cb-red-hot">{error}</p>}

        <button
          type="button"
          onClick={claimWithGoogle}
          disabled={busy}
          className="rounded-xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep py-4 font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-white transition active:scale-[0.98] disabled:opacity-35"
        >
          {busy ? t.flow.sending : t.flow.getToken}
        </button>

        <button
          type="button"
          onClick={() => setMode("typing")}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white/35 underline underline-offset-4"
        >
          {t.flow.useAnotherEmail}
        </button>
      </div>
    );
  }

  // Clerk's own card handles the Google handshake and the redirect back.
  if (mode === "google") {
    return (
      <div className="flex flex-col items-center gap-4">
        <SignIn
          routing="hash"
          forceRedirectUrl={`/join/${session}?lang=${locale}`}
          signUpForceRedirectUrl={`/join/${session}?lang=${locale}`}
        />
        <button
          type="button"
          onClick={() => setMode("choose")}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white/35 underline underline-offset-4"
        >
          {t.flow.backToQr}
        </button>
      </div>
    );
  }

  // Not signed in: offer Google first, typing second.
  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setMode("google")}
          disabled={!userLoaded}
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
          onClick={() => setMode("typing")}
          className="rounded-xl border-2 border-edge bg-black/40 py-4 text-base font-semibold text-white/75 transition active:scale-[0.98]"
        >
          {t.flow.orType}
        </button>
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

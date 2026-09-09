"use client";

import { useState } from "react";
import { EmailForm } from "./EmailForm";
import { GoogleJoin } from "./GoogleJoin";
import { TokenIssued } from "./TokenIssued";
import type { TokenResult } from "@/lib/client";
import type { Dictionary } from "@/lib/i18n/locales/en";

type Props = {
  session: string;
  locale: string;
  t: Dictionary;
  booth: string;
  /** false when no Clerk key is set — the booth runs email-only, no dead button */
  googleAvailable: boolean;
};

export function JoinForm({ session, locale, t, booth, googleAvailable }: Props) {
  const [issued, setIssued] = useState<TokenResult | null>(null);
  const [typing, setTyping] = useState(!googleAvailable);

  if (issued) return <TokenIssued issued={issued} t={t} booth={booth} />;

  if (googleAvailable && !typing) {
    return (
      <GoogleJoin
        session={session}
        locale={locale}
        t={t}
        onIssued={setIssued}
        onType={() => setTyping(true)}
      />
    );
  }

  return (
    <EmailForm
      session={session}
      locale={locale}
      t={t}
      onIssued={setIssued}
      onBack={googleAvailable ? () => setTyping(false) : undefined}
    />
  );
}

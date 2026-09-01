"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Backdrop, CornerControls, Logo, PillButton } from "./Chrome";
import { EmailCapture } from "./EmailCapture";
import type { ClaimResponse, OutcomeResponse } from "@/lib/client";

type Props = {
  outcome: OutcomeResponse;
  prizeLine: string;
  busy: boolean;
  error: string | null;
  onSubmit: (email: string, consent: boolean) => void;
  onSkip: () => void;
  /** fired when the player finished on their own phone */
  onClaimed: (claim: ClaimResponse) => void;
  onHome: () => void;
};

/**
 * Two ways to claim: scan the QR and finish on your own phone (where autofill
 * works and the score is waiting), or tap it out on the booth keyboard. The
 * screen polls while the QR is up so it moves on by itself once the phone is
 * done.
 */
export function ClaimScreen({
  outcome,
  prizeLine,
  busy,
  error,
  onSubmit,
  onSkip,
  onClaimed,
  onHome,
}: Props) {
  const [mode, setMode] = useState<"qr" | "keyboard">("qr");
  const [svg, setSvg] = useState<string | null>(null);

  // NEXT_PUBLIC_KIOSK_URL is what phones actually resolve. Falling back to the
  // page's own origin only works when the kiosk is served on something a phone
  // can reach — never plain localhost. This screen only ever mounts after a
  // game, so `window` is always there by the time it runs.
  const [origin] = useState(() =>
    process.env.NEXT_PUBLIC_KIOSK_URL ||
    (typeof window === "undefined" ? "" : window.location.origin)
  );

  const url = useMemo(
    () => (origin ? `${origin.replace(/\/$/, "")}/claim/${outcome.id}` : null),
    [origin, outcome.id]
  );

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a0c", light: "#ffffff" },
    })
      .then((out) => {
        if (!cancelled) setSvg(out);
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Watch for the phone finishing the claim. Every read here costs a command
  // against the storage plan, so it is deliberately unhurried and gives up
  // before the idle reset would fire anyway.
  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    const id = setInterval(async () => {
      if (Date.now() - started > 240_000) {
        clearInterval(id);
        return;
      }
      try {
        const res = await fetch(`/api/claim/status?id=${encodeURIComponent(outcome.id)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as ClaimResponse & { claimed: boolean };
        if (!cancelled && data.claimed) {
          clearInterval(id);
          onClaimed({
            code: data.code,
            options: data.options,
            emailSent: data.emailSent,
          });
        }
      } catch {
        // venue wifi hiccup — the next tick can try again
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [outcome.id, onClaimed]);

  if (mode === "keyboard") {
    return (
      <div className="relative h-full w-full">
        <CornerControls>
          <PillButton onClick={onHome}>Home</PillButton>
          <PillButton onClick={() => setMode("qr")}>Back to QR</PillButton>
        </CornerControls>
        <EmailCapture
          prizeLine={prizeLine}
          busy={busy}
          error={error}
          onSubmit={onSubmit}
          onSkip={onSkip}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-[4vmin]">
      <Backdrop intensity={0.5} />
      <CornerControls>
        <PillButton onClick={onHome}>Home</PillButton>
      </CornerControls>

      <div className="relative z-10 flex w-full max-w-[150vmin] flex-col items-center gap-[3vmin]">
        <Logo className="text-[5.5vmin]" />

        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[6vmin] uppercase leading-none text-white">
            Scan to grab <span className="text-cb-red">your prize</span>
          </h1>
          <p className="mt-[1vmin] text-[2.1vmin] font-medium text-white/55">
            Your score and your code are waiting on your phone — no typing on this thing.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-[3vmin] landscape:flex-row landscape:items-stretch landscape:justify-center">
          {/* the code itself */}
          <div className="flex flex-col items-center gap-[1.6vmin]">
            <div className="rounded-[2.4vmin] bg-white p-[2vmin] shadow-[0_0_8vmin_-2vmin_rgb(255_255_255_/_0.5)]">
              {svg ? (
                <div
                  className="h-[38vmin] w-[38vmin] [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <div className="flex h-[38vmin] w-[38vmin] items-center justify-center text-center text-[1.8vmin] font-semibold text-black/40">
                  Generating…
                </div>
              )}
            </div>
            {url && (
              <p className="max-w-[42vmin] break-all text-center text-[1.4vmin] font-medium text-white/25">
                {url}
              </p>
            )}
          </div>

          {/* what happens next */}
          <div className="flex max-w-[60vmin] flex-col justify-center gap-[2.4vmin]">
            <ol className="flex flex-col gap-[1.8vmin]">
              {[
                "Point your camera at the code",
                "Your score and prize are already on the page",
                "Drop in your email and the code is yours",
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-[2vmin]">
                  <span className="flex h-[5vmin] w-[5vmin] shrink-0 items-center justify-center rounded-full border-2 border-cb-red/60 bg-cb-red/10 font-[family-name:var(--font-display)] text-[2.4vmin] leading-none text-white">
                    {i + 1}
                  </span>
                  <span className="text-[2.1vmin] font-medium leading-snug text-white/70">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="h-px w-full bg-edge" />

            <button
              type="button"
              onClick={() => setMode("keyboard")}
              className="rounded-2xl border-2 border-edge bg-gradient-to-b from-panel to-pit px-[3vmin] py-[1.8vmin] font-[family-name:var(--font-display)] text-[2.8vmin] uppercase leading-none tracking-wide text-white/80 transition active:scale-[0.98]"
            >
              No phone? Type it here instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

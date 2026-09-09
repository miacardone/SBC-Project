"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Backdrop, CornerControls, Logo, PillButton } from "./Chrome";
import { EmailCapture } from "./EmailCapture";
import { LanguagePicker } from "./LanguagePicker";
import { useI18n } from "@/lib/i18n";

type Props = {
  /** the kiosk's handoff id, encoded in the QR */
  session: string;
  busy: boolean;
  error: string | null;
  onSubmit: (email: string, consent: boolean) => void;
  /** fired when a phone claimed this session and took a token */
  onIssuedElsewhere: () => void;
  onHome: () => void;
};

/**
 * Two ways to hand over an email: scan the code and do it on your own phone,
 * where the token then lives, or tap it out here. The screen polls while the
 * QR is up so it moves on by itself once a phone has taken a token.
 */
export function CaptureScreen({
  session,
  busy,
  error,
  onSubmit,
  onIssuedElsewhere,
  onHome,
}: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"qr" | "keyboard">("qr");
  const [svg, setSvg] = useState<string | null>(null);

  // NEXT_PUBLIC_KIOSK_URL is what phones actually resolve. Falling back to the
  // page's own origin only works when the kiosk is served on something a phone
  // can reach — never plain localhost.
  const [origin] = useState(() =>
    process.env.NEXT_PUBLIC_KIOSK_URL ||
    (typeof window === "undefined" ? "" : window.location.origin)
  );

  const url = useMemo(
    () => (origin ? `${origin.replace(/\/$/, "")}/join/${session}` : null),
    [origin, session]
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
      .then((out) => !cancelled && setSvg(out))
      .catch(() => !cancelled && setSvg(null));
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Watch for a phone taking the token for this session.
  useEffect(() => {
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/token/status?session=${encodeURIComponent(session)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { issued: boolean };
        if (!cancelled && data.issued) {
          clearInterval(id);
          onIssuedElsewhere();
        }
      } catch {
        // venue wifi hiccup — the next tick tries again
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [session, onIssuedElsewhere]);

  if (mode === "keyboard") {
    return (
      <div className="relative h-full w-full">
        <CornerControls>
          <PillButton onClick={onHome}>{t.common.home}</PillButton>
          <PillButton onClick={() => setMode("qr")}>{t.flow.backToQr}</PillButton>
        </CornerControls>
        <EmailCapture busy={busy} error={error} onSubmit={onSubmit} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-[4vmin]">
      <Backdrop intensity={0.5} />
      <CornerControls>
        <PillButton onClick={onHome}>{t.common.home}</PillButton>
      </CornerControls>
      <div className="absolute right-[3vmin] top-[3vmin] z-30">
        <LanguagePicker />
      </div>

      <div className="relative z-10 flex w-full max-w-[150vmin] flex-col items-center gap-[3vmin]">
        <Logo className="text-[5.5vmin]" />

        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[6vmin] uppercase leading-none text-white">
            {t.flow.scanTitle}
          </h1>
          <p className="mt-[1vmin] text-[2.1vmin] font-medium text-white/55">
            {t.flow.captureSubtitle}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-[3vmin] landscape:flex-row landscape:items-stretch landscape:justify-center">
          <div className="flex flex-col items-center gap-[1.6vmin]">
            <div className="rounded-[2.4vmin] bg-white p-[2vmin] shadow-[0_0_8vmin_-2vmin_rgb(255_255_255_/_0.5)]">
              {svg ? (
                <div
                  className="h-[38vmin] w-[38vmin] [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <div className="flex h-[38vmin] w-[38vmin] items-center justify-center text-center text-[1.8vmin] font-semibold text-black/40">
                  …
                </div>
              )}
            </div>
            {url && (
              <p className="max-w-[42vmin] break-all text-center text-[1.4vmin] font-medium text-white/25">
                {url}
              </p>
            )}
          </div>

          <div className="flex max-w-[60vmin] flex-col justify-center gap-[2.4vmin]">
            <ol className="flex flex-col gap-[1.8vmin]">
              {t.flow.scanSteps.map((step, i) => (
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
              {t.flow.orType}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

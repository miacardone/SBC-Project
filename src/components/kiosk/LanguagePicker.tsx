"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n/locales";

/**
 * A globe button that opens a grid of languages, each written in its own
 * script — that is how somebody finds their language among eighteen without
 * reading a word of English.
 */
export function LanguagePicker() {
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.lang.button}
        className="flex items-center gap-[1.2vmin] rounded-full border border-edge bg-panel/90 px-[2.4vmin] py-[1.2vmin] text-[1.7vmin] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur transition active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-[2.4vmin] w-[2.4vmin]" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        {LOCALES.find((l) => l.code === locale)?.name ?? t.lang.button}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-void/95 p-[4vmin] backdrop-blur">
          <h2 className="mb-[3vmin] font-[family-name:var(--font-display)] text-[5vmin] uppercase leading-none text-white">
            {t.lang.title}
          </h2>

          <div className="grid w-full max-w-[150vmin] grid-cols-3 gap-[1.6vmin] landscape:grid-cols-6">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                lang={l.code}
                dir={l.dir}
                className={`flex min-h-[10vmin] items-center justify-center rounded-2xl border-2 px-[1.6vmin] py-[2vmin] text-center text-[2.4vmin] font-semibold transition active:scale-95 ${
                  l.code === locale
                    ? "border-cb-red bg-cb-red/20 text-white"
                    : "border-edge bg-panel text-white/80"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-[3vmin] rounded-2xl border border-edge bg-panel px-[5vmin] py-[1.8vmin] font-[family-name:var(--font-display)] text-[2.8vmin] uppercase tracking-wide text-white/70 transition active:scale-95"
          >
            {t.lang.close}
          </button>
        </div>
      )}
    </>
  );
}

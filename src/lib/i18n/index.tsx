"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeDir,
  NON_LATIN_DISPLAY,
  type LocaleCode,
} from "./locales";
import { en, type Dictionary } from "./locales/en";
import { DICTIONARIES } from "./dictionaries";

export { DICTIONARIES, fill, getDictionary } from "./dictionaries";

type Ctx = {
  locale: LocaleCode;
  setLocale: (next: LocaleCode) => void;
  t: Dictionary;
  dir: "ltr" | "rtl";
  /** true when the display face has no glyphs for this script */
  systemDisplay: boolean;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  const setLocale = useCallback((next: LocaleCode) => {
    if (isLocale(next)) setLocaleState(next);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: DICTIONARIES[locale] ?? en,
      dir: localeDir(locale),
      systemDisplay: NON_LATIN_DISPLAY.includes(locale),
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>
      <div
        dir={value.dir}
        lang={locale}
        className={`h-full w-full ${value.systemDisplay ? "system-display" : ""}`}
      >
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}

/** Tier labels come back from the server by id, so they translate client-side. */
export function tierText(t: Dictionary, id: string): { label: string; blurb: string } {
  return (
    (t.tiers as Record<string, { label: string; blurb: string }>)[id] ?? {
      label: id,
      blurb: "",
    }
  );
}

/** Prize names are operator-editable; anything unlisted shows exactly as typed. */
export function prizeName(t: Dictionary, option: string): string {
  return (t.prizes as Record<string, string>)[option] ?? option;
}

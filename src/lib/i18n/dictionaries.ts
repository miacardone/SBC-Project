import { DEFAULT_LOCALE, isLocale, type LocaleCode } from "./locales";
import { en, type Dictionary } from "./locales/en";
import { es } from "./locales/es";
import { pt } from "./locales/pt";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { it } from "./locales/it";
import { nl } from "./locales/nl";
import { no } from "./locales/no";
import { da } from "./locales/da";
import { fi } from "./locales/fi";
import { pl } from "./locales/pl";
import { ru } from "./locales/ru";
import { tr } from "./locales/tr";
import { zh } from "./locales/zh";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { ar } from "./locales/ar";
import { hi } from "./locales/hi";

/**
 * Every dictionary ships in the bundle rather than loading on demand. Venue
 * wifi is the least reliable thing at a trade show, and a language that only
 * half-loads is worse than one that isn't offered.
 *
 * This module is deliberately free of "use client" so the phone claim page can
 * render server-side in the player's language.
 */
export const DICTIONARIES: Record<LocaleCode, Dictionary> = {
  en, es, pt, fr, de, it, nl, no, da, fi, pl, ru, tr, zh, ja, ko, ar, hi,
};

export function getDictionary(code: string | undefined): Dictionary {
  return isLocale(code ?? "") ? DICTIONARIES[code as LocaleCode] : DICTIONARIES[DEFAULT_LOCALE];
}

/** Substitutes {name} placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole
  );
}

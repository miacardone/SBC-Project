/**
 * Languages offered at the booth. `name` is the language written in its own
 * script — that is how somebody finds their language in a grid of eighteen.
 * `english` is what lands in the CSV, so the list stays sortable afterwards.
 */
export const LOCALES = [
  { code: "en", name: "English", english: "English", dir: "ltr" },
  { code: "es", name: "Español", english: "Spanish", dir: "ltr" },
  { code: "pt", name: "Português", english: "Portuguese", dir: "ltr" },
  { code: "fr", name: "Français", english: "French", dir: "ltr" },
  { code: "de", name: "Deutsch", english: "German", dir: "ltr" },
  { code: "it", name: "Italiano", english: "Italian", dir: "ltr" },
  { code: "nl", name: "Nederlands", english: "Dutch", dir: "ltr" },
  { code: "no", name: "Norsk", english: "Norwegian", dir: "ltr" },
  { code: "da", name: "Dansk", english: "Danish", dir: "ltr" },
  { code: "fi", name: "Suomi", english: "Finnish", dir: "ltr" },
  { code: "pl", name: "Polski", english: "Polish", dir: "ltr" },
  { code: "ru", name: "Русский", english: "Russian", dir: "ltr" },
  { code: "tr", name: "Türkçe", english: "Turkish", dir: "ltr" },
  { code: "zh", name: "中文", english: "Mandarin", dir: "ltr" },
  { code: "ja", name: "日本語", english: "Japanese", dir: "ltr" },
  { code: "ko", name: "한국어", english: "Korean", dir: "ltr" },
  { code: "ar", name: "العربية", english: "Arabic", dir: "rtl" },
  { code: "hi", name: "हिन्दी", english: "Hindi", dir: "ltr" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";

export const LOCALE_NAMES: Record<string, string> = Object.fromEntries(
  LOCALES.map((l) => [l.code, l.english])
);

export function localeDir(code: string): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}

export function isLocale(code: string): code is LocaleCode {
  return LOCALES.some((l) => l.code === code);
}

/**
 * Scripts the display face (Anton) has no glyphs for. Those locales fall back
 * to a heavy system stack rather than rendering headings as tofu.
 */
export const NON_LATIN_DISPLAY: string[] = ["ru", "zh", "ja", "ko", "ar", "hi"];

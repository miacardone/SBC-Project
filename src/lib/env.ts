/**
 * Environment reads that treat blank as missing.
 *
 * Copying `.env.example` into a hosting dashboard leaves every unset key as an
 * empty string, and `??` accepts those happily. That is how a blank ADMIN_PIN
 * became "no password at all" and a blank SLOT_WIN_RATE became "nobody ever
 * wins on the slot machine". Both were live. Read config through here.
 */

export function envText(name: string): string | undefined {
  const raw = process.env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function envNumber(name: string, fallback: number): number {
  const raw = envText(name);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

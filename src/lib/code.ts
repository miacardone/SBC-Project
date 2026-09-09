/** No 0/O/1/I/5/S — this gets read off a phone screen and typed on a kiosk. */
const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY2346789";

function block(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Six characters, shown as ABC-DEF. Short enough that somebody will actually
 * type it into a kiosk without giving up, and 28^6 is still half a billion
 * combinations — far more than a trade show will ever use.
 */
export function makeToken(): string {
  return `${block(3)}-${block(3)}`;
}

export function makeId(): string {
  return `${Date.now().toString(36)}${block(6).toLowerCase()}`;
}

/** A browser-side id for the phone handoff; never shown to anyone. */
export function makeSessionId(): string {
  return `${Date.now().toString(36)}${block(8).toLowerCase()}`;
}

/** Accepts what a person types: spaces, lower case, missing or extra dashes. */
export function normalizeCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // legacy CB-XXXX-XXXX codes from before tokens
  if (raw.startsWith("CB") && raw.length === 10) {
    const body = raw.slice(2);
    return `CB-${body.slice(0, 4)}-${body.slice(4)}`;
  }
  if (raw.length === 6) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  return raw;
}

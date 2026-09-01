/** No 0/O/1/I/5/S — booth staff have to read these off a phone screen. */
const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY2346789";

function block(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function makePrizeCode(): string {
  return `CB-${block(4)}-${block(4)}`;
}

export function makeId(): string {
  return `${Date.now().toString(36)}${block(6).toLowerCase()}`;
}

export function normalizeCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = raw.startsWith("CB") ? raw.slice(2) : raw;
  if (body.length !== 8) return raw.startsWith("CB") ? `CB-${body}` : body;
  return `CB-${body.slice(0, 4)}-${body.slice(4)}`;
}

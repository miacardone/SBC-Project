import { promises as dns } from "node:dns";

/**
 * Filtering, not proof.
 *
 * A domain check cannot tell you whether somebody owns an address — fake.com
 * and example.com both publish perfectly good MX records. What this does is
 * reject the addresses that could never receive mail, and the throwaway
 * services people reach for when they want the prize but not the follow-up, so
 * the player gets told immediately instead of silently ending up in a dead
 * segment. Actual proof comes from delivering the token, or from Google.
 */

const SYNTAX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Domains that exist only to be thrown away, plus the usual placeholders. */
const BLOCKED = new Set([
  "example.com", "example.org", "example.net", "test.com", "test.test",
  "fake.com", "faker.com", "notreal.com", "nope.com", "asdf.com", "qwerty.com",
  "email.com", "mail.com", "abc.com", "aaa.com", "xyz.com", "none.com",
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "throwawaymail.com", "yopmail.com", "yopmail.net", "getnada.com", "nada.email",
  "dispostable.com", "maildrop.cc", "trashmail.com", "trashmail.de", "fakeinbox.com",
  "mailnesia.com", "mytemp.email", "spamgourmet.com", "mintemail.com",
  "moakt.com", "tempr.email", "discard.email", "emailondeck.com", "burnermail.io",
  "inboxbear.com", "spam4.me", "grr.la", "harakirimail.com", "mailcatch.com",
]);

/** Local parts that are nobody's real address. */
const BLOCKED_LOCAL = new Set([
  "test", "tests", "testing", "fake", "asdf", "asdfasdf", "qwerty",
  "aaa", "abc", "xxx", "none", "noone", "nobody", "example", "foo", "bar",
]);

export type EmailVerdict =
  | { ok: true; email: string; domain: string }
  | { ok: false; reason: "syntax" | "blocked-domain" | "no-mail-server" };

// Domains repeat constantly at a booth — the same company over and over — so
// one lookup each is plenty.
const mxCache = new Map<string, boolean>();

async function hasMailServer(domain: string): Promise<boolean> {
  const cached = mxCache.get(domain);
  if (cached !== undefined) return cached;

  let ok = false;
  try {
    const records = await dns.resolveMx(domain);
    ok = records.length > 0;
  } catch {
    // Some domains take mail on the A record with no MX. Rare, but real.
    try {
      const a = await dns.resolve4(domain);
      ok = a.length > 0;
    } catch {
      ok = false;
    }
  }
  mxCache.set(domain, ok);
  return ok;
}

export async function checkEmail(raw: string): Promise<EmailVerdict> {
  const email = raw.trim().toLowerCase();
  if (!SYNTAX.test(email) || email.length > 254) return { ok: false, reason: "syntax" };

  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (BLOCKED.has(domain)) return { ok: false, reason: "blocked-domain" };
  if (BLOCKED_LOCAL.has(local)) return { ok: false, reason: "blocked-domain" };

  if (!(await hasMailServer(domain))) return { ok: false, reason: "no-mail-server" };

  return { ok: true, email, domain };
}

/** m•••@company.com — enough to recognise, not enough to leak. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const head = local.slice(0, 1);
  return `${head}${"•".repeat(Math.max(2, Math.min(6, local.length - 1)))}@${domain}`;
}

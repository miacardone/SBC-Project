import { envText } from "./env";
import type { Entry } from "./types";

const RESEND_KEY = envText("RESEND_API_KEY");
const FROM = envText("PRIZE_EMAIL_FROM") ?? "Chargebacks911 <arcade@chargebacks911.com>";
const BOOTH = envText("BOOTH_LOCATION") ?? "Booth E321";

export const emailConfigured = Boolean(RESEND_KEY);

/* ------------------------------------------------------------------ shell */

function shell(kicker: string, inner: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#08080a;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08080a;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#121216;border:1px solid #2a2a31;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:28px 32px 8px;text-align:center;">
            <div style="font-size:34px;font-weight:800;letter-spacing:-1px;color:#ffffff;">cb<span style="color:#E31E24;">911</span></div>
            <div style="font-size:11px;letter-spacing:3px;color:#8a8a95;text-transform:uppercase;margin-top:6px;">${kicker}</div>
          </td></tr>
          ${inner}
          <tr><td style="padding:0 32px 32px;text-align:center;">
            <p style="color:#6c6c78;font-size:12px;line-height:1.6;margin:0;">
              You got this because you played at ${BOOTH}. Reply to this message any time
              to be removed from our list.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function codeBlock(code: string, caption: string): string {
  return `<tr><td style="padding:8px 32px 0;">
    <div style="background:#08080a;border:2px dashed #E31E24;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:11px;letter-spacing:2px;color:#8a8a95;text-transform:uppercase;">${caption}</div>
      <div style="font-size:34px;font-weight:800;letter-spacing:6px;color:#ffffff;margin-top:8px;font-family:'Courier New',monospace;">${code}</div>
    </div>
  </td></tr>`;
}

/* ------------------------------------------------------------------ send */

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("[email] resend rejected:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

/**
 * The token, on its way to them as they walk up to the machine. They already
 * have it on screen — this is the copy that survives the walk back to the hotel.
 */
export async function sendTokenEmail(entry: Entry): Promise<boolean> {
  return send(
    entry.email,
    `Your play token: ${entry.code}`,
    shell(
      "Your token",
      `${codeBlock(entry.code, "Token")}
      <tr><td style="padding:20px 32px 8px;text-align:center;">
        <p style="color:#c3c3cc;font-size:15px;line-height:1.6;margin:0;">
          Type this into the cb911 machine at ${BOOTH} to take your spin.
          Hang on to it — if you win, this is the same code you show us.
        </p>
      </td></tr>`
    )
  );
}

/**
 * Sent once the outcome is settled — never on a losing spin, because the
 * second chance can still change it.
 */
export async function sendPrizeEmail(entry: Entry): Promise<boolean> {
  const won = entry.result === "win";
  const options = entry.tierOptions
    .map(
      (option) =>
        `<tr><td style="padding:6px 0;"><div style="border:1px solid #2a2a31;border-radius:10px;padding:12px 16px;color:#ffffff;font-size:16px;font-weight:600;text-align:center;">${option}</div></td></tr>`
    )
    .join("");

  return send(
    entry.email,
    won ? `You won! Bring ${entry.code} to ${BOOTH}` : `Your cb911 prize code: ${entry.code}`,
    shell(
      won ? "You won" : "Thanks for playing",
      `<tr><td style="padding:8px 32px 0;text-align:center;">
        <div style="font-size:13px;letter-spacing:2px;color:#E31E24;text-transform:uppercase;font-weight:700;">${entry.tierLabel ?? ""}</div>
        <div style="font-size:18px;color:#c3c3cc;font-weight:600;margin:8px 0 4px;">Choose one at the booth</div>
      </td></tr>
      <tr><td style="padding:8px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${options}</table>
      </td></tr>
      ${codeBlock(entry.code, "Your code")}
      <tr><td style="padding:20px 32px 8px;text-align:center;">
        <p style="color:#c3c3cc;font-size:15px;line-height:1.6;margin:0;">
          Bring this code to <strong style="color:#ffffff;">${BOOTH}</strong> and pick whichever
          one you want. One prize per person, while supplies last.
        </p>
      </td></tr>`
    )
  );
}

import type { Entry } from "./types";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.PRIZE_EMAIL_FROM ?? "Chargebacks911 <arcade@chargebacks911.com>";
const BOOTH = process.env.BOOTH_LOCATION ?? "the Chargebacks911 booth";

export const emailConfigured = Boolean(RESEND_KEY);

function template(entry: Entry): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#08080a;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08080a;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#121216;border:1px solid #2a2a31;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:28px 32px 8px;text-align:center;">
            <div style="font-size:34px;font-weight:800;letter-spacing:-1px;color:#ffffff;">cb<span style="color:#E31E24;">911</span></div>
            <div style="font-size:11px;letter-spacing:3px;color:#8a8a95;text-transform:uppercase;margin-top:6px;">Prize Claim</div>
          </td></tr>
          <tr><td style="padding:8px 32px 0;text-align:center;">
            <div style="font-size:13px;letter-spacing:2px;color:#E31E24;text-transform:uppercase;font-weight:700;">${entry.tierLabel}</div>
            <div style="font-size:26px;color:#ffffff;font-weight:700;margin:8px 0 20px;">${entry.tierItem}</div>
          </td></tr>
          <tr><td style="padding:0 32px;">
            <div style="background:#08080a;border:2px dashed #E31E24;border-radius:12px;padding:20px;text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;color:#8a8a95;text-transform:uppercase;">Your code</div>
              <div style="font-size:32px;font-weight:800;letter-spacing:4px;color:#ffffff;margin-top:8px;font-family:'Courier New',monospace;">${entry.code}</div>
            </div>
          </td></tr>
          <tr><td style="padding:24px 32px 32px;text-align:center;">
            <p style="color:#c3c3cc;font-size:14px;line-height:1.6;margin:0;">
              Show this code at ${BOOTH} to pick up your ${entry.tierItem.toLowerCase()}.
              One prize per person, while supplies last.
            </p>
            <p style="color:#6c6c78;font-size:12px;line-height:1.6;margin:20px 0 0;">
              You got this because you played at our booth and asked us to email your code.
              Reply to this message any time to be removed from our list.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

/** Returns true if the mail actually went out. Never throws — the on-screen
 *  code is the real deliverable, email is the backup. */
export async function sendPrizeEmail(entry: Entry): Promise<boolean> {
  if (!RESEND_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [entry.email],
        subject: `Your prize code: ${entry.code}`,
        html: template(entry),
      }),
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

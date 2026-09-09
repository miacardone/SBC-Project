import { NextResponse } from "next/server";
import { checkPin, unauthorized, usingDefaultPin } from "@/lib/admin";
import { emailConfigured } from "@/lib/email";
import { CONSOLATION, PRIZE_TIERS } from "@/lib/prizes";
import { backend, listEntries, storageHealthy } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!checkPin(request)) return unauthorized();

  const entries = await listEntries();
  const tiers = [...PRIZE_TIERS, CONSOLATION].map((tier) => {
    const won = entries.filter((e) => e.tierId === tier.id);
    return {
      id: tier.id,
      label: tier.label,
      options: tier.options,
      cap: tier.cap,
      awarded: won.length,
      redeemed: won.filter((e) => e.redeemedAt).length,
      remaining: tier.cap === null ? null : Math.max(0, tier.cap - won.length),
    };
  });

  const healthy = await storageHealthy();

  // The failure the booth must never discover from a player: a host where the
  // filesystem isn't writable or isn't shared, with no Redis configured.
  // Each warning carries its own heading — a PIN problem is not a storage
  // problem, and a banner that mislabels itself trains people to ignore it.
  const warning = !healthy
    ? {
        title: "Storage problem",
        text: "Storage is not writable — plays are not being saved.",
      }
    : backend === "file" && process.env.VERCEL
      ? {
          title: "Storage problem",
          text: "Running on Vercel with file storage. Plays will not survive. Connect the Upstash integration, or set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
        }
      : !emailConfigured
        ? {
            title: "Emails are not being verified",
            text: "No sender is configured, so tokens are shown on screen instead of emailed and nobody has to prove their address. Set RESEND_API_KEY and redeploy — until then, treat this lead list as unverified.",
          }
        : usingDefaultPin
        ? {
            title: "Unprotected console",
            text: "This console is still on the default PIN. Set ADMIN_PIN before the doors open — the lead export is behind it.",
          }
        : null;

  return NextResponse.json({
    backend,
    healthy,
    warning,
    // The funnel changed shape when email moved to the front: every row is a
    // captured address, and the interesting number is how many of them went on
    // to actually play.
    tokens: entries.length,
    plays: entries.filter((e) => e.playedAt).length,
    leads: entries.filter((e) => e.email).length,
    secondChances: entries.filter((e) => e.usedSecondChance).length,
    verified: entries.filter((e) => e.verifiedBy && e.verifiedBy !== "none").length,
    consented: entries.filter((e) => e.consent).length,
    redeemed: entries.filter((e) => e.redeemedAt).length,
    casino: entries.filter((e) => e.playedAt).length,
    classroom: entries.filter((e) => e.usedSecondChance).length,
    catch: 0,
    wins: entries.filter((e) => e.result === "win").length,
    tiers,
  });
}

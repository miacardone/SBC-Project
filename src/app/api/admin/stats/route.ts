import { NextResponse } from "next/server";
import { checkPin, unauthorized } from "@/lib/admin";
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
  const warning = !healthy
    ? "Storage is not writable — plays are not being saved."
    : backend === "file" && process.env.VERCEL
      ? "Running on Vercel with file storage. Plays will not survive. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
      : null;

  return NextResponse.json({
    backend,
    healthy,
    warning,
    plays: entries.length,
    leads: entries.filter((e) => e.email).length,
    consented: entries.filter((e) => e.consent).length,
    redeemed: entries.filter((e) => e.redeemedAt).length,
    casino: entries.filter((e) => e.mode === "casino").length,
    classroom: entries.filter((e) => e.mode === "classroom").length,
    catch: entries.filter((e) => e.mode === "catch").length,
    wins: entries.filter((e) => e.result === "win").length,
    tiers,
  });
}

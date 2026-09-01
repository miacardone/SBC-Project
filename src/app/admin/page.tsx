"use client";

import { useCallback, useEffect, useState } from "react";
import type { Entry } from "@/lib/types";

type Stats = {
  backend: string;
  plays: number;
  leads: number;
  consented: number;
  redeemed: number;
  casino: number;
  classroom: number;
  wins: number;
  tiers: {
    id: string;
    label: string;
    item: string;
    cap: number | null;
    awarded: number;
    redeemed: number;
    remaining: number | null;
  }[];
};

const PIN_KEY = "cb911-admin-pin";

export default function Admin() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState<{ tone: "ok" | "warn" | "bad"; text: string } | null>(null);

  const load = useCallback(async (withPin: string) => {
    const headers = { "x-admin-pin": withPin };
    const [s, l] = await Promise.all([
      fetch("/api/admin/stats", { headers, cache: "no-store" }),
      fetch("/api/admin/leads", { headers, cache: "no-store" }),
    ]);
    if (!s.ok || !l.ok) throw new Error("unauthorized");
    setStats((await s.json()) as Stats);
    setEntries(((await l.json()) as { entries: Entry[] }).entries);
  }, []);

  // Remember the PIN across refreshes — the console lives on a tablet at the
  // prize table and nobody wants to retype it every time the screen sleeps.
  useEffect(() => {
    const saved = localStorage.getItem(PIN_KEY);
    if (!saved) return;
    let cancelled = false;
    fetch("/api/admin/stats", { headers: { "x-admin-pin": saved }, cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setPin(saved);
          setAuthed(true);
        } else {
          localStorage.removeItem(PIN_KEY);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the booth dashboard live without anyone touching it.
  useEffect(() => {
    if (!authed) return;
    const refresh = () => load(pin).catch(() => {});
    const kick = setTimeout(refresh, 0);
    const id = setInterval(refresh, 15_000);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, [authed, pin, load]);

  const signIn = async () => {
    setLoginError(null);
    try {
      await load(pin);
      localStorage.setItem(PIN_KEY, pin);
      setAuthed(true);
    } catch {
      setLoginError("Wrong PIN.");
    }
  };

  const redeem = async (undo = false) => {
    setRedeemMsg(null);
    const res = await fetch("/api/admin/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ code, undo }),
    });
    const data = (await res.json()) as {
      entry?: Entry;
      status?: string;
      error?: string;
    };

    if (!res.ok || !data.entry) {
      setRedeemMsg({ tone: "bad", text: data.error ?? "Not found." });
      return;
    }
    if (data.status === "already-redeemed") {
      setRedeemMsg({
        tone: "warn",
        text: `${data.entry.tierItem} — ALREADY REDEEMED ${new Date(data.entry.redeemedAt as string).toLocaleTimeString()}`,
      });
    } else if (data.status === "reopened") {
      setRedeemMsg({ tone: "warn", text: `Reopened ${data.entry.code}.` });
    } else {
      setRedeemMsg({ tone: "ok", text: `Hand over: ${data.entry.tierItem}` });
    }
    setCode("");
    load(pin).catch(() => {});
  };

  if (!authed) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-2xl border border-edge bg-panel p-8">
          <div className="text-center font-[family-name:var(--font-display)] text-4xl">
            <span className="text-white">cb</span>
            <span className="text-cb-red">911</span>
          </div>
          <p className="mt-1 text-center text-xs uppercase tracking-[0.3em] text-white/40">
            Booth console
          </p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
            placeholder="PIN"
            className="mt-6 w-full rounded-xl border border-edge bg-black/60 px-4 py-3 text-center text-2xl tracking-[0.4em] text-white outline-none focus:border-cb-red"
          />
          {loginError && <p className="mt-2 text-center text-sm text-cb-red">{loginError}</p>}
          <button
            type="button"
            onClick={signIn}
            className="mt-4 w-full rounded-xl bg-cb-red py-3 font-semibold uppercase tracking-widest text-white active:scale-95"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 md:p-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase">
            <span className="text-white">cb</span>
            <span className="text-cb-red">911</span>{" "}
            <span className="text-white/50">booth console</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/35">
            storage: {stats?.backend} · refreshes every 15s
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/api/admin/leads?format=csv&pin=${encodeURIComponent(pin)}`}
            className="rounded-xl border border-edge bg-panel px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white/80 active:scale-95"
          >
            Export leads CSV
          </a>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(PIN_KEY);
              setAuthed(false);
            }}
            className="rounded-xl border border-edge bg-panel px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white/50 active:scale-95"
          >
            Lock
          </button>
        </div>
      </header>

      {/* redemption desk */}
      <section className="mb-8 rounded-2xl border-2 border-cb-red/50 bg-cb-red/5 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-cb-red">
          Redeem a code
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && redeem()}
            placeholder="CB-XXXX-XXXX"
            autoCapitalize="characters"
            className="min-w-0 flex-1 rounded-xl border border-edge bg-black/60 px-4 py-4 font-[family-name:var(--font-display)] text-3xl tracking-[0.15em] text-white uppercase outline-none focus:border-cb-red"
          />
          <button
            type="button"
            onClick={() => redeem()}
            className="rounded-xl bg-cb-red px-8 py-4 font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-white active:scale-95"
          >
            Look up
          </button>
          <button
            type="button"
            onClick={() => redeem(true)}
            className="rounded-xl border border-edge bg-panel px-5 py-4 text-sm font-semibold uppercase tracking-widest text-white/50 active:scale-95"
          >
            Undo
          </button>
        </div>
        {redeemMsg && (
          <p
            className={`mt-4 rounded-xl px-4 py-3 font-[family-name:var(--font-display)] text-2xl uppercase ${
              redeemMsg.tone === "ok"
                ? "bg-emerald-400/15 text-emerald-300"
                : redeemMsg.tone === "warn"
                  ? "bg-amber-400/15 text-amber-300"
                  : "bg-cb-red/20 text-cb-red-hot"
            }`}
          >
            {redeemMsg.text}
          </p>
        )}
      </section>

      {/* numbers */}
      {stats && (
        <>
          <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            <Stat label="Plays" value={stats.plays} />
            <Stat label="Emails" value={stats.leads} accent />
            <Stat label="Opted in" value={stats.consented} />
            <Stat label="Redeemed" value={stats.redeemed} />
            <Stat label="Wins" value={stats.wins} />
            <Stat label="Casino" value={stats.casino} />
            <Stat label="Classroom" value={stats.classroom} />
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Inventory
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {stats.tiers.map((tier) => (
                <div key={tier.id} className="rounded-2xl border border-edge bg-panel p-5">
                  <div className="text-xs uppercase tracking-[0.25em] text-cb-red">
                    {tier.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">{tier.item}</div>
                  <div className="mt-3 text-3xl font-[family-name:var(--font-display)] text-white">
                    {tier.awarded}
                    <span className="text-white/30">
                      {tier.cap === null ? " awarded" : ` / ${tier.cap}`}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-white/40">
                    {tier.redeemed} picked up
                    {tier.remaining !== null && ` · ${tier.remaining} left`}
                  </div>
                  {tier.cap !== null && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cb-red"
                        style={{ width: `${Math.min(100, (tier.awarded / tier.cap) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* leads */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
          Latest plays
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-edge">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-panel text-xs uppercase tracking-widest text-white/40">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Prize</th>
                <th className="px-4 py-3">Game</th>
                <th className="px-4 py-3">Opt-in</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 200).map((e) => (
                <tr key={e.code} className="border-t border-edge/60 bg-black/30">
                  <td className="whitespace-nowrap px-4 py-3 text-white/45">
                    {new Date(e.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-white/85">{e.email || <span className="text-white/25">—</span>}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-white">{e.code}</td>
                  <td className="px-4 py-3 text-white/70">{e.tierItem}</td>
                  <td className="px-4 py-3 text-white/45">
                    {e.mode}
                    {e.score !== null && ` ${e.score}/5`}
                  </td>
                  <td className="px-4 py-3">{e.consent ? "yes" : "—"}</td>
                  <td className="px-4 py-3">
                    {e.redeemedAt ? (
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs uppercase tracking-widest text-emerald-300">
                        redeemed
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-white/40">
                        open
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/30">
                    Nothing yet. Go play a round.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-edge bg-panel p-5">
      <div className={`text-xs uppercase tracking-[0.25em] ${accent ? "text-cb-red" : "text-white/40"}`}>
        {label}
      </div>
      <div className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-none text-white">
        {value}
      </div>
    </div>
  );
}

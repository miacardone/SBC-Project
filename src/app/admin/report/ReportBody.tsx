"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlayDetail, playSummary } from "@/components/admin/PlayDetail";
import { LOCALE_NAMES } from "@/lib/i18n/locales";
import { QUESTIONS } from "@/lib/quiz";
import type { Entry } from "@/lib/types";

type TierStat = {
  id: string;
  label: string;
  options: string[];
  cap: number | null;
  awarded: number;
  redeemed: number;
  remaining: number | null;
};

type Stats = {
  backend: string;
  plays: number;
  leads: number;
  consented: number;
  redeemed: number;
  casino: number;
  classroom: number;
  catch: number;
  wins: number;
  tiers: TierStat[];
};

const PIN_KEY = "cb911-admin-pin";

export default function ReportBody() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pin: string) => {
    const headers = { "x-admin-pin": pin };
    const [s, l] = await Promise.all([
      fetch("/api/admin/stats", { headers, cache: "no-store" }),
      fetch("/api/admin/leads", { headers, cache: "no-store" }),
    ]);
    if (!s.ok || !l.ok) throw new Error("unauthorized");
    setStats((await s.json()) as Stats);
    setEntries(((await l.json()) as { entries: Entry[] }).entries);
  }, []);

  // The console stores the PIN; this page only reads it. Reading during render
  // keeps the "not signed in" case out of the effect entirely.
  const [pin] = useState(() =>
    typeof window === "undefined" ? null : localStorage.getItem(PIN_KEY)
  );

  useEffect(() => {
    if (!pin) return;
    const fetchAll = () =>
      load(pin).catch(() => setError("Sign in on the console first, then come back."));
    const id = setTimeout(fetchAll, 0);
    return () => clearTimeout(id);
  }, [pin, load]);

  /** Everything the headline numbers don't already cover. */
  const derived = useMemo(() => {
    const withEmail = entries.filter((e) => e.email);
    const byLanguage = new Map<string, number>();
    for (const e of entries) {
      const name = e.locale ? (LOCALE_NAMES[e.locale] ?? e.locale) : "not recorded";
      byLanguage.set(name, (byLanguage.get(name) ?? 0) + 1);
    }

    const scored = (mode: string) => {
      const rows = entries.filter((e) => e.mode === mode && e.score !== null);
      if (rows.length === 0) return null;
      const total = rows.reduce((sum, r) => sum + (r.score ?? 0), 0);
      return { average: total / rows.length, outOf: rows[0].scoreOutOf ?? 0, count: rows.length };
    };

    const first = entries.at(-1)?.createdAt;
    const last = entries[0]?.createdAt;

    // What people actually walked away with, ranked. Counts only prizes staff
    // recorded at the booth, so it reflects the shelf rather than eligibility.
    const byPrize = new Map<string, number>();
    for (const e of entries) {
      if (!e.chosenPrize) continue;
      byPrize.set(e.chosenPrize, (byPrize.get(e.chosenPrize) ?? 0) + 1);
    }

    // Per-question correct rate across every quiz played — the closest thing
    // this booth produces to a read on what the market misunderstands.
    const asked = new Map<string, { right: number; total: number }>();
    for (const e of entries) {
      if (e.detail?.kind !== "classroom") continue;
      for (const a of e.detail.answers) {
        const row = asked.get(a.id) ?? { right: 0, total: 0 };
        row.total += 1;
        if (a.correct) row.right += 1;
        asked.set(a.id, row);
      }
    }
    const knowledge = [...asked.entries()]
      .map(([id, row]) => ({
        id,
        prompt: QUESTIONS.find((q) => q.id === id)?.prompt ?? id,
        answer: QUESTIONS.find((q) => q.id === id)?.options[
          QUESTIONS.find((q) => q.id === id)?.answer ?? 0
        ],
        rate: row.total ? (row.right / row.total) * 100 : 0,
        total: row.total,
      }))
      .sort((a, b) => a.rate - b.rate);

    // Which fraud signals slip past, and which good customers get refused.
    const fraudSeen = new Map<string, { caught: number; missed: number }>();
    const legitSeen = new Map<string, { declined: number; kept: number }>();
    for (const e of entries) {
      if (e.detail?.kind !== "catch") continue;
      for (const m of e.detail.caught) {
        const row = fraudSeen.get(m) ?? { caught: 0, missed: 0 };
        row.caught += 1;
        fraudSeen.set(m, row);
      }
      for (const m of e.detail.missed) {
        const row = fraudSeen.get(m) ?? { caught: 0, missed: 0 };
        row.missed += 1;
        fraudSeen.set(m, row);
      }
      for (const m of e.detail.declined) {
        const row = legitSeen.get(m) ?? { declined: 0, kept: 0 };
        row.declined += 1;
        legitSeen.set(m, row);
      }
      for (const m of e.detail.kept ?? []) {
        const row = legitSeen.get(m) ?? { declined: 0, kept: 0 };
        row.kept += 1;
        legitSeen.set(m, row);
      }
    }
    const trickiestFraud = [...fraudSeen.entries()]
      .map(([merchant, r]) => ({
        merchant,
        seen: r.caught + r.missed,
        missRate: r.caught + r.missed ? (r.missed / (r.caught + r.missed)) * 100 : 0,
      }))
      .filter((r) => r.seen > 0)
      .sort((a, b) => b.missRate - a.missRate);
    const overDeclined = [...legitSeen.entries()]
      .map(([merchant, r]) => ({
        merchant,
        seen: r.declined + r.kept,
        declineRate: r.declined + r.kept ? (r.declined / (r.declined + r.kept)) * 100 : 0,
        declined: r.declined,
      }))
      .filter((r) => r.declined > 0)
      .sort((a, b) => b.declineRate - a.declineRate);

    return {
      prizes: [...byPrize.entries()].sort((a, b) => b[1] - a[1]),
      knowledge,
      trickiestFraud,
      overDeclined,
      languages: [...byLanguage.entries()].sort((a, b) => b[1] - a[1]),
      quiz: scored("classroom"),
      catch: scored("catch"),
      captureRate: entries.length ? (withEmail.length / entries.length) * 100 : 0,
      optInRate: withEmail.length
        ? (entries.filter((e) => e.consent).length / withEmail.length) * 100
        : 0,
      firstPlay: first ? new Date(first) : null,
      lastPlay: last ? new Date(last) : null,
    };
  }, [entries]);

  if (!pin || error) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-white/60">
            {error ?? "Sign in on the console first, then come back."}
          </p>
          <Link href="/admin" className="mt-4 inline-block text-cb-red underline">
            Back to the console
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="flex h-full items-center justify-center text-white/40">Loading…</div>;
  }

  const withDetail = entries.filter((e) => e.detail && e.mode !== "casino");

  return (
    <div className="report h-full overflow-auto bg-white text-neutral-900">
      {/* toolbar — never printed */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-8 py-4">
        <Link href="/admin" className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          ← Console
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white"
        >
          Save as PDF
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-10 print:px-0 print:py-0">
        {/* header */}
        <header className="border-b-2 border-neutral-900 pb-5">
          <div className="text-4xl font-extrabold tracking-tight">
            cb<span className="text-[#e31e24]">911</span> Arcade
          </div>
          <h1 className="mt-1 text-xl font-semibold">Event report</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Generated {new Date().toLocaleString()}
            {derived.firstPlay && (
              <>
                {" · "}Play from {derived.firstPlay.toLocaleString()} to{" "}
                {derived.lastPlay?.toLocaleString()}
              </>
            )}
          </p>
        </header>

        {/* headline */}
        <Section title="Headline">
          <div className="grid grid-cols-3 gap-4">
            <Figure label="Plays" value={stats.plays} />
            <Figure label="Emails captured" value={stats.leads} />
            <Figure label="Marketing opt-ins" value={stats.consented} />
            <Figure label="Capture rate" value={`${derived.captureRate.toFixed(0)}%`} note="of plays that left an email" />
            <Figure label="Opt-in rate" value={`${derived.optInRate.toFixed(0)}%`} note="of captured emails" />
            <Figure label="Prizes redeemed" value={stats.redeemed} note="collected at the booth" />
          </div>
        </Section>

        {/* games */}
        <Section title="By game">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-300 text-left text-xs uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="py-2">Game</th>
                <th className="py-2">Plays</th>
                <th className="py-2">Average score</th>
              </tr>
            </thead>
            <tbody>
              <Row3 a="Casino (slots)" b={stats.casino} c="—" />
              <Row3
                a="Classroom (quiz)"
                b={stats.classroom}
                c={derived.quiz ? `${derived.quiz.average.toFixed(1)} / ${derived.quiz.outOf}` : "—"}
              />
              <Row3
                a="Catch (fraud)"
                b={stats.catch}
                c={derived.catch ? `${derived.catch.average.toFixed(1)} / ${derived.catch.outOf}` : "—"}
              />
              <Row3 a="Winning plays" b={stats.wins} c="—" />
            </tbody>
          </table>
        </Section>

        {/* languages */}
        <Section title="Languages played in">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-300 text-left text-xs uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="py-2">Language</th>
                <th className="py-2">Plays</th>
                <th className="py-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {derived.languages.map(([name, count]) => (
                <tr key={name} className="border-b border-neutral-100">
                  <td className="py-1.5">{name}</td>
                  <td className="py-1.5">{count}</td>
                  <td className="py-1.5 text-neutral-500">
                    {stats.plays ? ((count / stats.plays) * 100).toFixed(0) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* inventory */}
        <Section title="Prize inventory">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-300 text-left text-xs uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="py-2">Tier</th>
                <th className="py-2">Options</th>
                <th className="py-2">Awarded</th>
                <th className="py-2">Collected</th>
                <th className="py-2">Left</th>
              </tr>
            </thead>
            <tbody>
              {stats.tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-neutral-100 align-top">
                  <td className="py-1.5 font-semibold">{tier.label}</td>
                  <td className="py-1.5 text-neutral-600">{tier.options.join(" · ")}</td>
                  <td className="py-1.5">
                    {tier.awarded}
                    {tier.cap !== null && ` / ${tier.cap}`}
                  </td>
                  <td className="py-1.5">{tier.redeemed}</td>
                  <td className="py-1.5">{tier.remaining ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* what people took */}
        {derived.prizes.length > 0 && (
          <Section title="Most popular prizes">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-300 text-left text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="py-2">Prize</th>
                  <th className="py-2">Taken</th>
                  <th className="py-2">Share of collected</th>
                </tr>
              </thead>
              <tbody>
                {derived.prizes.map(([name, count]) => (
                  <tr key={name} className="border-b border-neutral-100">
                    <td className="py-1.5">{name}</td>
                    <td className="py-1.5">{count}</td>
                    <td className="py-1.5 text-neutral-500">
                      {stats.redeemed ? ((count / stats.redeemed) * 100).toFixed(0) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-neutral-500">
              Counts only prizes staff recorded at the booth. Use this to decide what to
              order more of next time.
            </p>
          </Section>
        )}

        {/* knowledge */}
        {derived.knowledge.length > 0 && (
          <Section title="What visitors got wrong most">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-300 text-left text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="py-2">Question</th>
                  <th className="py-2">Correct</th>
                  <th className="py-2">Asked</th>
                </tr>
              </thead>
              <tbody>
                {derived.knowledge.map((q) => (
                  <tr key={q.id} className="border-b border-neutral-100 align-top">
                    <td className="py-1.5">
                      {q.prompt}
                      <div className="text-xs text-neutral-500">answer: {q.answer}</div>
                    </td>
                    <td className="py-1.5 font-semibold">{q.rate.toFixed(0)}%</td>
                    <td className="py-1.5 text-neutral-500">{q.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-neutral-500">
              Ordered worst first. The questions at the top are the gaps worth writing
              content about.
            </p>
          </Section>
        )}

        {/* fraud signals */}
        {(derived.trickiestFraud.length > 0 || derived.overDeclined.length > 0) && (
          <Section title="Fraud signals">
            {derived.trickiestFraud.length > 0 && (
              <>
                <h3 className="mb-2 text-sm font-semibold">Fraud that slipped past most often</h3>
                <table className="mb-5 w-full text-sm">
                  <thead className="border-b border-neutral-300 text-left text-xs uppercase tracking-widest text-neutral-500">
                    <tr>
                      <th className="py-2">Order</th>
                      <th className="py-2">Missed</th>
                      <th className="py-2">Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {derived.trickiestFraud.slice(0, 8).map((r) => (
                      <tr key={r.merchant} className="border-b border-neutral-100">
                        <td className="py-1.5">{r.merchant}</td>
                        <td className="py-1.5 font-semibold">{r.missRate.toFixed(0)}%</td>
                        <td className="py-1.5 text-neutral-500">{r.seen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {derived.overDeclined.length > 0 && (
              <>
                <h3 className="mb-2 text-sm font-semibold">
                  Good customers refused most often
                </h3>
                <table className="w-full text-sm">
                  <thead className="border-b border-neutral-300 text-left text-xs uppercase tracking-widest text-neutral-500">
                    <tr>
                      <th className="py-2">Order</th>
                      <th className="py-2">Refused</th>
                      <th className="py-2">Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {derived.overDeclined.slice(0, 8).map((r) => (
                      <tr key={r.merchant} className="border-b border-neutral-100">
                        <td className="py-1.5">{r.merchant}</td>
                        <td className="py-1.5 font-semibold">
                          {r.seen > 0 ? `${r.declineRate.toFixed(0)}%` : `${r.declined}`}
                        </td>
                        <td className="py-1.5 text-neutral-500">{r.seen || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Section>
        )}

        {/* leads */}
        <Section title={`Leads (${stats.leads})`}>
          <table className="w-full text-xs">
            <thead className="border-b border-neutral-300 text-left uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="py-2">Email</th>
                <th className="py-2">Code</th>
                <th className="py-2">Game</th>
                <th className="py-2">Prize taken</th>
                <th className="py-2">Language</th>
                <th className="py-2">Opt-in</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries
                .filter((e) => e.email)
                .map((e) => (
                  <tr key={e.code} className="border-b border-neutral-100">
                    <td className="py-1.5">{e.email}</td>
                    <td className="py-1.5 font-mono">{e.code}</td>
                    <td className="py-1.5">
                      {e.mode}
                      {e.score !== null && ` ${e.score}/${e.scoreOutOf}`}
                    </td>
                    <td className="py-1.5">{e.chosenPrize ?? "not collected"}</td>
                    <td className="py-1.5">
                      {e.locale ? (LOCALE_NAMES[e.locale] ?? e.locale) : "—"}
                    </td>
                    <td className="py-1.5">{e.consent ? "yes" : "no"}</td>
                    <td className="py-1.5 text-neutral-500">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {stats.plays > stats.leads && (
            <p className="mt-3 text-xs text-neutral-500">
              {stats.plays - stats.leads} further{" "}
              {stats.plays - stats.leads === 1 ? "play" : "plays"} left no email and are
              excluded from this table.
            </p>
          )}
        </Section>

        {/* answers */}
        {withDetail.length > 0 && (
          <Section title="Answers, play by play">
            <div className="flex flex-col gap-5">
              {withDetail.map((e) => (
                <div key={e.code} className="break-inside-avoid border-t border-neutral-200 pt-3">
                  <div className="text-sm font-semibold">
                    {e.email || "no email"} — <span className="font-mono">{e.code}</span>
                  </div>
                  <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
                    {playSummary(e)} · {new Date(e.createdAt).toLocaleString()}
                  </div>
                  <PlayDetail entry={e} print />
                </div>
              ))}
            </div>
          </Section>
        )}

        <footer className="mt-10 border-t border-neutral-300 pt-4 text-xs text-neutral-500">
          Chargebacks911 · cb911 Arcade · storage: {stats.backend}. Contacts marked
          &ldquo;opt-in: no&rdquo; gave their address only to receive a prize code and have not
          consented to marketing.
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Figure({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="text-xs uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-extrabold">{value}</div>
      {note && <div className="mt-0.5 text-xs text-neutral-500">{note}</div>}
    </div>
  );
}

function Row3({ a, b, c }: { a: string; b: number | string; c: string }) {
  return (
    <tr className="border-b border-neutral-100">
      <td className="py-1.5">{a}</td>
      <td className="py-1.5">{b}</td>
      <td className="py-1.5">{c}</td>
    </tr>
  );
}

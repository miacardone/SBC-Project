"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "./Chrome";
import {
  CARD_LIFE,
  CATCH_PASS,
  CATCH_TOTAL,
  MAX_LIVE,
  SLOTS,
  SPAWN_EVERY,
  dealRound,
  type Transaction,
} from "@/lib/catch";

type LiveCard = {
  key: string;
  card: Transaction;
  slot: number;
  bornAt: number;
};

type Flash = { text: string; detail: string; tone: "good" | "bad" };

type Props = {
  onFinish: (caught: number) => void;
  onQuit: () => void;
};

const TICK = 100;

export function CatchGame({ onFinish, onQuit }: Props) {
  const deck = useMemo(() => dealRound(), []);

  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [countdown, setCountdown] = useState(3);
  const [live, setLive] = useState<LiveCard[]>([]);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [falseDeclines, setFalseDeclines] = useState(0);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [dealt, setDealt] = useState(0);

  // The board itself lives in a ref and is mirrored into state for rendering.
  // Keeping the loop's bookkeeping out of a state updater matters: React runs
  // updaters twice in development, and a spawn decided inside one would be
  // thrown away on the second pass.
  const board = useRef<LiveCard[]>([]);
  const cursor = useRef(0);
  const lastSpawn = useRef(0);
  const seq = useRef(0);

  const showFlash = useCallback((next: Flash) => {
    setFlash(next);
    setTimeout(() => setFlash((f) => (f === next ? null : f)), 900);
  }, []);

  /* ------------------------------------------------------------- countdown */

  useEffect(() => {
    if (phase !== "ready") return;
    const id = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(id);
          setPhase("playing");
          return 0;
        }
        return n - 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [phase]);

  /* ------------------------------------------------------------ board loop */

  useEffect(() => {
    if (phase !== "playing") return;
    lastSpawn.current = Date.now() - SPAWN_EVERY;

    const id = setInterval(() => {
      const now = Date.now();
      const current = board.current;

      // Retire anything that timed out. A fraud card that expires got away.
      const escapes = current.filter(
        (c) => now - c.bornAt >= CARD_LIFE && c.card.fraud
      ).length;
      let next = current.filter((c) => now - c.bornAt < CARD_LIFE);

      if (escapes > 0) {
        setMissed((m) => m + escapes);
        showFlash({ text: "Got away", detail: "That one becomes a chargeback.", tone: "bad" });
      }

      // Spawn into a free slot.
      if (
        cursor.current < deck.length &&
        next.length < MAX_LIVE &&
        now - lastSpawn.current >= SPAWN_EVERY
      ) {
        const taken = new Set(next.map((c) => c.slot));
        const free = Array.from({ length: SLOTS }, (_, i) => i).filter((i) => !taken.has(i));
        if (free.length > 0) {
          const slot = free[Math.floor(Math.random() * free.length)];
          next = [
            ...next,
            { key: `c${seq.current++}`, card: deck[cursor.current++], slot, bornAt: now },
          ];
          lastSpawn.current = now;
          setDealt(cursor.current);
        }
      }

      board.current = next;
      setLive(next);

      if (cursor.current >= deck.length && next.length === 0) {
        clearInterval(id);
        setPhase("done");
      }
    }, TICK);

    return () => clearInterval(id);
  }, [phase, deck, showFlash]);

  /* ------------------------------------------------------------------ done */

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => onFinish(caught), 1400);
    return () => clearTimeout(t);
  }, [phase, caught, onFinish]);

  /* ------------------------------------------------------------------ taps */

  const tap = (target: LiveCard) => {
    board.current = board.current.filter((c) => c.key !== target.key);
    setLive(board.current);
    if (target.card.fraud) {
      setCaught((c) => c + 1);
      showFlash({ text: "Caught", detail: target.card.tell, tone: "good" });
    } else {
      setFalseDeclines((f) => f + 1);
      showFlash({
        text: "Good customer",
        detail: "You just declined a real order.",
        tone: "bad",
      });
    }
  };

  const progress = Math.min(100, (dealt / deck.length) * 100);

  return (
    <div className="flex h-full w-full items-center justify-center p-[3vmin]">
      <div className="@container flex w-[min(94vw,125vh)] max-w-[1500px] flex-col gap-[2cqw]">
        {/* header */}
        <div className="flex items-center justify-between gap-[2cqw]">
          <button
            type="button"
            onClick={onQuit}
            className="rounded-full border border-edge bg-panel px-[2cqw] py-[1cqw] text-[1.5cqw] font-semibold uppercase tracking-[0.2em] text-white/60 transition active:scale-95"
          >
            Quit
          </button>

          <div className="text-center">
            <div className="font-[family-name:var(--font-display)] text-[3.2cqw] uppercase leading-none text-white">
              Catch the <span className="text-cb-red">fraud</span>
            </div>
            <div className="mt-[0.6cqw] text-[1.3cqw] font-semibold uppercase tracking-[0.3em] text-white/35">
              Tap the bad orders · leave the good ones alone
            </div>
          </div>

          <Logo className="w-[10cqw] text-[3.4cqw]" />
        </div>

        {/* score bar */}
        <div className="flex items-center gap-[1.6cqw]">
          <Tally label="Caught" value={caught} tone="good" />
          <Tally label="Missed" value={missed} tone="bad" />
          <Tally label="Wrongly declined" value={falseDeclines} tone="bad" />
          <div className="ml-auto h-[0.9cqw] w-[26cqw] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cb-red transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* board */}
        <div className="relative rounded-[2cqw] border-2 border-edge bg-gradient-to-b from-panel to-pit p-[2cqw]">
          <div className="grid grid-cols-2 gap-[1.6cqw] landscape:grid-cols-3">
            {Array.from({ length: SLOTS }).map((_, slot) => {
              const occupant = live.find((c) => c.slot === slot);
              return (
                <div key={slot} className="relative aspect-[16/9]">
                  {occupant ? (
                    <TransactionCard card={occupant} onTap={() => tap(occupant)} />
                  ) : (
                    <div className="h-full w-full rounded-[1.4cqw] border border-dashed border-white/8 bg-black/30" />
                  )}
                </div>
              );
            })}
          </div>

          {/* pre-roll + wrap-up overlays */}
          {phase !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2cqw] bg-black/85 text-center">
              {phase === "ready" ? (
                <>
                  <p className="max-w-[70%] text-[2.2cqw] font-medium leading-snug text-white/70">
                    Orders will pop up with one detail each. Tap the ones that smell
                    like fraud before they clear.
                  </p>
                  <div className="mt-[2cqw] font-[family-name:var(--font-display)] text-[12cqw] leading-none text-cb-red">
                    {countdown}
                  </div>
                </>
              ) : (
                <div className="font-[family-name:var(--font-display)] text-[6cqw] uppercase leading-none text-white">
                  Time&apos;s up
                </div>
              )}
            </div>
          )}
        </div>

        {/* feedback line — fixed height so the board never jumps */}
        <div className="flex h-[6cqw] items-center justify-center">
          {flash && (
            <div
              className={`animate-pop flex items-center gap-[1.6cqw] rounded-[1.2cqw] border-2 px-[2.4cqw] py-[1.2cqw] ${
                flash.tone === "good"
                  ? "border-emerald-400/70 bg-emerald-400/10"
                  : "border-cb-red/70 bg-cb-red/10"
              }`}
            >
              <span
                className={`font-[family-name:var(--font-display)] text-[2.4cqw] uppercase leading-none ${
                  flash.tone === "good" ? "text-emerald-300" : "text-cb-red-hot"
                }`}
              >
                {flash.text}
              </span>
              <span className="text-[1.8cqw] text-white/65">{flash.detail}</span>
            </div>
          )}
        </div>

        <p className="text-center text-[1.5cqw] font-semibold uppercase tracking-[0.3em] text-white/25">
          Catch {CATCH_PASS} of {CATCH_TOTAL} to win · all {CATCH_TOTAL} for the jackpot
        </p>
      </div>
    </div>
  );
}

function TransactionCard({ card, onTap }: { card: LiveCard; onTap: () => void }) {
  const [life, setLife] = useState(100);

  useEffect(() => {
    const id = setInterval(() => {
      const left = 100 - ((Date.now() - card.bornAt) / CARD_LIFE) * 100;
      setLife(Math.max(0, left));
    }, 60);
    return () => clearInterval(id);
  }, [card.bornAt]);

  return (
    <button
      type="button"
      onClick={onTap}
      className="animate-pop flex h-full w-full flex-col justify-between rounded-[1.4cqw] border-2 border-white/25 bg-gradient-to-b from-[#1c1c23] to-[#101015] p-[1.6cqw] text-left shadow-[0_1cqw_3cqw_rgb(0_0_0_/_0.6)] transition active:scale-95"
    >
      <div className="flex w-full items-baseline justify-between gap-[1cqw]">
        <span className="truncate text-[1.9cqw] font-semibold text-white">
          {card.card.merchant}
        </span>
        <span className="font-[family-name:var(--font-display)] text-[2.4cqw] leading-none text-white">
          {card.card.amount}
        </span>
      </div>

      <p className="text-[1.7cqw] leading-tight text-white/65">{card.card.tell}</p>

      <div className="h-[0.5cqw] w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cb-red"
          style={{ width: `${life}%` }}
        />
      </div>
    </button>
  );
}

function Tally({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "bad";
}) {
  return (
    <div className="rounded-[1cqw] border border-edge bg-black/40 px-[1.6cqw] py-[0.9cqw]">
      <span
        className={`font-[family-name:var(--font-display)] text-[2.4cqw] leading-none ${
          tone === "good" ? "text-emerald-300" : "text-white/70"
        }`}
      >
        {value}
      </span>
      <span className="ml-[0.8cqw] text-[1.3cqw] font-semibold uppercase tracking-[0.2em] text-white/35">
        {label}
      </span>
    </div>
  );
}

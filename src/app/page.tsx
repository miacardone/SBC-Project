"use client";

import { useCallback, useEffect, useState } from "react";
import { SymbolDefs } from "@/components/Symbols";
import { AttractScreen } from "@/components/kiosk/AttractScreen";
import { CodeCard } from "@/components/kiosk/CodeCard";
import { EmailCapture } from "@/components/kiosk/EmailCapture";
import { ModeSelect } from "@/components/kiosk/ModeSelect";
import { PrizeReveal } from "@/components/kiosk/PrizeReveal";
import { Quiz } from "@/components/kiosk/Quiz";
import { SlotMachine } from "@/components/kiosk/SlotMachine";
import { requestOutcome, type ClaimResponse, type OutcomeResponse } from "@/lib/client";
import type { GameMode } from "@/lib/types";

type Stage =
  | "attract"
  | "choose"
  | "casino"
  | "classroom"
  | "grading"
  | "reveal"
  | "email"
  | "code";

/** Abandoned session? Reset the screen for the next person in line. */
const IDLE_MS = 75_000;

export default function Kiosk() {
  const [stage, setStage] = useState<Stage>("attract");
  const [mode, setMode] = useState<GameMode>("casino");
  const [score, setScore] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<OutcomeResponse | null>(null);
  const [claim, setClaim] = useState<ClaimResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStage("attract");
    setScore(null);
    setOutcome(null);
    setClaim(null);
    setBusy(false);
    setError(null);
  }, []);

  /* ------------------------------------------------------------ idle kick */

  useEffect(() => {
    if (stage === "attract") return;

    let timer = setTimeout(reset, IDLE_MS);
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(reset, IDLE_MS);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [stage, reset]);

  /* ----------------------------------------------------------- transitions */

  const start = useCallback(() => {
    // A booth screen should be edge to edge. Browsers only allow this from a
    // real gesture, so the first tap of every session is the opportunity.
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    setStage("choose");
  }, []);

  const pickMode = useCallback((picked: GameMode) => {
    setMode(picked);
    setStage(picked === "casino" ? "casino" : "classroom");
  }, []);

  const slotsFinished = useCallback((result: OutcomeResponse) => {
    setOutcome(result);
    setStage("reveal");
  }, []);

  const quizFinished = useCallback(async (finalScore: number) => {
    setScore(finalScore);
    setStage("grading");
    try {
      const result = await requestOutcome("classroom", finalScore);
      setOutcome(result);
      setStage("reveal");
    } catch {
      setError("Couldn't reach the prize desk. Grab someone at the booth.");
      setStage("choose");
    }
  }, []);

  const submitEmail = useCallback(
    async (email: string, consent: boolean) => {
      if (!outcome) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: outcome.id, email, consent }),
        });
        const data = (await res.json()) as ClaimResponse & { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Something went sideways. Try again.");
          return;
        }
        setClaim(data);
        setStage("code");
      } catch {
        setError("No connection. Ask a Chargebacks911 rep for help.");
      } finally {
        setBusy(false);
      }
    },
    [outcome]
  );

  const skipEmail = useCallback(async () => {
    if (!outcome) return;
    setBusy(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: outcome.id, skipEmail: true }),
      });
      const data = (await res.json()) as ClaimResponse;
      setClaim(data);
      setStage("code");
    } catch {
      setError("No connection. Ask a Chargebacks911 rep for help.");
    } finally {
      setBusy(false);
    }
  }, [outcome]);

  /* ---------------------------------------------------------------- render */

  return (
    <main className="relative h-full w-full overflow-hidden bg-void">
      <SymbolDefs />

      {stage === "attract" && <AttractScreen onStart={start} />}

      {stage === "choose" && (
        <>
          <ModeSelect onPick={pickMode} onQuit={reset} />
          {error && (
            <p className="absolute inset-x-0 bottom-[3vmin] z-30 text-center text-[2vmin] font-semibold text-cb-red-hot">
              {error}
            </p>
          )}
        </>
      )}

      {stage === "casino" && <SlotMachine onFinish={slotsFinished} onQuit={reset} />}

      {stage === "classroom" && <Quiz onFinish={quizFinished} onQuit={reset} />}

      {stage === "grading" && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-[3vmin]">
          <div className="h-[12vmin] w-[12vmin] animate-glow rounded-full border-[1vmin] border-cb-red border-t-transparent" />
          <p className="font-[family-name:var(--font-display)] text-[4vmin] uppercase tracking-wide text-white/70">
            Tallying your score…
          </p>
        </div>
      )}

      {stage === "reveal" && outcome && (
        <PrizeReveal
          outcome={outcome}
          mode={mode}
          score={score}
          onContinue={() => setStage("email")}
        />
      )}

      {stage === "email" && outcome && (
        <EmailCapture
          prizeItem={outcome.prize.item}
          busy={busy}
          error={error}
          onSubmit={submitEmail}
          onSkip={skipEmail}
        />
      )}

      {stage === "code" && claim && outcome && (
        <CodeCard claim={claim} prizeItem={outcome.prize.item} onDone={reset} />
      )}
    </main>
  );
}

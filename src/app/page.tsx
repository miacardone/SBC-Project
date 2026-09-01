"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SymbolDefs } from "@/components/Symbols";
import { AttractScreen } from "@/components/kiosk/AttractScreen";
import { CatchGame } from "@/components/kiosk/CatchGame";
import { CatchResults } from "@/components/kiosk/CatchResults";
import { CodeCard } from "@/components/kiosk/CodeCard";
import { ClaimScreen } from "@/components/kiosk/ClaimScreen";
import { ModeSelect } from "@/components/kiosk/ModeSelect";
import { PrizeReveal } from "@/components/kiosk/PrizeReveal";
import { Quiz, type AnswerLog } from "@/components/kiosk/Quiz";
import { QuizResults } from "@/components/kiosk/QuizResults";
import { SlotMachine } from "@/components/kiosk/SlotMachine";
import { Backdrop, CornerControls, Logo, PillButton } from "@/components/kiosk/Chrome";
import { fill, tierText, useI18n } from "@/lib/i18n";
import { requestClaim, requestOutcome, type ClaimResponse, type OutcomeResponse } from "@/lib/client";
import { CATCH_TOTAL, type CatchResult } from "@/lib/catch";
import type { GameMode, PlayDetail } from "@/lib/types";

type Stage =
  | "attract"
  | "choose"
  | "casino"
  | "classroom"
  | "catch"
  | "review"
  | "grading"
  | "reveal"
  | "email"
  | "code"
  | "trouble";

/** Abandoned session? Reset the screen for the next person in line. */
const IDLE_MS = 90_000;

/**
 * The claim screen gets far longer, because a player who scans the QR finishes
 * on their phone and never touches the booth screen again — the idle timer
 * would otherwise reset the kiosk out from under them mid-typing.
 */
const IDLE_MS_CLAIMING = 300_000;

export default function Kiosk() {
  const { t, locale } = useI18n();
  const [stage, setStage] = useState<Stage>("attract");
  const [mode, setMode] = useState<GameMode>("casino");
  const [score, setScore] = useState<number | null>(null);
  const [quizLog, setQuizLog] = useState<AnswerLog[]>([]);
  const [catchResult, setCatchResult] = useState<CatchResult | null>(null);
  const [outcome, setOutcome] = useState<OutcomeResponse | null>(null);
  const [claim, setClaim] = useState<ClaimResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The prize request is fired the moment a skill game ends, so it resolves
  // while the player is still reading their results.
  const pending = useRef<Promise<OutcomeResponse> | null>(null);

  const reset = useCallback(() => {
    pending.current = null;
    setStage("attract");
    setScore(null);
    setQuizLog([]);
    setCatchResult(null);
    setOutcome(null);
    setClaim(null);
    setBusy(false);
    setError(null);
  }, []);

  /* ------------------------------------------------------------ idle kick */

  useEffect(() => {
    if (stage === "attract") return;

    const idleWindow = stage === "email" ? IDLE_MS_CLAIMING : IDLE_MS;
    let timer = setTimeout(reset, idleWindow);
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(reset, idleWindow);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [stage, reset]);

  /* ---------------------------------------------------------- transitions */

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
    setError(null);
    setStage(picked);
  }, []);

  /** Kick off the prize request without blocking the screen. */
  const prefetchPrize = useCallback(
    (forMode: GameMode, forScore: number, detail?: PlayDetail) => {
      const request = requestOutcome(forMode, forScore, locale, detail);
      request.catch(() => {}); // handled below; this just avoids an unhandled rejection
      request.then(setOutcome, () => {});
      pending.current = request;
    },
    [locale]
  );

  const slotsFinished = useCallback((result: OutcomeResponse) => {
    setOutcome(result);
    setStage("reveal");
  }, []);

  const quizFinished = useCallback(
    (log: AnswerLog[]) => {
      const correct = log.filter((entry) => entry.correct).length;
      setQuizLog(log);
      setScore(correct);
      prefetchPrize("classroom", correct, {
        kind: "classroom",
        answers: log.map((e) => ({ id: e.question.id, picked: e.picked, correct: e.correct })),
      });
      setStage("review");
    },
    [prefetchPrize]
  );

  const catchFinished = useCallback(
    (result: CatchResult) => {
      const caught = result.caught.length;
      setCatchResult(result);
      setScore(caught);
      prefetchPrize("catch", caught, {
        kind: "catch",
        caught: result.caught.map((c) => c.merchant),
        missed: result.missed.map((c) => c.merchant),
        declined: result.declined.map((c) => c.merchant),
      });
      setStage("review");
    },
    [prefetchPrize]
  );

  /** Move from a skill game's results to the prize reveal. */
  const settlePrize = useCallback(() => {
    setStage(outcome ? "reveal" : "grading");
  }, [outcome]);

  /** Re-issue a prize request that failed outright. */
  const retryPrize = useCallback(() => {
    prefetchPrize(mode, score ?? 0);
    setStage("grading");
  }, [prefetchPrize, mode, score]);

  // Whatever put us in grading, the answer arrives here.
  useEffect(() => {
    if (stage !== "grading") return;
    let cancelled = false;
    (pending.current ?? Promise.reject(new Error("no request")))
      .then((result) => {
        if (cancelled) return;
        setOutcome(result);
        setStage("reveal");
      })
      .catch(() => {
        if (!cancelled) setStage("trouble");
      });
    return () => {
      cancelled = true;
    };
  }, [stage]);

  const submitEmail = useCallback(
    async (email: string, consent: boolean) => {
      if (!outcome) return;
      setBusy(true);
      setError(null);
      try {
        setClaim(await requestClaim({ outcome, email, consent }));
        setStage("code");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went sideways. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [outcome]
  );

  const skipEmail = useCallback(async () => {
    if (!outcome) return;
    setBusy(true);
    setError(null);
    try {
      setClaim(await requestClaim({ outcome, skipEmail: true }));
      setStage("code");
    } catch {
      setError("No connection. Ask a Chargebacks911 rep for help.");
    } finally {
      setBusy(false);
    }
  }, [outcome]);

  const scoreLine =
    mode === "catch" && score !== null ? `Caught ${score} of ${CATCH_TOTAL}` : null;

  /* -------------------------------------------------------------- render */

  return (
    <main className="relative h-full w-full overflow-hidden bg-void">
      <SymbolDefs />

      {stage === "attract" && <AttractScreen onStart={start} />}

      {stage === "choose" && <ModeSelect onPick={pickMode} onQuit={reset} />}

      {stage === "casino" && <SlotMachine onFinish={slotsFinished} onQuit={reset} />}

      {stage === "classroom" && <Quiz onFinish={quizFinished} onQuit={reset} />}

      {stage === "catch" && <CatchGame onFinish={catchFinished} onQuit={reset} />}

      {stage === "review" && mode === "classroom" && (
        <QuizResults log={quizLog} onContinue={settlePrize} onHome={reset} />
      )}

      {stage === "review" && mode === "catch" && catchResult && (
        <CatchResults result={catchResult} onContinue={settlePrize} onHome={reset} />
      )}

      {stage === "grading" && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-[3vmin]">
          <div className="h-[12vmin] w-[12vmin] animate-glow rounded-full border-[1vmin] border-cb-red border-t-transparent" />
          <p className="font-[family-name:var(--font-display)] text-[4vmin] uppercase tracking-wide text-white/70">
            {t.common.grading}
          </p>
        </div>
      )}

      {stage === "reveal" && outcome && (
        <PrizeReveal
          outcome={outcome}
          scoreLine={scoreLine}
          onContinue={() => setStage("email")}
          onHome={reset}
        />
      )}

      {stage === "email" && outcome && (
        <ClaimScreen
          outcome={outcome}
          prizeLine={
            outcome.result === "win"
              ? fill(t.email.wonLine, { label: tierText(t, outcome.prize.id).label })
              : t.email.loseLine
          }
          busy={busy}
          error={error}
          onSubmit={submitEmail}
          onSkip={skipEmail}
          onClaimed={(result) => {
            setClaim(result);
            setStage("code");
          }}
          onHome={reset}
        />
      )}

      {stage === "code" && claim && <CodeCard claim={claim} onDone={reset} />}

      {stage === "trouble" && (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-[3vmin] overflow-hidden p-[5vmin] text-center">
          <Backdrop intensity={0.4} />
          <CornerControls>
            <PillButton onClick={reset}>{t.common.home}</PillButton>
          </CornerControls>
          <div className="relative z-10 flex flex-col items-center gap-[2.4vmin]">
            <Logo className="text-[6vmin]" />
            <h1 className="font-[family-name:var(--font-display)] text-[6vmin] uppercase leading-none text-white">
              {t.trouble.title} <span className="text-cb-red">{t.trouble.titleAccent}</span>
            </h1>
            <p className="max-w-[90vmin] text-[2.4vmin] font-medium text-white/60">
              {t.trouble.body}
            </p>
            <div className="mt-[1vmin] flex gap-[2vmin]">
              <button
                type="button"
                onClick={retryPrize}
                className="rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[5vmin] py-[1.8vmin] font-[family-name:var(--font-display)] text-[3vmin] uppercase leading-none tracking-wide text-white transition active:scale-95"
              >
                {t.trouble.tryAgain}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-2xl border border-edge bg-panel px-[5vmin] py-[1.8vmin] font-[family-name:var(--font-display)] text-[3vmin] uppercase leading-none tracking-wide text-white/60 transition active:scale-95"
              >
                {t.trouble.startOver}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

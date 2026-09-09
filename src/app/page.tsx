"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SymbolDefs } from "@/components/Symbols";
import { AttractScreen } from "@/components/kiosk/AttractScreen";
import { CaptureScreen } from "@/components/kiosk/CaptureScreen";
import { Backdrop, CornerControls, Logo, PillButton } from "@/components/kiosk/Chrome";
import { CodeCard } from "@/components/kiosk/CodeCard";
import { PrizeReveal } from "@/components/kiosk/PrizeReveal";
import { Quiz, type AnswerLog } from "@/components/kiosk/Quiz";
import { QuizResults } from "@/components/kiosk/QuizResults";
import { SecondChance } from "@/components/kiosk/SecondChance";
import { SlotMachine } from "@/components/kiosk/SlotMachine";
import { TokenScreen } from "@/components/kiosk/TokenScreen";
import { makeSessionId, normalizeCode } from "@/lib/code";
import { play, PlayFailed, requestToken, type PlayResponse } from "@/lib/client";
import { useI18n } from "@/lib/i18n";

type Stage =
  | "attract"
  | "capture"
  | "token"
  | "wheel"
  | "secondChanceOffer"
  | "quiz"
  | "review"
  | "grading"
  | "reveal"
  | "code"
  | "trouble";

/** Abandoned session? Reset the screen for the next person in line. */
const IDLE_MS = 90_000;

/**
 * The capture and token screens wait on a phone — scanning a code, reading an
 * inbox — and nobody is touching the kiosk while that happens. A 90-second
 * timer would reset the machine out from under them.
 */
const IDLE_MS_WAITING = 300_000;

export default function Kiosk() {
  const { t, locale } = useI18n();

  const [stage, setStage] = useState<Stage>("attract");
  const [session, setSession] = useState(() => makeSessionId());
  const [token, setToken] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<PlayResponse | null>(null);
  const [quizLog, setQuizLog] = useState<AnswerLog[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pending = useRef<Promise<PlayResponse> | null>(null);

  const reset = useCallback(() => {
    pending.current = null;
    setSession(makeSessionId());
    setStage("attract");
    setToken(null);
    setOutcome(null);
    setQuizLog([]);
    setBusy(false);
    setError(null);
  }, []);

  /* ------------------------------------------------------------ idle kick */

  useEffect(() => {
    if (stage === "attract") return;
    const waiting = stage === "capture" || stage === "token";
    const window_ = waiting ? IDLE_MS_WAITING : IDLE_MS;

    let timer = setTimeout(reset, window_);
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(reset, window_);
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
    setStage("capture");
  }, []);

  /** Email typed on the kiosk itself. */
  const submitEmail = useCallback(
    async (email: string, consent: boolean) => {
      setBusy(true);
      setError(null);
      try {
        await requestToken({ email, consent, locale, session });
        setStage("token");
      } catch {
        setError(t.phone.offline);
      } finally {
        setBusy(false);
      }
    },
    [locale, session, t.phone.offline]
  );

  /** Enter the token to unlock the spin. */
  const submitToken = useCallback(
    async (raw: string) => {
      setBusy(true);
      setError(null);
      const code = normalizeCode(raw);
      try {
        // Nothing is spent here; the spin itself happens on the machine.
        const res = await fetch(`/api/token/check?code=${encodeURIComponent(code)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { ok: boolean; reason?: string };
        if (!data.ok) {
          setError(data.reason === "already-played" ? t.flow.tokenUsed : t.flow.tokenUnknown);
          return;
        }
        setToken(code);
        setStage("wheel");
      } catch {
        setError(t.phone.offline);
      } finally {
        setBusy(false);
      }
    },
    [t.flow.tokenUnknown, t.flow.tokenUsed, t.phone.offline]
  );

  const spin = useCallback(() => {
    if (!token) throw new PlayFailed("unknown-token");
    return play({ code: token, stage: "wheel" });
  }, [token]);

  const wheelFinished = useCallback((result: PlayResponse) => {
    setOutcome(result);
    setStage(result.secondChanceAvailable ? "secondChanceOffer" : "reveal");
  }, []);

  const declineSecondChance = useCallback(async () => {
    if (!token) return reset();
    setStage("grading");
    try {
      setOutcome(await play({ code: token, stage: "decline" }));
      setStage("reveal");
    } catch {
      setStage("trouble");
    }
  }, [token, reset]);

  const quizFinished = useCallback(
    (log: AnswerLog[]) => {
      if (!token) return;
      const correct = log.filter((entry) => entry.correct).length;
      setQuizLog(log);
      const request = play({
        code: token,
        stage: "second-chance",
        score: correct,
        detail: {
          kind: "classroom",
          answers: log.map((entry) => ({
            id: entry.question.id,
            picked: entry.picked,
            correct: entry.correct,
          })),
        },
      });
      request.catch(() => {});
      request.then(setOutcome, () => {});
      pending.current = request;
      setStage("review");
    },
    [token]
  );

  const settlePrize = useCallback(() => {
    setStage(outcome && !outcome.secondChanceAvailable ? "reveal" : "grading");
  }, [outcome]);

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

  const scoreLine = useMemo(() => null, []);

  /* -------------------------------------------------------------- render */

  return (
    <main className="relative h-full w-full overflow-hidden bg-void">
      <SymbolDefs />

      {stage === "attract" && <AttractScreen onStart={start} />}

      {stage === "capture" && (
        <CaptureScreen
          session={session}
          busy={busy}
          error={error}
          onSubmit={submitEmail}
          onIssuedElsewhere={() => setStage("token")}
          onHome={reset}
        />
      )}

      {stage === "token" && (
        <TokenScreen busy={busy} error={error} onSubmit={submitToken} onHome={reset} />
      )}

      {stage === "wheel" && (
        <SlotMachine onSpin={spin} onFinish={wheelFinished} onQuit={reset} />
      )}

      {stage === "secondChanceOffer" && (
        <SecondChance
          onTake={() => setStage("quiz")}
          onDecline={declineSecondChance}
          onHome={reset}
        />
      )}

      {stage === "quiz" && <Quiz onFinish={quizFinished} onQuit={declineSecondChance} />}

      {stage === "review" && (
        <QuizResults log={quizLog} onContinue={settlePrize} onHome={reset} />
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
          onContinue={() => setStage("code")}
          onHome={reset}
        />
      )}

      {stage === "code" && outcome && token && (
        <CodeCard code={token} outcome={outcome} onDone={reset} />
      )}

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
            <button
              type="button"
              onClick={reset}
              className="rounded-2xl border border-edge bg-panel px-[5vmin] py-[1.8vmin] font-[family-name:var(--font-display)] text-[3vmin] uppercase leading-none tracking-wide text-white/60 transition active:scale-95"
            >
              {t.trouble.startOver}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

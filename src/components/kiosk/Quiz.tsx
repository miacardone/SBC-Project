"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Logo } from "./Chrome";
import { fill, useI18n } from "@/lib/i18n";
import { drawRound, QUIZ_LENGTH, QUIZ_PASS_SCORE, QUIZ_TIME, type Question } from "@/lib/quiz";

/** What the player did on one question — feeds the review screen. */
export type AnswerLog = {
  question: Question;
  picked: number | null;
  correct: boolean;
};

type Props = {
  onFinish: (log: AnswerLog[]) => void;
  onQuit: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

export function Quiz({ onFinish, onQuit }: Props) {
  const { t } = useI18n();
  const round = useMemo<Question[]>(() => drawRound(), []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<AnswerLog[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [timedIndex, setTimedIndex] = useState(0);

  // Reset the clock the moment the question changes, during render, so the
  // badge never flashes the previous question's leftover seconds.
  if (timedIndex !== index) {
    setTimedIndex(index);
    setTimeLeft(QUIZ_TIME);
  }

  const question = round[index];
  // Text lives in the dictionary; the bank keeps ids and answer indexes.
  const copy = t.questions[question.id as keyof typeof t.questions];
  const isLast = index === round.length - 1;
  const correct = revealed && picked === question.answer;

  const answer = useCallback(
    (choice: number | null) => {
      if (revealed) return;
      const right = choice === question.answer;
      setPicked(choice);
      setRevealed(true);
      if (right) setScore((s) => s + 1);
      setLog((entries) => [...entries, { question, picked: choice, correct: right }]);
    },
    [revealed, question]
  );

  // Countdown. Running out is just a wrong answer — keeps the line moving.
  useEffect(() => {
    if (revealed) return;
    const started = Date.now();
    const id = setInterval(() => {
      const left = QUIZ_TIME - (Date.now() - started) / 1000;
      if (left <= 0) {
        clearInterval(id);
        setTimeLeft(0);
        answer(null);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [index, revealed, answer]);

  const next = () => {
    if (isLast) {
      onFinish(log);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  };

  const urgent = !revealed && timeLeft <= 5;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-[3vmin]">
      <div className="@container flex w-[min(94vw,130vh)] max-w-[1500px] flex-col gap-[2.4cqw]">
        {/* header */}
        <div className="flex items-center justify-between gap-[2cqw]">
          <button
            type="button"
            onClick={onQuit}
            className="rounded-full border border-edge bg-panel px-[2cqw] py-[1cqw] text-[1.5cqw] font-semibold uppercase tracking-[0.2em] text-white/60 transition active:scale-95"
          >
            {t.quiz.quit}
          </button>

          <div className="text-center">
            <div className="font-[family-name:var(--font-display)] text-[3.2cqw] uppercase leading-none text-white">
              {t.quiz.title} <span className="text-cb-red">{t.quiz.titleAccent}</span>
            </div>
            <div className="mt-[0.6cqw] text-[1.3cqw] font-semibold uppercase tracking-[0.35em] text-white/35">
              {fill(t.quiz.subtitle, { pass: QUIZ_PASS_SCORE, total: QUIZ_LENGTH })}
            </div>
          </div>

          <Logo className="w-[10cqw] text-[3.4cqw]" />
        </div>

        {/* progress */}
        <div className="flex items-center gap-[1cqw]">
          {round.map((q, i) => (
            <div
              key={q.id}
              className={`h-[0.9cqw] flex-1 rounded-full transition-colors ${
                i < index ? "bg-cb-red" : i === index ? "bg-white/60" : "bg-white/10"
              }`}
            />
          ))}
          <div className="ml-[1cqw] w-[7cqw] text-right font-[family-name:var(--font-display)] text-[2.6cqw] leading-none text-white">
            {score}
            <span className="text-white/30">/{QUIZ_LENGTH}</span>
          </div>
        </div>

        {/* question card */}
        <div className="rounded-[2cqw] border-2 border-edge bg-gradient-to-b from-panel to-pit p-[3cqw] shadow-[0_2cqw_6cqw_rgb(0_0_0_/_0.7)]">
          <div className="flex items-start justify-between gap-[2cqw]">
            <p className="font-[family-name:var(--font-display)] text-[3.6cqw] uppercase leading-[1.1] text-white">
              {copy.prompt}
            </p>
            <div
              className={`shrink-0 rounded-2xl border-2 px-[1.8cqw] py-[1cqw] text-center font-[family-name:var(--font-display)] text-[3cqw] leading-none transition-colors ${
                urgent
                  ? "border-cb-red bg-cb-red/20 text-cb-red-hot animate-shake"
                  : "border-edge text-white/70"
              }`}
            >
              {revealed ? "–" : Math.ceil(timeLeft)}
            </div>
          </div>

          {!revealed && (
            <div className="mt-[1.6cqw] h-[0.6cqw] w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
                  urgent ? "bg-cb-red-hot" : "bg-cb-red"
                }`}
                style={{ width: `${(timeLeft / QUIZ_TIME) * 100}%` }}
              />
            </div>
          )}

          <div className="mt-[2.6cqw] grid grid-cols-2 gap-[1.6cqw]">
            {copy.options.map((option, i) => {
              const isAnswer = i === question.answer;
              const isPicked = i === picked;
              const state = !revealed
                ? "border-edge bg-black/40 text-white/90 active:border-cb-red/70 active:bg-cb-red/10"
                : isAnswer
                  ? "border-emerald-400 bg-emerald-400/15 text-white"
                  : isPicked
                    ? "border-cb-red bg-cb-red/15 text-white"
                    : "border-edge bg-black/20 text-white/35";

              return (
                <button
                  key={option}
                  type="button"
                  disabled={revealed}
                  onClick={() => answer(i)}
                  className={`flex min-h-[9cqw] items-center gap-[1.6cqw] rounded-[1.4cqw] border-2 p-[1.8cqw] text-left transition active:scale-[0.98] ${state}`}
                >
                  <span
                    className={`flex h-[4cqw] w-[4cqw] shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-display)] text-[2.2cqw] ${
                      revealed && isAnswer
                        ? "bg-emerald-400 text-black"
                        : revealed && isPicked
                          ? "bg-cb-red text-white"
                          : "bg-white/10 text-white/70"
                    }`}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="text-[2cqw] font-medium leading-tight">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* reveal */}
        <div className="min-h-[11cqw]">
          {revealed && (
            <div className="animate-rise flex items-center gap-[2cqw] rounded-[1.6cqw] border-2 border-edge bg-black/50 p-[2.2cqw]">
              <div
                className={`shrink-0 rounded-xl px-[1.8cqw] py-[1cqw] font-[family-name:var(--font-display)] text-[2.4cqw] uppercase leading-none ${
                  correct ? "bg-emerald-400 text-black" : "bg-cb-red text-white"
                }`}
              >
                {correct ? t.quiz.correct : picked === null ? t.quiz.outOfTime : t.quiz.nope}
              </div>
              <p className="flex-1 text-[1.9cqw] leading-snug text-white/75">
                {copy.explain}
              </p>
              <button
                type="button"
                onClick={next}
                className="shrink-0 rounded-[1.2cqw] border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[3cqw] py-[1.4cqw] font-[family-name:var(--font-display)] text-[2.4cqw] uppercase tracking-wide text-white shadow-[0_0_3cqw_-0.5cqw_rgb(227_30_36_/_0.9)] transition active:scale-95"
              >
                {isLast ? t.quiz.seePrize : t.quiz.next}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

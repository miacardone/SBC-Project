"use client";

import { Backdrop, CornerControls, Logo, PillButton } from "./Chrome";
import { QUIZ_LENGTH, QUIZ_PASS_SCORE } from "@/lib/quiz";
import type { AnswerLog } from "./Quiz";

type Props = {
  log: AnswerLog[];
  onContinue: () => void;
  onHome: () => void;
};

export function QuizResults({ log, onContinue, onHome }: Props) {
  const score = log.filter((entry) => entry.correct).length;
  const perfect = score >= QUIZ_LENGTH;
  const passed = score >= QUIZ_PASS_SCORE;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-[3vmin]">
      <Backdrop intensity={0.5} />
      <CornerControls>
        <PillButton onClick={onHome}>Home</PillButton>
      </CornerControls>

      <div className="@container relative z-10 flex w-[min(94vw,120vh)] max-w-[1400px] flex-col gap-[2cqw]">
        <div className="flex items-center justify-between gap-[2cqw]">
          <Logo className="w-[11cqw] text-[3.6cqw]" />
          <div className="text-center">
            <div className="font-[family-name:var(--font-display)] text-[3cqw] uppercase leading-none text-white/50">
              You scored
            </div>
            <div
              className={`font-[family-name:var(--font-display)] text-[9cqw] leading-none ${
                perfect ? "text-gold" : passed ? "text-cb-red" : "text-white"
              }`}
            >
              {score}
              <span className="text-white/25">/{QUIZ_LENGTH}</span>
            </div>
          </div>
          <div className="w-[11cqw] text-right text-[1.5cqw] font-semibold uppercase leading-tight tracking-[0.2em] text-white/35">
            {perfect
              ? "Jackpot pool unlocked"
              : passed
                ? "Prize unlocked"
                : "Everyone still wins"}
          </div>
        </div>

        {/* review */}
        <div className="flex flex-col gap-[1cqw]">
          {log.map((entry, i) => {
            const chosen =
              entry.picked === null ? "Ran out of time" : entry.question.options[entry.picked];
            return (
              <div
                key={entry.question.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`animate-rise flex items-start gap-[1.6cqw] rounded-[1.2cqw] border-2 bg-black/40 p-[1.4cqw] ${
                  entry.correct ? "border-emerald-400/50" : "border-cb-red/40"
                }`}
              >
                <span
                  className={`flex h-[3.4cqw] w-[3.4cqw] shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-display)] text-[2cqw] leading-none ${
                    entry.correct ? "bg-emerald-400 text-black" : "bg-cb-red text-white"
                  }`}
                >
                  {entry.correct ? "✓" : "✗"}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[1.8cqw] font-semibold leading-tight text-white">
                    {entry.question.prompt}
                  </p>
                  <p className="mt-[0.5cqw] text-[1.6cqw] leading-tight text-white/55">
                    {entry.correct ? (
                      <>
                        You said <span className="text-emerald-300">{chosen}</span>
                      </>
                    ) : (
                      <>
                        You said <span className="text-cb-red-hot">{chosen}</span> · answer:{" "}
                        <span className="text-emerald-300">
                          {entry.question.options[entry.question.answer]}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="mt-[0.4cqw] text-[1.5cqw] leading-tight text-white/35">
                    {entry.question.explain}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="relative mx-auto overflow-hidden rounded-2xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep px-[6cqw] py-[1.8cqw] font-[family-name:var(--font-display)] text-[3.4cqw] uppercase leading-none tracking-wide text-white shadow-[0_0_4cqw_-1cqw_rgb(227_30_36_/_0.95)] transition active:scale-[0.97]"
        >
          <span className="relative z-10">See my prize</span>
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md animate-sweep" />
        </button>
      </div>
    </div>
  );
}

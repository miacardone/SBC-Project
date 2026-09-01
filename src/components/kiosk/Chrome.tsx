"use client";

import type { ReactNode } from "react";

/* ------------------------------------------------------------------ logo */

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`select-none text-center leading-none ${className}`}>
      <div className="font-[family-name:var(--font-display)] tracking-tight">
        <span className="text-white">cb</span>
        <span className="text-cb-red [text-shadow:0_0_28px_rgb(227_30_36_/_0.85)]">911</span>
      </div>
      <div className="mt-[0.35em] text-[0.13em] font-semibold uppercase tracking-[0.42em] text-white/35">
        reclaim <span className="text-cb-red/70">your</span> revenue
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- marquee */

/** The chase lights that run around a real slot cabinet. */
export function Bulbs({
  count = 24,
  vertical = false,
  className = "",
}: {
  count?: number;
  vertical?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`flex ${vertical ? "flex-col" : "flex-row"} items-center justify-between ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-[0.55vmin] w-[0.55vmin] rounded-full bg-cb-red-hot animate-bulb"
          style={{ animationDelay: `${(i % 6) * 0.18}s` }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- backdrop */

export function Backdrop({ intensity = 1 }: { intensity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 grid-floor"
        style={{ opacity: 0.45 * intensity }}
      />
      <div
        className="absolute -inset-x-1/4 top-[12%] h-[2px] bg-gradient-to-r from-transparent via-cb-red to-transparent animate-glow"
        style={{ opacity: 0.5 * intensity }}
      />
      <div
        className="absolute -inset-x-1/4 bottom-[18%] h-[2px] bg-gradient-to-r from-transparent via-cb-red to-transparent animate-glow"
        style={{ opacity: 0.35 * intensity, animationDelay: "1.1s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,var(--color-void)_78%)]" />
    </div>
  );
}

/* ---------------------------------------------------------------- button */

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  className?: string;
  sub?: string;
};

export function BigButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  sub,
}: ButtonProps) {
  const primary =
    "bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep text-white border-white/25 shadow-[0_0_40px_-6px_rgb(227_30_36_/_0.9),inset_0_2px_0_rgb(255_255_255_/_0.35)]";
  const ghost =
    "bg-gradient-to-b from-panel to-pit text-white/85 border-edge shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-2xl border-2 px-[2.2em] py-[0.85em] font-[family-name:var(--font-display)] uppercase leading-none tracking-wide transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "primary" ? primary : ghost
      } ${className}`}
    >
      <span className="relative z-10 block">{children}</span>
      {sub ? (
        <span className="relative z-10 mt-[0.45em] block font-[family-name:var(--font-sans)] text-[0.3em] font-semibold uppercase tracking-[0.3em] opacity-70">
          {sub}
        </span>
      ) : null}
      {!disabled && (
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 z-0 w-1/3 bg-white/25 blur-md animate-sweep" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------ pill button */

/** The small top-left escape hatch every post-game screen carries. */
export function PillButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border border-edge bg-panel/90 px-[2.6vmin] py-[1.2vmin] text-[1.7vmin] font-semibold uppercase tracking-[0.2em] text-white/60 backdrop-blur transition active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

/** Fixed top-left corner slot so Home sits in the same place on every screen. */
export function CornerControls({ children }: { children: ReactNode }) {
  return (
    <div className="absolute left-[3vmin] top-[3vmin] z-30 flex gap-[1.5vmin]">{children}</div>
  );
}

/* ------------------------------------------------------------- confetti */

const CONFETTI_COLORS = ["#e31e24", "#ffffff", "#ffc93c", "#ff3b35", "#b9bcc6"];

export function Confetti({ pieces = 70 }: { pieces?: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: pieces }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 block animate-fall"
          style={{
            left: `${(i * 97) % 100}%`,
            width: `${0.6 + ((i * 7) % 9) / 10}vmin`,
            height: `${0.9 + ((i * 13) % 12) / 10}vmin`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${((i * 37) % 220) / 100}s`,
            animationDuration: `${2.2 + ((i * 11) % 16) / 10}s`,
          }}
        />
      ))}
    </div>
  );
}

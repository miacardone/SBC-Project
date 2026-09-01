"use client";

/**
 * On-screen keyboard. A booth screen has no hardware keyboard and mobile-style
 * virtual keyboards don't exist on a wall-mounted display, so the kiosk brings
 * its own — with the shortcuts that cover most of the email addresses people
 * actually type at an event.
 */

const ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "-"],
  ["z", "x", "c", "v", "b", "n", "m", "_", "."],
];

const DOMAINS = ["@gmail.com", "@outlook.com", "@yahoo.com", "@icloud.com", ".com"];

type Props = {
  onKey: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  clearLabel?: string;
  canSubmit?: boolean;
};

function Key({
  children,
  onClick,
  className = "",
  accent = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[7.4vmin] flex-1 items-center justify-center rounded-xl border text-[2.4vmin] font-semibold transition active:scale-95 ${
        accent
          ? "border-cb-red/60 bg-cb-red/15 text-white active:bg-cb-red/35"
          : "border-edge bg-panel text-white/90 active:bg-white/15"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Keyboard({
  onKey,
  onBackspace,
  onClear,
  onSubmit,
  submitLabel = "Get my code",
  clearLabel = "Clear",
  canSubmit = true,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-[1vmin]">
      <div className="flex gap-[1vmin]">
        {DOMAINS.map((d) => (
          <Key key={d} accent onClick={() => onKey(d)} className="text-[1.9vmin]">
            {d}
          </Key>
        ))}
      </div>

      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-[1vmin]">
          {i === 3 && (
            <Key onClick={() => onKey("@")} accent className="grow-[1.4]">
              @
            </Key>
          )}
          {row.map((char) => (
            <Key key={char} onClick={() => onKey(char)}>
              {char}
            </Key>
          ))}
          {i === 3 && (
            <Key onClick={onBackspace} className="grow-[1.4]">
              ⌫
            </Key>
          )}
        </div>
      ))}

      <div className="flex gap-[1vmin]">
        <Key onClick={onClear} className="grow-[1.2] text-[2vmin] uppercase tracking-widest">
          {clearLabel}
        </Key>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex min-h-[7.4vmin] grow-[3] items-center justify-center rounded-xl border-2 border-white/25 bg-gradient-to-b from-cb-red-hot via-cb-red to-cb-red-deep font-[family-name:var(--font-display)] text-[2.8vmin] uppercase tracking-wide text-white shadow-[0_0_30px_-6px_rgb(227_30_36_/_0.9)] transition active:scale-95 disabled:opacity-35 disabled:shadow-none"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

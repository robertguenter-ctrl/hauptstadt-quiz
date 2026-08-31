"use client";

import { ANSWER_MODE_LABELS, type AnswerMode } from "@/lib/game/types";
import { cn } from "@/lib/utils";

interface AnswerModeSelectorProps {
  mode: AnswerMode;
  onChange: (mode: AnswerMode) => void;
  size?: "default" | "large";
}

export function AnswerModeSelector({ mode, onChange, size = "default" }: AnswerModeSelectorProps) {
  const large = size === "large";

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className={cn(
          "font-semibold uppercase tracking-widest text-white/50",
          large ? "text-base" : "text-sm",
        )}
      >
        Antwortmodus
      </p>
      <div className="flex gap-3">
        {(["tiles", "voice"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-xl font-bold transition-colors",
              large ? "px-8 py-4 text-2xl" : "px-6 py-3 text-lg",
              mode === option
                ? option === "voice"
                  ? "bg-violet-500 text-white ring-4 ring-violet-300/50"
                  : "bg-amber-500 text-black ring-4 ring-amber-300/50"
                : "bg-white/10 text-white hover:bg-white/20",
            )}
          >
            {ANSWER_MODE_LABELS[option]}
          </button>
        ))}
      </div>
      <p className={cn("max-w-md text-center text-white/50", large ? "text-lg" : "text-sm")}>
        {mode === "voice"
          ? "Antworten per Sprache (TALK-Button) — ohne Flaggen-Auswahl."
          : "Antworten per Touchpad auf dem Handy (9 Kacheln)."}
      </p>
    </div>
  );
}

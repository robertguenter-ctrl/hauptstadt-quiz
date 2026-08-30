import { cn } from "@/lib/utils";
import type { GamePhase, Question } from "@/lib/game/types";
import { QUESTION_TYPE_LABELS } from "@/lib/game/types";
import { FlagImage } from "@/components/game/flag-image";

interface TileGridProps {
  question: Question;
  selectedIndex: number;
  showCorrect?: boolean;
}

export function TileGrid({ question, selectedIndex, showCorrect = false }: TileGridProps) {
  const showFlags = question.type === "country_to_flag";

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4">
      {question.tiles.map((tile, index) => {
        const isSelected = index === selectedIndex;
        const isCorrect = tile.isCorrect;
        const highlightCorrect = showCorrect && isCorrect;
        const highlightWrong = showCorrect && isSelected && !isCorrect;

        return (
          <button
            key={tile.id}
            type="button"
            className={cn(
              "flex min-h-[7rem] items-center justify-center rounded-2xl border-4 px-4 py-3 text-center text-2xl font-semibold transition-all",
              "bg-white/10 border-white/20",
              isSelected && !showCorrect && "scale-105 border-amber-400 bg-amber-400/20 ring-4 ring-amber-400/50",
              highlightCorrect && "border-green-400 bg-green-500/30",
              highlightWrong && "border-red-400 bg-red-500/30",
            )}
          >
            {showFlags && tile.iso_code ? (
              <FlagImage isoCode={tile.iso_code} size="tile" alt={tile.label} />
            ) : (
              <span className="leading-tight">{tile.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface QuestionDisplayProps {
  question: Question;
  phase: GamePhase;
  countdown: number;
}

export function QuestionDisplay({ question, phase, countdown }: QuestionDisplayProps) {
  const isCountdown = phase === "countdown";
  const categoryLabel = QUESTION_TYPE_LABELS[question.type];

  if (isCountdown) {
    return (
      <div className="flex flex-col items-center gap-8 text-center">
        <p className="max-w-3xl text-4xl font-medium text-amber-300">{categoryLabel}</p>
        <div className="flex h-48 w-full max-w-xl items-center justify-center rounded-3xl border-4 border-amber-400/40 bg-amber-400/10">
          <span className="text-[10rem] font-black tabular-nums leading-none text-amber-300">
            {countdown}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-2xl font-medium text-white/60">{categoryLabel}</p>

      {question.displayFlag && question.type === "flag_to_country" && (
        <FlagImage isoCode={question.displayFlag} size="lg" alt="Flagge" />
      )}

      {question.displayText && (
        <div className="flex items-center gap-6">
          {question.displayFlag && question.type === "country_to_capital" && (
            <FlagImage isoCode={question.displayFlag} size="sm" alt="" />
          )}
          <h2 className="text-6xl font-bold tracking-tight">{question.displayText}</h2>
        </div>
      )}
    </div>
  );
}

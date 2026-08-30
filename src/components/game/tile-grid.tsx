import { cn, flagUrl } from "@/lib/utils";
import type { Question } from "@/lib/game/types";
import { FlagImage } from "@/components/game/scoreboard";

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
              <img
                src={flagUrl(tile.iso_code, 160)}
                alt={tile.label}
                className="h-16 w-28 rounded-lg object-cover"
              />
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
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-3xl font-medium text-amber-300">{question.prompt}</p>

      {question.displayFlag && question.type === "flag_to_country" && (
        <FlagImage isoCode={question.displayFlag} size="lg" />
      )}

      {question.displayText && (
        <div className="flex items-center gap-6">
          {question.displayFlag && question.type === "country_to_capital" && (
            <FlagImage isoCode={question.displayFlag} size="sm" />
          )}
          <h2 className="text-6xl font-bold tracking-tight">{question.displayText}</h2>
        </div>
      )}
    </div>
  );
}

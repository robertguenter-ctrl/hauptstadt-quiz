import { cn } from "@/lib/utils";
import { PLAYER_COLORS, type GamePhase, type Question } from "@/lib/game/types";
import { QUESTION_TYPE_LABELS } from "@/lib/game/types";
import { FlagImage } from "@/components/game/flag-image";

interface ActivePlayerBannerProps {
  playerSlot: number;
  playerName: string;
  phase: GamePhase;
  timer?: number;
}

export function ActivePlayerBanner({
  playerSlot,
  playerName,
  phase,
  timer,
}: ActivePlayerBannerProps) {
  const colors = PLAYER_COLORS[playerSlot];

  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border-4 border-transparent bg-white/5 px-8 py-5 text-center",
        "ring-4",
        colors.ring,
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
        {phase === "answering" ? "Am Zug" : "Antwort von"}
      </p>
      <p className={cn("text-6xl font-black", colors.text)}>
        {playerName}
      </p>
      {phase === "answering" && timer !== undefined && (
        <p className="mt-1 text-3xl font-bold tabular-nums text-white/80">{timer}s</p>
      )}
    </div>
  );
}

interface TileGridProps {
  question: Question;
  selectedIndex: number;
  revealCorrect?: boolean;
  showWrongSelection?: boolean;
}

export function TileGrid({
  question,
  selectedIndex,
  revealCorrect = false,
  showWrongSelection = false,
}: TileGridProps) {
  const showFlags = question.type === "country_to_flag";

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4">
      {question.tiles.map((tile, index) => {
        const isSelected = index === selectedIndex;
        const isCorrect = tile.isCorrect;
        const highlightCorrect = revealCorrect && isCorrect;
        const highlightWrong = showWrongSelection && isSelected && !isCorrect;

        return (
          <button
            key={tile.id}
            type="button"
            className={cn(
              "flex min-h-[7rem] items-center justify-center rounded-2xl border-4 px-4 py-3 text-center text-2xl font-semibold transition-all",
              "bg-white/10 border-white/20",
              isSelected && !revealCorrect && !showWrongSelection && "scale-105 border-amber-400 bg-amber-400/20 ring-4 ring-amber-400/50",
              highlightCorrect && "animate-correct-blink border-green-400 bg-green-500/30",
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

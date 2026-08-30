import { cn } from "@/lib/utils";
import { PLAYER_COLORS, type Player } from "@/lib/game/types";

interface ScoreboardProps {
  players: Player[];
  activeSlot?: number | null;
}

export function Scoreboard({ players, activeSlot }: ScoreboardProps) {
  return (
    <div className="flex justify-center gap-4">
      {players.map((player) => {
        const colors = PLAYER_COLORS[player.slot];
        const isActive = activeSlot === player.slot;

        return (
          <div
            key={player.slot}
            className={cn(
              "min-w-[10rem] rounded-2xl border-2 px-6 py-4 text-center transition-all",
              player.joined ? "border-white/20 bg-white/5" : "border-white/10 bg-white/5 opacity-40",
              isActive && `ring-4 ${colors.ring}`,
            )}
          >
            <div className={cn("text-lg font-semibold", colors.text)}>
              {player.joined ? player.name : colors.name}
            </div>
            <div className="mt-1 text-4xl font-bold tabular-nums">{player.joined ? player.score : "—"}</div>
            {!player.joined && <div className="mt-1 text-sm text-white/50">Wartet …</div>}
          </div>
        );
      })}
    </div>
  );
}

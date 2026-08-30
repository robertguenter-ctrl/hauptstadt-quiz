"use client";

import { useCallback, useRef } from "react";
import type { Question } from "@/lib/game/types";
import { moveTileIndex } from "@/lib/game/tile-nav";
import { FlagImage } from "@/components/game/flag-image";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 36;
const NAV_COOLDOWN_MS = 130;
const DOUBLE_TAP_MS = 350;
const TAP_MOVE_TOLERANCE = 12;

interface AnswerTouchpadProps {
  question: Question;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onConfirm: () => void;
  accentClass: string;
}

export function AnswerTouchpad({
  question,
  selectedIndex,
  onSelect,
  onConfirm,
  accentClass,
}: AnswerTouchpadProps) {
  const anchorRef = useRef({ x: 0, y: 0 });
  const lastNavAtRef = useRef(0);
  const lastTapAtRef = useRef(0);
  const movedRef = useRef(false);

  const selectedTile = question.tiles[selectedIndex];
  const showFlags = question.type === "country_to_flag";

  const handleTouchStart = useCallback((clientX: number, clientY: number) => {
    anchorRef.current = { x: clientX, y: clientY };
    movedRef.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - anchorRef.current.x;
      const dy = clientY - anchorRef.current.y;

      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

      movedRef.current = true;

      if (Date.now() - lastNavAtRef.current < NAV_COOLDOWN_MS) return;

      const direction =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "down"
            : "up";

      const next = moveTileIndex(selectedIndex, direction);
      if (next !== selectedIndex) {
        onSelect(next);
      }

      lastNavAtRef.current = Date.now();
      anchorRef.current = { x: clientX, y: clientY };
    },
    [onSelect, selectedIndex],
  );

  const handleTouchEnd = useCallback(
    (clientX: number, clientY: number) => {
      const dx = Math.abs(clientX - anchorRef.current.x);
      const dy = Math.abs(clientY - anchorRef.current.y);
      const stayedStill = !movedRef.current && dx < TAP_MOVE_TOLERANCE && dy < TAP_MOVE_TOLERANCE;

      if (!stayedStill) return;

      const now = Date.now();
      if (now - lastTapAtRef.current < DOUBLE_TAP_MS) {
        lastTapAtRef.current = 0;
        onConfirm();
      } else {
        lastTapAtRef.current = now;
      }
    },
    [onConfirm],
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div
        className="relative flex flex-1 touch-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/25 bg-white/5 p-6"
        style={{ touchAction: "none" }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) handleTouchStart(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          if (t) handleTouchMove(t.clientX, t.clientY);
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0];
          if (t) handleTouchEnd(t.clientX, t.clientY);
        }}
      >
        <p className="pointer-events-none text-center text-lg text-white/50">
          Wischen zum Navigieren
        </p>
        <p className="pointer-events-none mt-2 text-center text-sm text-white/35">
          Doppeltippen zum Bestätigen
        </p>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-10 w-10 rounded-lg border border-white/30",
                  i === selectedIndex && "border-amber-400 bg-amber-400/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border-2 border-amber-400/50 bg-amber-400/10 px-4 py-5 text-center",
          accentClass,
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Deine Auswahl</p>
        <div className="mt-2 flex min-h-[3rem] items-center justify-center">
          {showFlags && selectedTile?.iso_code ? (
            <FlagImage isoCode={selectedTile.iso_code} size="tile" alt={selectedTile.label} />
          ) : (
            <p className="text-2xl font-bold text-white">{selectedTile?.label ?? "—"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

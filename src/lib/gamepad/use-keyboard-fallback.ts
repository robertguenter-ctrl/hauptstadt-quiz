"use client";

import { useEffect } from "react";
import type { NavDirection } from "@/lib/gamepad/use-gamepads";

export interface KeyboardAction {
  type: "join" | "buzz" | "navigate" | "confirm";
  direction?: NavDirection;
}

export function useKeyboardFallback(enabled: boolean, onAction: (action: KeyboardAction) => void) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onAction({ type: "confirm" });
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        onAction({ type: "navigate", direction: "up" });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onAction({ type: "navigate", direction: "down" });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onAction({ type: "navigate", direction: "left" });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onAction({ type: "navigate", direction: "right" });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onAction]);
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GamepadSnapshot {
  index: number;
  id: string;
  connected: boolean;
  buttons: boolean[];
  axes: number[];
}

const FACE_BUTTONS = [0, 1, 2, 3];
const DPAD_BUTTONS = [12, 13, 14, 15];
const STICK_DEADZONE = 0.5;

function readGamepads(): GamepadSnapshot[] {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return [];

  return Array.from(navigator.getGamepads())
    .filter((pad): pad is Gamepad => pad !== null)
    .map((pad) => ({
      index: pad.index,
      id: pad.id,
      connected: pad.connected,
      buttons: pad.buttons.map((b) => b.pressed),
      axes: [...pad.axes],
    }));
}

export function useGamepads() {
  const [gamepads, setGamepads] = useState<GamepadSnapshot[]>([]);
  const prevButtonsRef = useRef<Map<number, boolean[]>>(new Map());

  useEffect(() => {
    const update = () => setGamepads(readGamepads());

    window.addEventListener("gamepadconnected", update);
    window.addEventListener("gamepaddisconnected", update);
    update();

    const interval = window.setInterval(update, 16);
    return () => {
      window.removeEventListener("gamepadconnected", update);
      window.removeEventListener("gamepaddisconnected", update);
      window.clearInterval(interval);
    };
  }, []);

  const wasButtonPressed = useCallback(
    (gamepadIndex: number, buttonIndex: number): boolean => {
      const pad = gamepads.find((g) => g.index === gamepadIndex);
      if (!pad) return false;

      const prev = prevButtonsRef.current.get(gamepadIndex) ?? [];
      const wasPressed = prev[buttonIndex] ?? false;
      const isPressed = pad.buttons[buttonIndex] ?? false;

      return isPressed && !wasPressed;
    },
    [gamepads],
  );

  const wasAnyFaceButtonPressed = useCallback(
    (gamepadIndex: number): boolean =>
      FACE_BUTTONS.some((btn) => wasButtonPressed(gamepadIndex, btn)),
    [wasButtonPressed],
  );

  const wasAnyBuzzerPressed = useCallback(
    (gamepadIndex: number): boolean => {
      const pad = gamepads.find((g) => g.index === gamepadIndex);
      if (!pad) return false;

      const buzzerButtons = [...FACE_BUTTONS, ...DPAD_BUTTONS];
      return buzzerButtons.some((btn) => wasButtonPressed(gamepadIndex, btn));
    },
    [gamepads, wasButtonPressed],
  );

  useEffect(() => {
    const next = new Map<number, boolean[]>();
    for (const pad of gamepads) {
      next.set(pad.index, [...pad.buttons]);
    }
    prevButtonsRef.current = next;
  }, [gamepads]);

  return {
    gamepads,
    wasButtonPressed,
    wasAnyFaceButtonPressed,
    wasAnyBuzzerPressed,
  };
}

export type NavDirection = "up" | "down" | "left" | "right";

export function getNavigationDirection(
  pad: GamepadSnapshot,
  prevAxes: number[] | undefined,
): NavDirection | null {
  if (pad.buttons[12]) return "up";
  if (pad.buttons[13]) return "down";
  if (pad.buttons[14]) return "left";
  if (pad.buttons[15]) return "right";

  const lx = pad.axes[0] ?? 0;
  const ly = pad.axes[1] ?? 0;
  const plx = prevAxes?.[0] ?? 0;
  const ply = prevAxes?.[1] ?? 0;

  if (ly < -STICK_DEADZONE && ply >= -STICK_DEADZONE) return "up";
  if (ly > STICK_DEADZONE && ply <= STICK_DEADZONE) return "down";
  if (lx < -STICK_DEADZONE && plx >= -STICK_DEADZONE) return "left";
  if (lx > STICK_DEADZONE && plx <= STICK_DEADZONE) return "right";

  return null;
}

export function moveTileIndex(
  current: number,
  direction: NavDirection,
  columns = 3,
  total = 9,
): number {
  const row = Math.floor(current / columns);
  const col = current % columns;
  const maxRow = Math.ceil(total / columns) - 1;

  let nextRow = row;
  let nextCol = col;

  switch (direction) {
    case "up":
      nextRow = Math.max(0, row - 1);
      break;
    case "down":
      nextRow = Math.min(maxRow, row + 1);
      break;
    case "left":
      nextCol = Math.max(0, col - 1);
      break;
    case "right":
      nextCol = Math.min(columns - 1, col + 1);
      break;
  }

  const next = nextRow * columns + nextCol;
  return Math.min(next, total - 1);
}

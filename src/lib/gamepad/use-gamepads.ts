"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GamepadSnapshot {
  index: number;
  id: string;
  connected: boolean;
  buttons: boolean[];
  axes: number[];
}

export interface GamepadPress {
  gamepadIndex: number;
  buttonIndex: number;
}

export interface RawGamepadSlot {
  index: number;
  present: boolean;
  connected: boolean;
  id: string;
}

const STICK_DEADZONE = 0.5;

function snapshotFromPad(pad: Gamepad): GamepadSnapshot {
  return {
    index: pad.index,
    id: pad.id,
    connected: pad.connected,
    buttons: pad.buttons.map((b) => b.pressed || b.value > 0.5),
    axes: [...pad.axes],
  };
}

export function getRawGamepadSlots(): RawGamepadSlot[] {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return [];

  return Array.from(navigator.getGamepads()).map((pad, index) => {
    if (!pad) {
      return { index, present: false, connected: false, id: "—" };
    }
    return {
      index: pad.index,
      present: true,
      connected: pad.connected,
      id: pad.id,
    };
  });
}

function readGamepads(): GamepadSnapshot[] {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return [];

  return Array.from(navigator.getGamepads())
    .filter((pad): pad is Gamepad => pad !== null)
    .map(snapshotFromPad);
}

export function useGamepads() {
  const [gamepads, setGamepads] = useState<GamepadSnapshot[]>([]);
  const [rawSlots, setRawSlots] = useState<RawGamepadSlot[]>([]);
  const [userActivated, setUserActivated] = useState(false);
  const [lastConnectEvent, setLastConnectEvent] = useState<string | null>(null);
  const prevButtonsRef = useRef<Map<number, boolean[]>>(new Map());
  const pressQueueRef = useRef<GamepadPress[]>([]);
  const rafRef = useRef<number | null>(null);

  const scan = useCallback(() => {
    const all = readGamepads();
    const connected = all.filter((p) => p.connected);
    setGamepads(connected);
    setRawSlots(getRawGamepadSlots());
    return connected;
  }, []);

  const poll = useCallback(() => {
    const pads = scan();

    for (const pad of pads) {
      const prev = prevButtonsRef.current.get(pad.index) ?? [];
      for (let i = 0; i < pad.buttons.length; i += 1) {
        const wasPressed = prev[i] ?? false;
        const isPressed = pad.buttons[i] ?? false;
        if (isPressed && !wasPressed) {
          pressQueueRef.current.push({ gamepadIndex: pad.index, buttonIndex: i });
        }
      }
      prevButtonsRef.current.set(pad.index, [...pad.buttons]);
    }

    rafRef.current = window.requestAnimationFrame(poll);
  }, [scan]);

  useEffect(() => {
    const onConnected = (e: Event) => {
      const ev = e as GamepadEvent;
      setLastConnectEvent(`${ev.type}: ${ev.gamepad.id}`);
      scan();
    };

    const onWake = () => scan();

    window.addEventListener("gamepadconnected", onConnected);
    window.addEventListener("gamepaddisconnected", onConnected);
    window.addEventListener("focus", onWake);
    window.addEventListener("pointerdown", onWake);
    window.addEventListener("keydown", onWake);
    document.addEventListener("visibilitychange", onWake);
    rafRef.current = window.requestAnimationFrame(poll);

    return () => {
      window.removeEventListener("gamepadconnected", onConnected);
      window.removeEventListener("gamepaddisconnected", onConnected);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("pointerdown", onWake);
      window.removeEventListener("keydown", onWake);
      document.removeEventListener("visibilitychange", onWake);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [poll, scan]);

  const activate = useCallback(() => {
    setUserActivated(true);
    window.focus();
    scan();
  }, [scan]);

  const consumePresses = useCallback((): GamepadPress[] => {
    if (pressQueueRef.current.length === 0) return [];
    const presses = [...pressQueueRef.current];
    pressQueueRef.current = [];
    return presses;
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

  const wasAnyButtonPressed = useCallback((gamepadIndex: number): boolean => {
    const presses = pressQueueRef.current;
    return presses.some((p) => p.gamepadIndex === gamepadIndex);
  }, []);

  return {
    gamepads,
    rawSlots,
    userActivated,
    lastConnectEvent,
    activate,
    scan,
    consumePresses,
    wasButtonPressed,
    wasAnyButtonPressed,
    wasAnyBuzzerPressed: wasAnyButtonPressed,
    supportsGamepad: typeof navigator !== "undefined" && !!navigator.getGamepads,
    isChrome:
      typeof navigator !== "undefined" &&
      /Chrome\//.test(navigator.userAgent) &&
      !/Edg\//.test(navigator.userAgent),
    isSafari:
      typeof navigator !== "undefined" &&
      /Safari\//.test(navigator.userAgent) &&
      !/Chrome\//.test(navigator.userAgent),
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

  const hatX = pad.axes[6] ?? 0;
  const hatY = pad.axes[7] ?? 0;
  const prevHatX = prevAxes?.[6] ?? 0;
  const prevHatY = prevAxes?.[7] ?? 0;

  if (hatY < -0.5 && prevHatY >= -0.5) return "up";
  if (hatY > 0.5 && prevHatY <= 0.5) return "down";
  if (hatX < -0.5 && prevHatX >= -0.5) return "left";
  if (hatX > 0.5 && prevHatX <= 0.5) return "right";

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

export function isConfirmButton(buttonIndex: number): boolean {
  return [0, 1, 2, 3].includes(buttonIndex);
}

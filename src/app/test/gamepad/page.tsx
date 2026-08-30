"use client";

import { useEffect, useState } from "react";
import {
  GamepadActivateOverlay,
  GamepadTroubleshooting,
  WaitingForGamepadBanner,
} from "@/components/game/gamepad-activate-overlay";
import { useGamepads } from "@/lib/gamepad/use-gamepads";

export default function GamepadTestPage() {
  const {
    gamepads,
    rawSlots,
    userActivated,
    lastConnectEvent,
    activate,
    scan,
    supportsGamepad,
    isChrome,
    isSafari,
  } = useGamepads();
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: GamepadEvent) => {
      setLog((prev) =>
        [
          `${e.type}: ${e.gamepad.id} (Index ${e.gamepad.index}, ${e.gamepad.buttons.length} buttons)`,
          ...prev,
        ].slice(0, 30),
      );
    };
    window.addEventListener("gamepadconnected", handler);
    window.addEventListener("gamepaddisconnected", handler);
    return () => {
      window.removeEventListener("gamepadconnected", handler);
      window.removeEventListener("gamepaddisconnected", handler);
    };
  }, []);

  const waitingForPress = userActivated && gamepads.length === 0;

  return (
    <>
      <GamepadActivateOverlay visible={!userActivated} onActivate={activate} />
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="mb-6 text-4xl font-bold">Controller-Test</h1>

        <WaitingForGamepadBanner visible={waitingForPress} />

        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 p-4">
          <p>Gamepad API: {supportsGamepad ? "✅ verfügbar" : "❌ nicht verfügbar"}</p>
          <p>Seite aktiviert: {userActivated ? "✅ ja" : "⏳ noch nicht — oben klicken"}</p>
          <p>Verbundene Controller: {gamepads.length}</p>
          {lastConnectEvent && <p className="text-sm text-green-400">Letztes Event: {lastConnectEvent}</p>}
        </div>

        <button
          type="button"
          onClick={() => scan()}
          className="mb-6 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          Erneut scannen
        </button>

        <div className="mb-6 rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm">
          <p className="mb-2 text-white/50">Rohdaten navigator.getGamepads() (4 Slots):</p>
          {rawSlots.map((slot) => (
            <p key={slot.index}>
              Slot {slot.index}:{" "}
              {slot.present
                ? `${slot.connected ? "✅ verbunden" : "⚠️ vorhanden, nicht verbunden"} — ${slot.id}`
                : "leer (Knopf drücken!)"}
            </p>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {gamepads.map((pad) => (
            <div key={pad.index} className="rounded-xl border border-white/20 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Controller {pad.index + 1}</h2>
              <p className="break-all text-sm text-white/50">{pad.id}</p>
              <p className="mt-2 text-sm text-white/60">
                {pad.buttons.length} Knöpfe · {pad.axes.length} Achsen
              </p>
              <p className="mt-4 font-mono text-sm">
                Gedrückt:{" "}
                {pad.buttons.map((b, i) => (b ? i : null)).filter((v) => v !== null).join(", ") || "—"}
              </p>
              <p className="font-mono text-sm">
                Achsen: {pad.axes.map((a) => a.toFixed(2)).join(", ")}
              </p>
              <div className="mt-4 flex flex-wrap gap-1">
                {pad.buttons.map((pressed, i) => (
                  <span
                    key={i}
                    className={`rounded px-2 py-1 text-xs ${pressed ? "bg-green-500 text-black" : "bg-white/10"}`}
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {waitingForPress && (
          <p className="mt-6 text-amber-400">
            Alle Slots leer? Controller-Knopf drücken, während dieses Chrome-Fenster im Vordergrund ist.
          </p>
        )}

        <GamepadTroubleshooting isSafari={isSafari} isChrome={isChrome} />

        <div className="mt-8">
          <h3 className="mb-2 text-lg font-semibold">Ereignis-Log</h3>
          <ul className="space-y-1 font-mono text-sm text-white/60">
            {log.length === 0 && <li>— noch keine gamepadconnected-Events —</li>}
            {log.map((entry, i) => (
              <li key={`${entry}-${i}`}>{entry}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

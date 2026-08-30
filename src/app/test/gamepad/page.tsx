"use client";

import { useEffect, useState } from "react";
import { useGamepads } from "@/lib/gamepad/use-gamepads";

export default function GamepadTestPage() {
  const { gamepads } = useGamepads();
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: GamepadEvent) => {
      setLog((prev) => [`${e.type}: ${e.gamepad.id} (Index ${e.gamepad.index})`, ...prev].slice(0, 20));
    };
    window.addEventListener("gamepadconnected", handler);
    window.addEventListener("gamepaddisconnected", handler);
    return () => {
      window.removeEventListener("gamepadconnected", handler);
      window.removeEventListener("gamepaddisconnected", handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-6 text-4xl font-bold">Controller-Test</h1>
      <p className="mb-4 text-white/70">Drücke Knöpfe — ideal zum Testen am Android TV.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {gamepads.map((pad) => (
          <div key={pad.index} className="rounded-xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Controller {pad.index + 1}</h2>
            <p className="text-sm text-white/50">{pad.id}</p>
            <p className="mt-4 font-mono text-sm">
              Knöpfe: {pad.buttons.map((b, i) => (b ? i : null)).filter((v) => v !== null).join(", ") || "—"}
            </p>
            <p className="font-mono text-sm">
              Achsen: {pad.axes.map((a) => a.toFixed(2)).join(", ")}
            </p>
          </div>
        ))}
      </div>

      {gamepads.length === 0 && (
        <p className="text-amber-400">Kein Controller erkannt. Einmal einen Knopf drücken.</p>
      )}

      <div className="mt-8">
        <h3 className="mb-2 text-lg font-semibold">Ereignis-Log</h3>
        <ul className="space-y-1 font-mono text-sm text-white/60">
          {log.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

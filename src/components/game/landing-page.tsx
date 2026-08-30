"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { createRoom } from "@/lib/room/room-api";
import { generateRoomCode } from "@/lib/room/codes";

export function LandingPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startHost() {
    setLoading(true);
    setError(null);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase ist nicht konfiguriert.");
      setLoading(false);
      return;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateRoomCode();
      const ok = await createRoom(supabase, code);
      if (ok) {
        router.push(`/host/${code}`);
        return;
      }
    }

    setError("Spielraum konnte nicht erstellt werden.");
    setLoading(false);
  }

  function goJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      setError("Bitte einen 4-stelligen Code eingeben.");
      return;
    }
    router.push(`/play/${code}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-950 px-6 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">Hauptstadt-Quiz</h1>
        <p className="mt-3 text-lg text-white/70">TV + Handy-Buzzer</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <button
          type="button"
          onClick={() => void startHost()}
          disabled={loading}
          className="rounded-xl bg-amber-500 py-5 text-xl font-bold text-black disabled:opacity-50"
        >
          {loading ? "Erstelle Spiel …" : "Spiel hosten (TV)"}
        </button>

        <div className="rounded-xl border border-white/20 bg-white/5 p-6">
          <p className="mb-3 text-center font-semibold text-white/80">Als Spieler beitreten</p>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Raumcode"
            maxLength={4}
            className="mb-3 w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={goJoin}
            className="w-full rounded-lg bg-white/15 py-3 font-semibold hover:bg-white/25"
          >
            Beitreten
          </button>
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <p className="max-w-sm text-center text-sm text-white/40">
        Host: App auf dem TV öffnen und Spiel starten. Spieler scannen den QR-Code oder geben den Raumcode ein.
      </p>
    </div>
  );
}

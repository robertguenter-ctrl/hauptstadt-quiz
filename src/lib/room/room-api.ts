import type { SupabaseClient } from "@supabase/supabase-js";
import { createInitialState, parseGameState, serializeGameState } from "@/lib/game/engine";
import type { GameState } from "@/lib/game/types";

export interface RoomPlayerRow {
  id: string;
  room_code: string;
  slot: number;
  name: string;
}

export async function createRoom(supabase: SupabaseClient, code: string): Promise<boolean> {
  const state = serializeGameState(createInitialState());
  const { error } = await supabase.from("game_rooms").insert({ code, state });
  return !error;
}

export async function fetchRoomState(
  supabase: SupabaseClient,
  code: string,
): Promise<GameState | null> {
  const { data, error } = await supabase.from("game_rooms").select("state").eq("code", code).single();
  if (error || !data) return null;
  return parseGameState(data.state);
}

export async function saveRoomState(
  supabase: SupabaseClient,
  code: string,
  state: GameState,
): Promise<void> {
  await supabase
    .from("game_rooms")
    .update({ state: serializeGameState(state) })
    .eq("code", code);
}

export async function fetchRoomPlayers(
  supabase: SupabaseClient,
  code: string,
): Promise<RoomPlayerRow[]> {
  const { data } = await supabase
    .from("room_players")
    .select("id, room_code, slot, name")
    .eq("room_code", code)
    .order("slot");
  return (data ?? []) as RoomPlayerRow[];
}

export type JoinRoomResult =
  | { ok: true; playerId: string; slot: number; name: string }
  | { ok: false; error: string };

export async function joinRoom(
  supabase: SupabaseClient,
  code: string,
  name: string,
): Promise<JoinRoomResult> {
  const trimmed = name.trim();
  if (trimmed.length < 1) return { ok: false, error: "Bitte einen Namen eingeben." };

  const { data: room } = await supabase.from("game_rooms").select("code").eq("code", code).single();
  if (!room) return { ok: false, error: "Spielraum nicht gefunden." };

  const existing = await fetchRoomPlayers(supabase, code);
  if (existing.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: "Dieser Name ist bereits vergeben." };
  }

  const usedSlots = new Set(existing.map((p) => p.slot));
  const slot = [0, 1, 2, 3].find((s) => !usedSlots.has(s));
  if (slot === undefined) return { ok: false, error: "Alle 4 Plätze sind belegt." };

  const { data, error } = await supabase
    .from("room_players")
    .insert({ room_code: code, slot, name: trimmed })
    .select("id, slot, name")
    .single();

  if (error || !data) return { ok: false, error: "Beitritt fehlgeschlagen." };

  return { ok: true, playerId: data.id, slot: data.slot, name: data.name };
}

export function roomChannelName(code: string): string {
  return `room:${code}`;
}

export type PlayerActionPayload =
  | { type: "BUZZ" }
  | { type: "SELECT_TILE"; index: number }
  | { type: "CONFIRM_ANSWER" };

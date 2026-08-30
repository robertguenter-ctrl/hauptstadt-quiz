"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { GameAction } from "@/lib/game/engine";
import { getPlayerSlotById } from "@/lib/game/engine";
import {
  fetchRoomPlayers,
  joinRoom,
  roomChannelName,
  saveRoomState,
  type PlayerActionPayload,
} from "@/lib/room/room-api";
import type { GameState } from "@/lib/game/types";

const PLAYER_STORAGE_KEY = "hauptstadt-quiz-player";

export interface StoredPlayer {
  roomCode: string;
  playerId: string;
  slot: number;
  name: string;
}

export function loadStoredPlayer(roomCode: string): StoredPlayer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPlayer;
    if (parsed.roomCode !== roomCode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storePlayer(player: StoredPlayer): void {
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
}

export function useRoomPlayer(roomCode: string) {
  const [player, setPlayer] = useState<StoredPlayer | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const stored = loadStoredPlayer(roomCode);
    if (stored) setPlayer(stored);
  }, [roomCode]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase nicht konfiguriert.");
      return;
    }

    supabase
      .from("game_rooms")
      .select("state")
      .eq("code", roomCode)
      .single()
      .then(({ data }) => {
        if (data?.state) setGameState(data.state as GameState);
      });

    const channel = supabase
      .channel(`state:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_rooms", filter: `code=eq.${roomCode}` },
        (payload) => {
          const next = payload.new as { state?: GameState };
          if (next.state) setGameState(next.state);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomCode]);

  const sendAction = useCallback(
    async (action: PlayerActionPayload) => {
      if (!player) return;
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const channel = supabase.channel(roomChannelName(roomCode));
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "player_action",
        payload: { playerId: player.playerId, action },
      });
      void supabase.removeChannel(channel);
    },
    [player, roomCode],
  );

  const join = useCallback(
    async (name: string) => {
      setJoining(true);
      setError(null);
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Supabase nicht konfiguriert.");
        setJoining(false);
        return false;
      }

      const result = await joinRoom(supabase, roomCode, name);
      setJoining(false);

      if (!result.ok) {
        setError(result.error);
        return false;
      }

      const stored: StoredPlayer = {
        roomCode,
        playerId: result.playerId,
        slot: result.slot,
        name: result.name,
      };
      storePlayer(stored);
      setPlayer(stored);
      return true;
    },
    [roomCode],
  );

  return {
    player,
    gameState,
    error,
    joining,
    join,
    buzz: () => sendAction({ type: "BUZZ" }),
    selectTile: (index: number) => sendAction({ type: "SELECT_TILE", index }),
    confirmAnswer: () => sendAction({ type: "CONFIRM_ANSWER" }),
    startGame: () => sendAction({ type: "START_GAME" }),
  };
}

export function useRoomHost(roomCode: string, state: GameState, dispatch: (a: GameAction) => void) {
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    void saveRoomState(supabase, roomCode, state);
  }, [roomCode, state]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    fetchRoomPlayers(supabase, roomCode).then((players) => {
      for (const p of players) {
        dispatch({
          type: "JOIN_PLAYER",
          slot: p.slot,
          name: p.name,
          playerId: p.id,
        });
      }
    });

    const actionChannel = supabase
      .channel(roomChannelName(roomCode))
      .on("broadcast", { event: "player_action" }, ({ payload }) => {
        const data = payload as { playerId?: string; action?: PlayerActionPayload };
        if (!data.playerId || !data.action) return;

        const slot = getPlayerSlotById(stateRef.current, data.playerId);
        if (slot === null) return;

        switch (data.action.type) {
          case "BUZZ":
            dispatch({ type: "BUZZ", playerSlot: slot });
            break;
          case "SELECT_TILE":
            if (stateRef.current.activePlayerSlot === slot) {
              dispatch({ type: "SELECT_TILE", index: data.action.index });
            }
            break;
          case "CONFIRM_ANSWER":
            if (stateRef.current.activePlayerSlot === slot) {
              dispatch({ type: "CONFIRM_ANSWER" });
            }
            break;
          case "START_GAME":
            if (stateRef.current.phase === "lobby" && stateRef.current.players[slot]?.joined) {
              dispatch({ type: "START_GAME" });
            }
            break;
        }
      })
      .subscribe();

    const playersChannel = supabase
      .channel(`players:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_players", filter: `room_code=eq.${roomCode}` },
        (payload) => {
          const row = payload.new as { id: string; slot: number; name: string };
          dispatch({
            type: "JOIN_PLAYER",
            slot: row.slot,
            name: row.name,
            playerId: row.id,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(actionChannel);
      void supabase.removeChannel(playersChannel);
    };
  }, [roomCode, dispatch]);
}

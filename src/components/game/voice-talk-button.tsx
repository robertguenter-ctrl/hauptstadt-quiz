"use client";

import { useRef } from "react";
import { useSpeechRecognition } from "@/lib/audio/use-speech-recognition";
import { cn } from "@/lib/utils";

interface VoiceTalkButtonProps {
  disabled?: boolean;
  onAnswer: (transcript: string, alternatives: string[]) => void;
  accentClass?: string;
}

export function VoiceTalkButton({ disabled = false, onAnswer, accentClass }: VoiceTalkButtonProps) {
  const { listening, supported, start, stop } = useSpeechRecognition();
  const submittedRef = useRef(false);

  if (!supported) {
    return (
      <p className="max-w-sm text-center text-red-400">
        Spracherkennung wird in diesem Browser nicht unterstützt. Bitte Chrome auf Android verwenden.
      </p>
    );
  }

  function handleResult(transcript: string, alternatives: string[]) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onAnswer(transcript, alternatives);
  }

  function handlePointerDown() {
    if (disabled || listening) return;
    submittedRef.current = false;
    start(({ transcript, alternatives }) => {
      handleResult(transcript, alternatives);
    });
  }

  function handlePointerUp() {
    if (!listening) return;
    stop();
    window.setTimeout(() => {
      if (!submittedRef.current) {
        handleResult("", []);
      }
    }, 400);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-white/60">
        {listening ? "Sprich jetzt …" : "Gedrückt halten und antworten"}
      </p>
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "flex h-64 w-64 touch-none select-none items-center justify-center rounded-full text-4xl font-black shadow-lg active:scale-95 disabled:opacity-40",
          listening
            ? "animate-pulse bg-blue-500 shadow-blue-900/50"
            : "bg-violet-600 shadow-violet-900/50",
        )}
      >
        TALK
      </button>
      {accentClass && listening && (
        <p className={cn("text-lg font-semibold", accentClass)}>Mikrofon aktiv</p>
      )}
    </div>
  );
}

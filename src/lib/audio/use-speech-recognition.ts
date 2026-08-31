"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechResult {
  transcript: string;
  alternatives: string[];
}

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef<((result: SpeechResult) => void) | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(
    (onResult: (result: SpeechResult) => void) => {
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) {
        setSupported(false);
        return;
      }

      stop();
      onResultRef.current = onResult;

      const recognition = new SpeechRecognition();
      recognition.lang = "de-DE";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onresult = (event) => {
        const result = event.results[0];
        if (!result) return;

        const alternatives: string[] = [];
        for (let i = 0; i < result.length; i += 1) {
          const text = result[i]?.transcript?.trim();
          if (text) alternatives.push(text);
        }

        const transcript = alternatives[0] ?? "";
        onResultRef.current?.({ transcript, alternatives });
      };

      recognition.onerror = () => {
        setListening(false);
        onResultRef.current?.({ transcript: "", alternatives: [] });
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    },
    [stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { listening, supported, start, stop };
}

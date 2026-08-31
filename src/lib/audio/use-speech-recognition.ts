"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string } | undefined;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultList & {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
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

function collectFromEvent(event: SpeechRecognitionEventLike): SpeechResult {
  const alternatives: string[] = [];
  let transcript = "";

  for (let i = 0; i < event.results.length; i += 1) {
    const result = event.results[i];
    if (!result) continue;

    for (let j = 0; j < result.length; j += 1) {
      const text = result[j]?.transcript?.trim();
      if (text && !alternatives.includes(text)) {
        alternatives.push(text);
      }
    }

    if (result.isFinal && result[0]?.transcript) {
      transcript = result[0].transcript.trim();
    }
  }

  if (!transcript && alternatives[0]) {
    transcript = alternatives[0];
  }

  return { transcript, alternatives };
}

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const latestResultRef = useRef<SpeechResult>({ transcript: "", alternatives: [] });
  const finalizeRef = useRef<((result: SpeechResult) => void) | null>(null);
  const stoppingRef = useRef(false);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  const deliverResult = useCallback(() => {
    const callback = finalizeRef.current;
    finalizeRef.current = null;
    stoppingRef.current = false;
    callback?.(latestResultRef.current);
  }, []);

  const stop = useCallback(
    (onFinalize: (result: SpeechResult) => void) => {
      finalizeRef.current = onFinalize;
      stoppingRef.current = true;

      const recognition = recognitionRef.current;
      if (!recognition) {
        setListening(false);
        deliverResult();
        return;
      }

      try {
        recognition.stop();
      } catch {
        setListening(false);
        recognitionRef.current = null;
        deliverResult();
      }
    },
    [deliverResult],
  );

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    latestResultRef.current = { transcript: "", alternatives: [] };
    stoppingRef.current = false;
    finalizeRef.current = null;

    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const collected = collectFromEvent(event);
      if (collected.transcript || collected.alternatives.length > 0) {
        latestResultRef.current = collected;
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      if (!stoppingRef.current) {
        setListening(false);
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      if (stoppingRef.current) {
        deliverResult();
      }
    };

    recognitionRef.current = recognition;
    setListening(true);

    try {
      recognition.start();
    } catch {
      setListening(false);
      recognitionRef.current = null;
    }
  }, [deliverResult]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return { listening, supported, start, stop };
}

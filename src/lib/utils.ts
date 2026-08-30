import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function flagEmoji(isoCode: string): string {
  const code = isoCode.toUpperCase();
  if (code.length !== 2) return "🏳️";
  const points = [...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...points);
}

/** Rechteckige Flaggen (3:2) — keine Kreis-Flaggen. */
export function flagSources(isoCode: string): string[] {
  const iso = isoCode.toLowerCase();
  const ISO = isoCode.toUpperCase();
  return [
    `https://flagcdn.com/w320/${iso}.png`,
    `https://flagsapi.com/${ISO}/flat/64.png`,
    `https://flagsapi.com/${ISO}/shiny/64.png`,
  ];
}

/** @deprecated use flagSources */
export function flagUrl(isoCode: string, width = 320): string {
  return `https://flagcdn.com/w${width}/${isoCode.toLowerCase()}.png`;
}

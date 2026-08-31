import type { Country } from "@/lib/countries";
import type { Question } from "@/lib/game/types";

const MATCH_THRESHOLD = 0.82;

const COUNTRY_ALIASES: Record<string, string[]> = {
  de: ["brd", "bundesrepublik deutschland", "bundesrepublik"],
  at: ["oesterreich"],
  ch: ["schweiz", "confederatio helvetica"],
  gb: ["grossbritannien", "großbritannien", "england", "uk", "united kingdom", "vereinigtes koenigreich"],
  us: ["vereinigte staaten", "amerika", "united states", "usa"],
  cz: ["tschechische republik", "tschechien"],
  nl: ["holland", "niederlande"],
  kr: ["suedkorea", "südkorea", "korea"],
  cn: ["volksrepublik china"],
  ru: ["russische foederation", "russland"],
  ba: ["bosnien", "bosnien herzegowina"],
  mk: ["mazedonien", "nordmazedonien"],
  tr: ["tuerkei", "türkei"],
  eg: ["aegypten", "ägypten"],
  dk: ["daenemark", "dänemark"],
  gr: ["griechenland", "hellas"],
};

const CAPITAL_ALIASES: Record<string, string[]> = {
  de: ["berlin"],
  at: ["wien"],
  ch: ["bern"],
  be: ["bruessel", "brüssel", "bruxelles"],
  ua: ["kiew", "kyiv", "kyjiw"],
  cn: ["peking", "beijing"],
  jp: ["tokio", "tokyo"],
  kr: ["seoul", "suedkorea"],
  us: ["washington", "washington dc", "washington d c"],
  br: ["brasilia", "brasília"],
  mx: ["mexiko stadt", "mexiko-stadt", "ciudad de mexico"],
  in: ["neu delhi", "new delhi"],
  ie: ["dublin"],
  is: ["reykjavik", "reykjavík"],
  tr: ["ankara"],
  il: ["jerusalem"],
  za: ["pretoria"],
  ng: ["abuja"],
  ke: ["nairobi"],
  ma: ["rabat"],
  th: ["bangkok"],
  id: ["jakarta"],
  sa: ["riad", "riyadh"],
  nz: ["wellington"],
  au: ["canberra"],
  eg: ["kairo", "cairo"],
  ar: ["buenos aires"],
  ca: ["ottawa"],
  fr: ["paris"],
  it: ["rom", "roma"],
  es: ["madrid"],
  pt: ["lissabon", "lisboa"],
  nl: ["amsterdam", "den haag"],
  pl: ["warschau", "warsaw", "warszawa"],
  cz: ["prag", "prague", "praha"],
  sk: ["bratislava"],
  hu: ["budapest"],
  ro: ["bukarest", "bucuresti", "bucharest"],
  bg: ["sofia"],
  gr: ["athen", "athens"],
  hr: ["zagreb"],
  si: ["ljubljana"],
  rs: ["belgrad", "belgrade", "beograd"],
  ba: ["sarajevo"],
  me: ["podgorica"],
  mk: ["skopje"],
  al: ["tirana"],
  lt: ["vilnius"],
  lv: ["riga"],
  ee: ["tallinn"],
  fi: ["helsinki"],
  se: ["stockholm"],
  no: ["oslo"],
  dk: ["kopenhagen", "copenhagen", "københavn"],
  mt: ["valletta"],
  cy: ["nikosia", "nicosia"],
  ru: ["moskau", "moscow", "moskva"],
};

export interface VoiceMatchResult {
  correct: boolean;
  matched: string | null;
  score: number;
  transcript: string;
}

export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function similarity(a: string, b: string): number {
  const na = normalizeSpeech(a);
  const nb = normalizeSpeech(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.95;

  const maxLen = Math.max(na.length, nb.length);
  const dist = levenshtein(na, nb);
  return 1 - dist / maxLen;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((v) => v.trim().length > 0))];
}

function countryAliases(country: Country): string[] {
  return unique([
    country.name_de,
    ...(COUNTRY_ALIASES[country.id] ?? []),
  ]);
}

function capitalAliases(country: Country): string[] {
  return unique([
    country.capital_de,
    ...(CAPITAL_ALIASES[country.id] ?? []),
  ]);
}

export function getAcceptedAnswers(question: Question): { label: string; aliases: string[] } {
  switch (question.type) {
    case "flag_to_country":
    case "capital_to_country":
      return { label: question.country.name_de, aliases: countryAliases(question.country) };
    case "country_to_capital":
      return { label: question.country.capital_de, aliases: capitalAliases(question.country) };
    default:
      return { label: "", aliases: [] };
  }
}

export function getCorrectAnswerLabel(question: Question): string {
  return getAcceptedAnswers(question).label;
}

function scoreTranscript(transcript: string, aliases: string[]): { matched: string | null; score: number } {
  let bestMatched: string | null = null;
  let bestScore = 0;

  for (const alias of aliases) {
    const score = similarity(transcript, alias);
    if (score > bestScore) {
      bestScore = score;
      bestMatched = alias;
    }
  }

  return { matched: bestMatched, score: bestScore };
}

export function matchVoiceAnswer(
  question: Question,
  transcript: string,
  alternatives: string[] = [],
): VoiceMatchResult {
  const { label, aliases } = getAcceptedAnswers(question);
  const candidates = unique([transcript, ...alternatives]);

  let best: VoiceMatchResult = {
    correct: false,
    matched: null,
    score: 0,
    transcript: transcript.trim(),
  };

  for (const candidate of candidates) {
    const { matched, score } = scoreTranscript(candidate, aliases);
    if (score > best.score) {
      best = {
        correct: score >= MATCH_THRESHOLD,
        matched: score >= MATCH_THRESHOLD ? (matched ?? label) : matched,
        score,
        transcript: candidate.trim(),
      };
    }
  }

  if (best.correct && !best.matched) {
    best.matched = label;
  }

  return best;
}

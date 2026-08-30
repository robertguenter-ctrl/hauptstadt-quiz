import type { Country } from "@/lib/countries";
import { pickRandom, shuffle } from "@/lib/utils";
import type { Question, QuestionType, TileOption } from "@/lib/game/types";

const QUESTION_TYPES: QuestionType[] = [
  "flag_to_country",
  "country_to_flag",
  "country_to_capital",
  "capital_to_country",
];

function pickDistractors(pool: Country[], correct: Country, count: number): Country[] {
  const sameRegion = pool.filter(
    (c) => c.id !== correct.id && c.region === correct.region,
  );
  const others = pool.filter(
    (c) => c.id !== correct.id && c.region !== correct.region,
  );

  const picked: Country[] = [];
  const candidates = shuffle([...sameRegion, ...others]);

  for (const country of candidates) {
    if (picked.length >= count) break;
    if (!picked.some((c) => c.id === country.id)) {
      picked.push(country);
    }
  }

  return picked;
}

function buildTiles(
  type: QuestionType,
  correct: Country,
  distractors: Country[],
): TileOption[] {
  const all = shuffle([correct, ...distractors]);

  switch (type) {
    case "flag_to_country":
      return all.map((c) => ({
        id: c.id,
        label: c.name_de,
        isCorrect: c.id === correct.id,
      }));
    case "country_to_flag":
      return all.map((c) => ({
        id: c.id,
        label: c.name_de,
        iso_code: c.iso_code,
        isCorrect: c.id === correct.id,
      }));
    case "country_to_capital":
      return all.map((c) => ({
        id: c.id,
        label: c.capital_de,
        isCorrect: c.id === correct.id,
      }));
    case "capital_to_country":
      return all.map((c) => ({
        id: c.id,
        label: c.name_de,
        isCorrect: c.id === correct.id,
      }));
    default:
      return [];
  }
}

export function createQuestion(pool: Country[]): Question {
  if (pool.length < 10) {
    throw new Error("Mindestens 10 Länder werden für 9 Kacheln benötigt.");
  }

  const country = pickRandom(pool);
  const type = pickRandom(QUESTION_TYPES);
  const distractors = pickDistractors(pool, country, 8);
  const tiles = buildTiles(type, country, distractors);

  switch (type) {
    case "flag_to_country":
      return {
        type,
        country,
        prompt: "Welches Land hat diese Flagge?",
        displayFlag: country.iso_code,
        tiles,
      };
    case "country_to_flag":
      return {
        type,
        country,
        prompt: "Welche Flagge gehört zu diesem Land?",
        displayText: country.name_de,
        tiles,
      };
    case "country_to_capital":
      return {
        type,
        country,
        prompt: "Was ist die Hauptstadt?",
        displayText: country.name_de,
        displayFlag: country.iso_code,
        tiles,
      };
    case "capital_to_country":
      return {
        type,
        country,
        prompt: "Zu welchem Land gehört diese Hauptstadt?",
        displayText: country.capital_de,
        tiles,
      };
    default:
      throw new Error("Unbekannter Fragetyp");
  }
}

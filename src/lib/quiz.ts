/**
 * Quiz + flashcards built from the existing glossary data only — no new
 * content. Sets of 10, by category, EN→ES or ES→EN. Sets are
 * deterministic: the same category + direction always shuffles the same
 * way, so a set link and a learner's progress stay stable across visits.
 */
import { TERMS } from "./lexipro";
import type { Term, TermCategory } from "./lexipro";

export type QuizDirection = "en-es" | "es-en";

export const QUIZ_SET_SIZE = 10;

/** Terms that can be quizzed: they need a Spanish side to answer with. */
export function quizPool(cat: TermCategory | "All"): Term[] {
  return TERMS.filter(
    (t) => t.es.trim() !== "" && (cat === "All" || t.cat === cat),
  );
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic shuffle (mulberry32). Same seed → same order. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let a = seed;
  const rand = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface QuizSet {
  index: number;
  total: number;
  terms: Term[];
}

/** The pool, shuffled once per category + direction, chunked into 10s. */
export function quizSets(
  cat: TermCategory | "All",
  direction: QuizDirection,
): QuizSet[] {
  const pool = quizPool(cat);
  const shuffled = seededShuffle(pool, hashSeed(`${cat}|${direction}`));
  const sets: QuizSet[] = [];
  for (let i = 0; i < shuffled.length; i += QUIZ_SET_SIZE) {
    sets.push({
      index: sets.length,
      total: Math.ceil(shuffled.length / QUIZ_SET_SIZE),
      terms: shuffled.slice(i, i + QUIZ_SET_SIZE),
    });
  }
  return sets;
}

export interface Choice {
  text: string;
  correct: boolean;
}

/**
 * Four options for one term: the right answer plus three distractors
 * drawn from the same pool, shuffled deterministically.
 */
export function buildChoices(
  term: Term,
  pool: Term[],
  direction: QuizDirection,
  seed: number,
): Choice[] {
  const answerSide = direction === "en-es" ? "es" : "en";
  const answer = term[answerSide].trim();
  const others = seededShuffle(
    pool.filter((t) => t !== term && t[answerSide].trim() !== ""),
    seed,
  )
    .slice(0, 3)
    .map((t) => t[answerSide].trim());
  const options = seededShuffle(
    [
      { text: answer, correct: true },
      ...others.map((text) => ({ text, correct: false })),
    ],
    seed + 7,
  );
  return options;
}

/** "Missed terms" deck, kept on the device in localStorage. */
const MISSED_KEY = "lexipro-missed-terms-v1";

export function loadMissed(): string[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(MISSED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function addMissed(slug: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    const missed = loadMissed();
    if (!missed.includes(slug)) {
      missed.push(slug);
      localStorage.setItem(MISSED_KEY, JSON.stringify(missed));
    }
  } catch {
    return;
  }
}

export function removeMissed(slug: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
      MISSED_KEY,
      JSON.stringify(loadMissed().filter((s) => s !== slug)),
    );
  } catch {
    return;
  }
}

export function clearMissed(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(MISSED_KEY);
  } catch {
    return;
  }
}

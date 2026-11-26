import { describe, expect, it } from "vitest";
import {
  QUIZ_SET_SIZE,
  buildChoices,
  loadMissed,
  quizPool,
  quizSets,
  seededShuffle,
} from "../lib/quiz";

describe("quiz pools", () => {
  it("excludes terms with no Spanish rendering", () => {
    // 994 terms, 43 with an empty Spanish side.
    expect(quizPool("All").length).toBe(951);
    expect(quizPool("Education").length).toBe(14);
    expect(quizPool("Basic").length).toBe(4);
    expect(quizPool("All").every((t) => t.es.trim() !== "")).toBe(true);
  });
});

describe("quiz sets", () => {
  it("chunks the pool into sets of 10 covering every term once", () => {
    const sets = quizSets("All", "en-es");
    expect(sets.length).toBe(Math.ceil(951 / QUIZ_SET_SIZE));
    expect(sets.every((s) => s.terms.length <= QUIZ_SET_SIZE)).toBe(true);
    const seen = sets.flatMap((s) => s.terms.map((t) => t.en));
    expect(new Set(seen).size).toBe(951);
    expect(sets[0].total).toBe(sets.length);
  });

  it("is deterministic: same category + direction, same sets", () => {
    const a = quizSets("Court & Legal", "es-en");
    const b = quizSets("Court & Legal", "es-en");
    expect(a.map((s) => s.terms.map((t) => t.en))).toEqual(
      b.map((s) => s.terms.map((t) => t.en)),
    );
    // ...but a different direction shuffles differently.
    const c = quizSets("Court & Legal", "en-es");
    expect(c[0].terms.map((t) => t.en)).not.toEqual(
      a[0].terms.map((t) => t.en),
    );
  });
});

describe("buildChoices", () => {
  it("returns four options with exactly one correct answer", () => {
    const pool = quizPool("All");
    const term = pool[0];
    const choices = buildChoices(term, pool, "en-es", 42);
    expect(choices.length).toBe(4);
    expect(choices.filter((c) => c.correct).length).toBe(1);
    expect(choices.find((c) => c.correct)?.text).toBe(term.es.trim());
    expect(new Set(choices.map((c) => c.text)).size).toBe(4);
  });
});

describe("seededShuffle", () => {
  it("is deterministic and preserves the items", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(seededShuffle(items, 7)).toEqual(seededShuffle(items, 7));
    expect([...seededShuffle(items, 7)].sort((a, b) => a - b)).toEqual(items);
  });
});

describe("missed deck (no browser here)", () => {
  it("loads empty when localStorage is unavailable", () => {
    expect(loadMissed()).toEqual([]);
  });
});

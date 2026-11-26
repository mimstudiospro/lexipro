import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  SLUGGED_TERMS,
  TERMS,
  TOP_100,
  categoryCounts,
  relatedTerms,
  searchTerms,
  slugFor,
} from "../lib/lexipro";

describe("glossary data (verbatim from the main site)", () => {
  it("has 994 terms", () => {
    expect(TERMS.length).toBe(994);
  });

  it("has the five source categories with the expected counts", () => {
    expect(categoryCounts()).toEqual({
      "Court & Legal": 786,
      Basic: 4,
      Advanced: 97,
      General: 93,
      Education: 14,
    });
    expect(CATEGORIES).toEqual([
      "Court & Legal",
      "Basic",
      "Advanced",
      "General",
      "Education",
    ]);
  });

  it("gives every term a unique slug", () => {
    const slugs = SLUGGED_TERMS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(994);
    // The one slug collision in the source data: "CASE" (the EOIR
    // database) and "Case #" — the second in file order gets "-2".
    expect(slugFor(TERMS[157])).toBe("case");
    expect(slugFor(TERMS[158])).toBe("case-2");
  });

  it("searches English, Spanish and notes, accent-insensitively", () => {
    const continuance = searchTerms("continuance", "All");
    expect(continuance.length).toBeGreaterThan(0);
    expect(continuance.every((t) => t.en.toLowerCase().includes("continuance"))).toBe(true);
    const fallo = searchTerms("fallo", "All");
    expect(fallo.length).toBeGreaterThan(0);
    const asylum = searchTerms("asylum", "All");
    expect(asylum.length).toBeGreaterThan(0);
    // Empty query in a category returns that category's terms.
    expect(searchTerms("", "Education").length).toBe(14);
    expect(searchTerms("", "Court & Legal").length).toBe(786);
  });

  it("Top 100 is the first 100 Court & Legal terms in file order", () => {
    expect(TOP_100.length).toBe(100);
    expect(TOP_100.every((t) => t.cat === "Court & Legal")).toBe(true);
    expect(TOP_100[0].en).toMatch(/^5 Types of Relief/);
    expect(TOP_100[99]).toBe(TERMS.filter((t) => t.cat === "Court & Legal")[99]);
  });

  it("related terms stay in the same category and exclude the term", () => {
    const term = TERMS.find((t) => t.en === "Abandoned")!;
    const related = relatedTerms(term, 4);
    expect(related.length).toBe(4);
    expect(related.every((t) => t.cat === term.cat)).toBe(true);
    expect(related).not.toContain(term);
  });
});

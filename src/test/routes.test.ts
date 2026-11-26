import { describe, expect, it } from "vitest";
import { anchorId, parseHash } from "../lib/routes";

describe("parseHash", () => {
  it("routes home, term pages, start-here and quiz", () => {
    expect(parseHash("")).toEqual({ view: "home" });
    expect(parseHash("#/")).toEqual({ view: "home" });
    expect(parseHash("#/term/continuance")).toEqual({
      view: "term",
      slug: "continuance",
    });
    expect(parseHash("#/term/case-2")).toEqual({
      view: "term",
      slug: "case-2",
    });
    expect(parseHash("#/start-here")).toEqual({ view: "start-here" });
    expect(parseHash("#/quiz")).toEqual({ view: "quiz" });
  });

  it("falls back to home for unknown hashes and bare term routes", () => {
    expect(parseHash("#/nonsense")).toEqual({ view: "home" });
    expect(parseHash("#/term/")).toEqual({ view: "home" });
    expect(parseHash("#contribute")).toEqual({ view: "home" });
  });
});

describe("anchorId", () => {
  it("returns section anchors on the home page", () => {
    expect(anchorId("#contribute")).toBe("contribute");
    expect(anchorId("#top-100")).toBe("top-100");
  });

  it("returns null for real routes", () => {
    expect(anchorId("#/quiz")).toBeNull();
    expect(anchorId("#/start-here")).toBeNull();
    expect(anchorId("#/term/continuance")).toBeNull();
    expect(anchorId("")).toBeNull();
  });
});

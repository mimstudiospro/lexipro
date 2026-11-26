import { useMemo, useState } from "react";
import {
  CATEGORIES,
  TERM_BY_SLUG,
  slugFor,
} from "../lib/lexipro";
import type { Term, TermCategory } from "../lib/lexipro";
import {
  QUIZ_SET_SIZE,
  addMissed,
  buildChoices,
  clearMissed,
  loadMissed,
  quizPool,
  quizSets,
  removeMissed,
} from "../lib/quiz";
import type { QuizDirection } from "../lib/quiz";
import { AudioButtons } from "./AudioButtons";

type Mode = "flashcards" | "choice";
type Phase = "setup" | "run" | "done";

function promptOf(term: Term, direction: QuizDirection): string {
  return direction === "en-es" ? term.en : term.es;
}

function answerOf(term: Term, direction: QuizDirection): string {
  return direction === "en-es" ? term.es : term.en;
}

export function QuizPage() {
  const [cat, setCat] = useState<TermCategory | "All">("Court & Legal");
  const [direction, setDirection] = useState<QuizDirection>("en-es");
  const [mode, setMode] = useState<Mode>("flashcards");
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [missedMode, setMissedMode] = useState(false);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [missedCount, setMissedCount] = useState(() => loadMissed().length);

  const sets = useMemo(
    () => quizSets(cat, direction),
    [cat, direction],
  );
  const pool = useMemo(() => quizPool(cat), [cat]);

  const missedTerms = useMemo(() => {
    if (!missedMode) return [];
    return loadMissed()
      .map((slug) => TERM_BY_SLUG.get(slug))
      .filter((t): t is Term => Boolean(t));
  }, [missedMode, missedCount]);

  const set = missedMode
    ? { index: 0, total: 1, terms: missedTerms }
    : (sets[Math.min(setIndex, Math.max(0, sets.length - 1))] ?? {
        index: 0,
        total: 0,
        terms: [],
      });

  const term = set.terms[current];
  const choices = useMemo(() => {
    if (!term || mode !== "choice") return [];
    const seed = setIndex * 1000 + current * 31 + term.en.length;
    return buildChoices(term, pool, direction, seed);
  }, [term, mode, pool, direction, setIndex, current]);

  function startRun(missed: boolean, setIdx: number) {
    setMissedMode(missed);
    setSetIndex(setIdx);
    setCurrent(0);
    setRevealed(false);
    setSelected(null);
    setResults([]);
    setPhase("run");
    window.scrollTo(0, 0);
  }

  /** Records the answer (score + missed deck) without advancing. */
  function record(known: boolean) {
    if (!term) return;
    const slug = slugFor(term);
    if (known) removeMissed(slug);
    else addMissed(slug);
    setMissedCount(loadMissed().length);
    setResults((r) => [...r, known]);
  }

  function advance() {
    if (current + 1 < set.terms.length) {
      setCurrent((c) => c + 1);
      setRevealed(false);
      setSelected(null);
    } else {
      setPhase("done");
    }
  }

  function onChoice(i: number) {
    if (selected !== null || !choices[i]) return;
    setSelected(i);
    record(choices[i].correct);
  }

  const score = results.filter(Boolean).length;
  const missedThisSet = set.terms.filter(
    (_t, i) => results[i] === false,
  );

  if (phase === "setup") {
    return (
      <section className="mx-auto max-w-4xl px-6 py-14">
        <p className="label text-coral">Practice</p>
        <h1 className="headline mt-4 text-4xl md:text-5xl">
          Drill the glossary
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Flashcards and multiple-choice quizzes built from the glossary
          itself — sets of {QUIZ_SET_SIZE}, by category, English to Spanish or
          Spanish to English. Terms you miss go into a deck on this device so
          you can review them later. No account, no tracking.
        </p>

        <div className="mt-10 border border-line bg-panel p-6 md:p-8">
          <p className="label text-muted">Category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCat(c);
                  setSetIndex(0);
                }}
                className={`border px-4 py-1.5 text-xs uppercase tracking-[0.2em] ${
                  cat === c
                    ? "border-ink bg-ink text-paper"
                    : "border-ink text-ink hover:bg-coral-soft"
                }`}
              >
                {c} · {quizPool(c).length}
              </button>
            ))}
          </div>

          <p className="label mt-8 text-muted">Direction</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDirection("en-es")}
              className={`border px-4 py-2 text-sm font-semibold ${
                direction === "en-es"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink text-ink hover:bg-coral-soft"
              }`}
            >
              English → Spanish
            </button>
            <button
              type="button"
              onClick={() => setDirection("es-en")}
              className={`border px-4 py-2 text-sm font-semibold ${
                direction === "es-en"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink text-ink hover:bg-coral-soft"
              }`}
            >
              Spanish → English
            </button>
          </div>

          <p className="label mt-8 text-muted">Mode</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("flashcards")}
              className={`border px-4 py-2 text-sm font-semibold ${
                mode === "flashcards"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink text-ink hover:bg-coral-soft"
              }`}
            >
              Flashcards
            </button>
            <button
              type="button"
              onClick={() => setMode("choice")}
              className={`border px-4 py-2 text-sm font-semibold ${
                mode === "choice"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink text-ink hover:bg-coral-soft"
              }`}
            >
              Multiple choice
            </button>
          </div>

          <p className="label mt-8 text-muted">Set</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={setIndex === 0}
              onClick={() => setSetIndex((i) => Math.max(0, i - 1))}
              className="border border-ink px-3 py-2 text-sm disabled:opacity-40"
              aria-label="Previous set"
            >
              ←
            </button>
            <span className="text-sm font-semibold">
              Set {Math.min(setIndex, Math.max(0, sets.length - 1)) + 1} of{" "}
              {sets.length} · {QUIZ_SET_SIZE} terms
            </span>
            <button
              type="button"
              disabled={setIndex >= sets.length - 1}
              onClick={() =>
                setSetIndex((i) => Math.min(sets.length - 1, i + 1))
              }
              className="border border-ink px-3 py-2 text-sm disabled:opacity-40"
              aria-label="Next set"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => startRun(false, setIndex)}
              disabled={sets.length === 0}
              className="ml-2 bg-ink px-6 py-2 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Start set
            </button>
          </div>
        </div>

        <div className="mt-8 border border-line bg-panel p-6 md:p-8">
          <p className="label text-coral">Your missed-terms deck</p>
          {missedCount === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Nothing here yet. Terms you miss in a quiz land here for review.
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {missedCount} term{missedCount === 1 ? "" : "s"} waiting for
                review on this device.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => startRun(true, 0)}
                  className="border border-ink bg-ink px-6 py-2 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  Review missed terms
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearMissed();
                    setMissedCount(0);
                  }}
                  className="border border-ink px-6 py-2 text-sm font-semibold hover:bg-coral-soft"
                >
                  Clear the deck
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="mx-auto max-w-4xl px-6 py-14">
        <p className="label text-coral">
          {missedMode ? "Missed-terms review" : `Set ${set.index + 1}`}
        </p>
        <h1 className="headline mt-4 text-4xl">
          {score} of {results.length} right
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {missedThisSet.length === 0
            ? "Clean run — nothing missed. On to the next set."
            : "The terms below went into your missed-terms deck on this device."}
        </p>
        {missedThisSet.length > 0 && (
          <ul className="mt-8 space-y-px border border-line bg-line">
            {missedThisSet.map((t) => (
              <li key={slugFor(t)} className="bg-panel p-5">
                <a
                  href={`#/term/${slugFor(t)}`}
                  className="headline text-lg hover:text-coral"
                >
                  {t.en}
                </a>
                {t.es && <p className="mt-1 text-sm text-coral">{t.es}</p>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          {!missedMode && set.index + 1 < set.total && (
            <button
              type="button"
              onClick={() => startRun(false, set.index + 1)}
              className="border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
            >
              Next set
            </button>
          )}
          {missedCount > 0 && (
            <button
              type="button"
              onClick={() => startRun(true, 0)}
              className="border border-ink px-6 py-3 text-sm font-semibold hover:bg-coral-soft"
            >
              Review missed terms
            </button>
          )}
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="border border-ink px-6 py-3 text-sm font-semibold hover:bg-coral-soft"
          >
            Back to setup
          </button>
        </div>
      </section>
    );
  }

  if (!term) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="headline text-3xl">Nothing to drill here</h1>
        <p className="mt-4 text-muted">
          This set is empty — pick another category or clear the deck.
        </p>
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="mt-8 border border-ink px-6 py-3 text-sm font-semibold hover:bg-coral-soft"
        >
          Back to setup
        </button>
      </section>
    );
  }

  const prompt = promptOf(term, direction);
  const answer = answerOf(term, direction);

  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      <p className="label text-coral">
        {missedMode
          ? `Missed-terms review · ${current + 1} of ${set.terms.length}`
          : `Set ${set.index + 1} of ${set.total} · ${current + 1} of ${set.terms.length}`}
      </p>
      <p className="mt-2 text-sm text-muted">
        {direction === "en-es" ? "English → Spanish" : "Spanish → English"} ·{" "}
        {mode === "flashcards" ? "Flashcards" : "Multiple choice"} · Score so
        far: {score}/{results.length}
      </p>

      <div className="mt-8 border border-line bg-panel p-8 md:p-10">
        <p className="label text-muted">
          {direction === "en-es" ? "English" : "Spanish"}
        </p>
        <h1 className="headline mt-3 text-3xl leading-snug md:text-4xl">
          {prompt}
        </h1>
        <div className="mt-4">
          <AudioButtons
            en={direction === "en-es" ? prompt : answer}
            es={direction === "en-es" ? answer : prompt}
          />
        </div>

        {mode === "flashcards" && (
          <>
            {revealed ? (
              <div className="mt-8 border-t border-line pt-6">
                <p className="label text-muted">
                  {direction === "en-es" ? "Spanish" : "English"}
                </p>
                <p className="mt-2 text-2xl leading-relaxed text-coral">
                  {answer || "—"}
                </p>
                {term.note && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {term.note}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      record(true);
                      advance();
                    }}
                    className="border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                  >
                    I knew it
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      record(false);
                      advance();
                    }}
                    className="border border-ink px-6 py-3 text-sm font-semibold hover:bg-coral-soft"
                  >
                    Missed it
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-8 border border-ink px-6 py-3 text-sm font-semibold hover:bg-coral-soft"
              >
                Reveal the answer
              </button>
            )}
          </>
        )}

        {mode === "choice" && (
          <div className="mt-8">
            <p className="label text-muted">
              {direction === "en-es" ? "Spanish" : "English"}
            </p>
            <ul className="mt-4 space-y-3">
              {choices.map((c, i) => {
                const isSelected = selected === i;
                const cls =
                  selected === null
                    ? "border-ink hover:bg-coral-soft"
                    : c.correct
                      ? "border-ink bg-ink text-paper"
                      : isSelected
                        ? "border-coral bg-coral-soft text-coral-deep"
                        : "border-line text-muted";
                return (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={selected !== null}
                      onClick={() => onChoice(i)}
                      className={`w-full border px-5 py-3 text-left text-base ${cls}`}
                    >
                      {c.text}
                      {selected !== null && c.correct ? " ✓" : ""}
                      {isSelected && !c.correct ? " ✗" : ""}
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected !== null && (
              <div className="mt-6">
                {term.note && (
                  <p className="text-sm leading-relaxed text-muted">
                    {term.note}
                  </p>
                )}
                <button
                  type="button"
                  onClick={advance}
                  className="mt-4 border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
                >
                  {current + 1 < set.terms.length ? "Next term" : "See results"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`#/term/${slugFor(term)}`}
          className="text-sm font-semibold underline underline-offset-4 hover:text-coral"
        >
          Open this term
        </a>
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="text-sm font-semibold underline underline-offset-4 hover:text-coral"
        >
          Quit to setup
        </button>
      </div>
    </section>
  );
}

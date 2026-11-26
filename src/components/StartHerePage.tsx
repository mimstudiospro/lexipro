import { TOP_100, slugFor } from "../lib/lexipro";
import { AudioButtons } from "./AudioButtons";

/** "Start here" — the 100 most-heard-in-court terms: the first 100
 * Court & Legal terms in the glossary, the same 100 the Top 100 study
 * guide is built from. */
export function StartHerePage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-14">
      <p className="label text-coral">Start here</p>
      <h1 className="headline mt-4 text-4xl md:text-5xl">
        100 most-heard-in-court terms
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        The first 100 Court &amp; Legal terms from the glossary, in one
        place — English and Spanish, with notes where the glossary has them.
        Work through them before a hearing, or use them as your daily drill.
      </p>
      <p className="mt-4 text-sm">
        <a
          href="./top-100-court-interpreting-terms.pdf"
          download
          className="font-semibold underline underline-offset-4 hover:text-coral"
        >
          Download the PDF
        </a>
        <span className="text-muted">
          {" "}
          · 100 terms · English &amp; Spanish · printable
        </span>
      </p>

      <ol className="mt-10 space-y-px border border-line bg-line">
        {TOP_100.map((t, i) => (
          <li key={slugFor(t)} className="bg-panel p-5 md:p-6">
            <div className="flex items-start gap-4">
              <span className="label mt-1 w-8 shrink-0 text-coral">
                {String(i + 1).padStart(3, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={`#/term/${slugFor(t)}`}
                  className="headline text-lg leading-snug hover:text-coral md:text-xl"
                >
                  {t.en}
                </a>
                {t.es && (
                  <p className="mt-1 text-base leading-relaxed text-coral">
                    {t.es}
                  </p>
                )}
                {t.note && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t.note}
                  </p>
                )}
                <div className="mt-3">
                  <AudioButtons en={t.en} es={t.es} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 text-center">
        <a
          href="#/quiz"
          className="inline-block border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
        >
          Drill these 100 in Practice
        </a>
      </div>
    </section>
  );
}

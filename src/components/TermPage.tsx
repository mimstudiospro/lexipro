import { relatedTerms, slugFor } from "../lib/lexipro";
import { TERM_BY_SLUG } from "../lib/lexipro";
import { CopyButton } from "./CopyButton";
import { AudioButtons } from "./AudioButtons";

export function TermPage({ slug }: { slug: string }) {
  const term = TERM_BY_SLUG.get(slug);

  if (!term) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="headline text-3xl">Term not found</h1>
        <p className="mt-4 text-muted">
          There is no glossary entry at this address. It may have been
          renamed — try the search on the glossary page.
        </p>
        <a
          href="#/"
          className="mt-8 inline-block border border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-paper"
        >
          Back to the glossary
        </a>
      </section>
    );
  }

  const related = relatedTerms(term, 4);

  return (
    <section className="mx-auto max-w-4xl px-6 py-14">
      <a
        href="#/"
        className="text-sm font-semibold underline underline-offset-4 hover:text-coral"
      >
        ← Back to the glossary
      </a>
      <article className="mt-8 border border-line bg-panel p-8 md:p-10">
        <p className="label text-muted">{term.cat}</p>
        <h1 className="headline mt-3 text-4xl leading-tight md:text-5xl">
          {term.en || "—"}
        </h1>
        {term.es ? (
          <p className="mt-4 text-2xl leading-relaxed text-coral">{term.es}</p>
        ) : (
          <p className="mt-4 text-base leading-relaxed text-muted">
            No Spanish rendering in the glossary yet.
          </p>
        )}
        {term.note && (
          <p className="mt-6 text-base leading-relaxed text-muted">
            {term.note}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <AudioButtons en={term.en} es={term.es} />
          <CopyButton
            text={[term.en, term.es, term.note].filter(Boolean).join(" — ")}
          />
        </div>
        <p className="mt-8 text-sm text-muted">
          See a mistake, or a better rendering?{" "}
          <a
            href="#contribute"
            className="font-semibold underline underline-offset-4 hover:text-coral"
          >
            Suggest a correction
          </a>{" "}
          — contributions are reviewed by an editor before anything changes.
        </p>
      </article>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="headline text-2xl">More in {term.cat}</h2>
          <ul className="mt-6 grid gap-px border border-line bg-line md:grid-cols-2">
            {related.map((t) => (
              <li key={slugFor(t)} className="bg-panel p-5">
                <a
                  href={`#/term/${slugFor(t)}`}
                  className="headline text-lg hover:text-coral"
                >
                  {t.en}
                </a>
                {t.es && (
                  <p className="mt-1 text-sm text-coral">{t.es}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

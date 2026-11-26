import { useMemo, useState } from "react";
import {
  CATEGORIES,
  COUNTRIES,
  DISQUALIFICATIONS,
  HEARING_SCRIPTS,
  PROTOCOLS,
  PROTOCOL_NOTES,
  SIM_TIPS,
  TERMS,
  categoryCounts,
  norm,
  searchTerms,
  slugFor,
} from "../lib/lexipro";
import type { TermCategory } from "../lib/lexipro";
import { CopyButton } from "./CopyButton";
import { AudioButtons } from "./AudioButtons";
import { Top100Section } from "./Top100Section";
import { ContributionForm } from "./ContributionForm";

type Tab = "glossary" | "protocols" | "countries" | "scripts" | "tips";

const TABS: { id: Tab; label: string }[] = [
  { id: "glossary", label: "Glossary" },
  { id: "protocols", label: "Protocols" },
  { id: "countries", label: "Country Guide" },
  { id: "scripts", label: "Hearing Scripts" },
  { id: "tips", label: "Practice Notes" },
];

function TermCard({ term }: { term: (typeof TERMS)[number] }) {
  return (
    <li className="relative bg-panel p-6">
      <div className="absolute top-4 right-4">
        <CopyButton
          text={[term.en, term.es, term.note].filter(Boolean).join(" — ")}
        />
      </div>
      <p className="label pr-24 text-muted">{term.cat}</p>
      <h3 className="headline mt-3 text-xl leading-snug">
        <a href={`#/term/${slugFor(term)}`} className="hover:text-coral">
          {term.en || "—"}
        </a>
      </h3>
      {term.es && <p className="mt-2 text-base leading-relaxed text-coral">{term.es}</p>}
      {term.note && (
        <p className="mt-3 text-sm leading-relaxed text-muted">{term.note}</p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <AudioButtons en={term.en} es={term.es} />
        <a
          href={`#/term/${slugFor(term)}`}
          className="text-xs font-semibold underline underline-offset-4 hover:text-coral"
        >
          Open term
        </a>
      </div>
    </li>
  );
}

export function HomePage() {
  const [tab, setTab] = useState<Tab>("glossary");
  const [query, setQuery] = useState("");
  // First screen shows Court & Legal — grade-level entries no longer
  // dominate the first load.
  const [cat, setCat] = useState<TermCategory | "All">("Court & Legal");
  const [limit, setLimit] = useState(60);

  const counts = useMemo(() => categoryCounts(), []);
  const results = useMemo(() => searchTerms(query, cat), [query, cat]);

  const countryQuery = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return COUNTRIES;
    return COUNTRIES.map((c) => ({
      ...c,
      glossary: c.glossary.filter((g) =>
        norm(`${g.es} ${g.en} ${g.example}`).includes(q),
      ),
    })).filter((c) => c.glossary.length > 0 || norm(c.name).includes(q));
  }, [query]);

  const protocols = useMemo(() => {
    const q = norm(query.trim());
    return PROTOCOLS.filter((p) =>
      norm(`${p.situation} ${p.script}`).includes(q),
    );
  }, [query]);

  return (
    <>
      <section className="border-b border-line px-5 pt-14 pb-10 md:px-8 md:pt-20 md:pb-14">
        <p className="label text-coral">Studio I — Interpreting · Reference</p>
        <h1 className="headline mt-6 text-[11vw] text-ink md:text-[6vw]">
          LexiPro
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          A comprehensive bilingual glossary for court interpreters, featuring
          nearly 1,000 Spanish–English legal and immigration terms, courtroom
          protocols, hearing scripts, and regional terminology from across
          Latin America. Built in the booth, for the booth.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#contribute"
            className="border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
          >
            Become a contributor
          </a>
          <a
            href="#/quiz"
            className="border border-ink px-6 py-3 text-sm font-semibold text-ink hover:bg-coral-soft"
          >
            Practice the glossary
          </a>
        </div>
      </section>

      {/* Start here banner */}
      <section className="border-b border-line bg-coral-soft px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label text-coral">Start here</p>
            <h2 className="headline mt-2 text-2xl">
              100 most-heard-in-court terms
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              New to the booth, or warming up before a hearing? These are the
              first 100 Court &amp; Legal terms in the glossary — the same 100
              in the Top 100 study guide.
            </p>
          </div>
          <a
            href="#/start-here"
            className="border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
          >
            Open the 100 terms
          </a>
        </div>
      </section>

      {/* Sticky search + tabs */}
      <div className="sticky top-[57px] z-40 border-b border-line bg-paper">
        <div className="px-5 py-4 md:px-8">
          <label htmlFor="lexipro-search" className="sr-only">
            Search the reference
          </label>
          <input
            id="lexipro-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(60);
            }}
            placeholder="Search English or Spanish — e.g. “fallo”, “continuance”, “asylum”"
            className="w-full border border-ink bg-panel px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-coral"
          />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`label transition-colors ${
                  tab === t.id
                    ? "text-coral underline underline-offset-4"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "glossary" && (
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <button
              key="All"
              type="button"
              onClick={() => {
                setCat("All");
                setLimit(60);
              }}
              className={`border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                cat === "All"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink text-ink hover:bg-coral-soft"
              }`}
            >
              All · {TERMS.length.toLocaleString()}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCat(c);
                  setLimit(60);
                }}
                className={`border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                  cat === c
                    ? "border-ink bg-ink text-paper"
                    : "border-ink text-ink hover:bg-coral-soft"
                }`}
              >
                {c} · {counts[c].toLocaleString()}
              </button>
            ))}
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {results.length.toLocaleString()} entries
            </span>
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-muted">
              No entries match “{query}”. Try the Spanish spelling, or a
              shorter root.
            </p>
          ) : (
            <ul className="grid gap-px border border-line bg-line md:grid-cols-2">
              {results.slice(0, limit).map((t, i) => (
                <TermCard key={`${t.en}-${t.es}-${i}`} term={t} />
              ))}
            </ul>
          )}

          {results.length > limit && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + 120)}
                className="border border-ink px-6 py-3 text-sm text-ink hover:bg-ink hover:text-paper"
              >
                Show more ({(results.length - limit).toLocaleString()}{" "}
                remaining)
              </button>
            </div>
          )}
        </section>
      )}

      {tab === "protocols" && (
        <section className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="headline text-3xl text-ink md:text-4xl">
            Courtroom protocols
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Ready phrasing for the moments that interrupt a hearing. Stay in
            conduit; always open with “this is the interpreter speaking.”
          </p>
          <ul className="mt-10 grid gap-px border border-line bg-line">
            {protocols.map((p) => (
              <li key={p.situation} className="bg-panel p-8">
                <h3 className="headline text-xl text-ink">{p.situation}</h3>
                <blockquote className="mt-4 border-l-2 border-coral pl-4 text-base leading-relaxed text-ink">
                  “{p.script}”
                </blockquote>
                {p.notes.length > 0 && (
                  <ul className="mt-4 space-y-1">
                    {p.notes.map((n, i) => (
                      <li key={i} className="text-sm leading-relaxed text-muted">
                        — {n}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "countries" && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="headline text-3xl text-ink md:text-4xl">
            Country guide
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Regional slang, political acronyms and administrative divisions
            that surface constantly in asylum testimony.
          </p>
          <div className="mt-10 space-y-16">
            {countryQuery.map((c) => (
              <article key={c.name} className="border-t border-ink pt-8">
                <h3 className="headline text-2xl text-ink md:text-3xl">
                  {c.name}
                </h3>
                {c.summary && (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                    {c.summary}
                  </p>
                )}
                {c.glossary.length > 0 && (
                  <ul className="mt-6 grid gap-px border border-line bg-line md:grid-cols-2">
                    {c.glossary.map((g, i) => (
                      <li key={i} className="bg-panel p-5">
                        <p className="headline text-lg text-ink">{g.es}</p>
                        <p className="mt-1 text-sm text-coral">{g.en}</p>
                        {g.example && (
                          <p className="mt-2 text-xs leading-relaxed text-muted">
                            {g.example}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {c.divisions.length > 0 && (
                  <div className="mt-6">
                    <p className="label text-muted">Administrative divisions</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.divisions.map((d) => (
                        <span
                          key={d}
                          className="border border-ink px-3 py-1 text-xs text-ink"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "scripts" && (
        <section className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="headline text-3xl text-ink md:text-4xl">
            Hearing scripts
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Standard immigration-court language, side by side. Reference only
            — always render what the court actually says.
          </p>
          <div className="mt-10 space-y-px border border-line bg-line">
            {HEARING_SCRIPTS.map((s) => (
              <article key={s.type} className="bg-panel p-8">
                <p className="label text-coral">{s.type}</p>
                <div className="mt-5 grid gap-8 md:grid-cols-2">
                  <p className="text-sm leading-relaxed text-ink">{s.en}</p>
                  <p className="text-sm leading-relaxed text-muted">
                    {s.es || "—"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "tips" && (
        <section className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="headline text-3xl text-ink md:text-4xl">
            Practice notes
          </h2>
          <div className="mt-10 grid gap-px border border-line bg-line">
            {PROTOCOL_NOTES.map((n) => (
              <div key={n.title} className="bg-panel p-8">
                <h3 className="headline text-xl text-ink">{n.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {n.body}
                </p>
              </div>
            ))}
          </div>

          <h3 className="headline mt-16 text-2xl text-ink">
            Simultaneous survival tips
          </h3>
          <ol className="mt-6 space-y-3">
            {SIM_TIPS.map((t, i) => (
              <li
                key={i}
                className="border-t border-ink pt-3 text-base text-ink"
              >
                <span className="label mr-4 text-coral">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t}
              </li>
            ))}
          </ol>

          <h3 className="headline mt-16 text-2xl text-ink">
            Common grounds for disqualification
          </h3>
          <div className="mt-6 grid gap-px border border-line bg-line md:grid-cols-3">
            {DISQUALIFICATIONS.map((d) => (
              <div key={d.title} className="bg-panel p-6">
                <p className="label text-muted">{d.title}</p>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted">
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Top100Section />

      <section id="contribute" className="scroll-mt-48 border-t border-line">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="label text-coral">LexiPro · contributors</p>
          <h2 className="headline mt-4 text-3xl md:text-4xl">
            Become a contributor
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Lawyers and court interpreters: contribute Spanish–English legal
            terminology or phrases for editorial review.
          </p>
          <p className="mt-3 text-sm text-muted">
            Contributor contact details remain private. Submissions are not
            published automatically. Do not include client names or
            confidential case details.
          </p>
          <ContributionForm />
        </div>
      </section>

      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="label text-coral">A note from the booth</p>
          <p className="mt-6 text-base leading-relaxed text-ink md:text-lg">
            Originally developed as <em className="not-italic">masterASSISTANT</em>,
            a centralized Immigration Court resource hub created to promote
            consistency and accuracy across the docket, it has now been rebuilt
            and reimagined as <em className="not-italic">LexiPro</em>.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="headline text-3xl text-balance text-ink md:text-4xl">
            Need a credentialed interpreter, not just a glossary?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://lang.mimstudiospro.com/interpreting"
              className="bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
            >
              Book Interpreter
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

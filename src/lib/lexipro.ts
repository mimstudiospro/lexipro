/**
 * LexiPro glossary data — copied verbatim from the LexiPro page on
 * mimstudiospro.com (`src/data/interpreterAssistant.json`). Nothing here
 * was invented, re-translated, or re-categorised: terms, translations,
 * notes, categories, protocols, country guide, scripts and practice notes
 * are exactly as published on the main site.
 *
 * Two honest limits of the source data, kept as-is:
 * - Only five categories exist (Court & Legal, Basic, Advanced, General,
 *   Education). There is no finer per-term metadata, so the glossary is
 *   NOT split into Criminal / Civil / Family / Immigration / Evidence /
 *   Sentencing — that would invent categories. Counts are shown instead.
 * - Only 78 of 994 terms carry a note, and no term carries an example
 *   sentence. Notes render only when the source has one.
 */
import data from "../data/interpreterAssistant.json";

export type TermCategory =
  | "Court & Legal"
  | "Basic"
  | "Advanced"
  | "General"
  | "Education";

export interface Term {
  en: string;
  es: string;
  note: string;
  cat: TermCategory;
}

export interface CountryGlossaryEntry {
  es: string;
  en: string;
  example: string;
}

export interface Country {
  name: string;
  summary: string;
  glossary: CountryGlossaryEntry[];
  divisions: string[];
}

export interface Protocol {
  situation: string;
  script: string;
  notes: string[];
}

export interface HearingScript {
  type: string;
  en: string;
  es: string;
}

export interface ProtocolNote {
  title: string;
  body: string;
}

export interface Disqualification {
  title: string;
  body: string;
}

export const TERMS: Term[] = data.terms as Term[];
export const COUNTRIES: Country[] = data.countries as Country[];
export const PROTOCOLS: Protocol[] = data.protocols as Protocol[];
export const HEARING_SCRIPTS: HearingScript[] = data.scripts as HearingScript[];
export const PROTOCOL_NOTES: ProtocolNote[] = data.protocolNotes as ProtocolNote[];
export const SIM_TIPS: string[] = data.simTips as string[];
export const DISQUALIFICATIONS: Disqualification[] =
  data.disqualifications as Disqualification[];

export const CATEGORIES: TermCategory[] = [
  "Court & Legal",
  "Basic",
  "Advanced",
  "General",
  "Education",
];

/** Entries per category, for the filter buttons. */
export function categoryCounts(): Record<TermCategory, number> {
  const counts: Record<TermCategory, number> = {
    "Court & Legal": 0,
    Basic: 0,
    Advanced: 0,
    General: 0,
    Education: 0,
  };
  for (const t of TERMS) counts[t.cat] += 1;
  return counts;
}

export function norm(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** URL slug for a term's English headword. */
export function slugify(en: string): string {
  const s = norm(en).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s === "" ? "term" : s;
}

export interface SluggedTerm {
  term: Term;
  slug: string;
}

/**
 * One slug per term, in file order. Two headwords slugify to the same
 * value ("CASE" and "Case #") — the second one in file order gets a "-2"
 * suffix so every term still has its own page.
 */
export const SLUGGED_TERMS: SluggedTerm[] = (() => {
  const used = new Set<string>();
  return TERMS.map((term) => {
    const base = slugify(term.en);
    let slug = base;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }
    used.add(slug);
    return { term, slug };
  });
})();

export const TERM_BY_SLUG: Map<string, Term> = new Map(
  SLUGGED_TERMS.map(({ term, slug }) => [slug, term]),
);

export function slugFor(term: Term): string {
  const found = SLUGGED_TERMS.find((s) => s.term === term);
  return found ? found.slug : slugify(term.en);
}

/** Search across English, Spanish and note, within one category. */
export function searchTerms(
  query: string,
  cat: TermCategory | "All",
): Term[] {
  const q = norm(query.trim());
  return TERMS.filter((t) => {
    if (cat !== "All" && t.cat !== cat) return false;
    if (!q) return true;
    return norm(`${t.en} ${t.es} ${t.note}`).includes(q);
  });
}

/**
 * "Start here" — the first 100 Court & Legal terms in file order, the
 * same 100 the Top 100 study guide is built from.
 */
export const TOP_100: Term[] = TERMS.filter(
  (t) => t.cat === "Court & Legal",
).slice(0, 100);

/** Alphabetical neighbours in the same category, for a term page. */
export function relatedTerms(term: Term, count = 4): Term[] {
  const same = TERMS.filter((t) => t.cat === term.cat && t !== term).sort(
    (a, b) => norm(a.en).localeCompare(norm(b.en)),
  );
  const idx = same.findIndex((t) => norm(t.en) > norm(term.en));
  const start = idx === -1 ? Math.max(0, same.length - count) : idx;
  const out: Term[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = same[(start + i) % same.length];
    if (t) out.push(t);
  }
  return out;
}

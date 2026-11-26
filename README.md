# LexiPro

A bilingual English–Spanish legal glossary for court interpreters, built by a
working court interpreter. Nearly 1,000 Spanish–English legal and immigration
terms, courtroom protocols, hearing scripts, and regional terminology from
across Latin America. Built in the booth, for the booth.

Live at https://lexipro.mimstudiospro.com

## What is here

- **Glossary** — 994 terms, searchable in English or Spanish, with category
  filters (counts shown), per-term pages, free text-to-speech audio for every
  entry, and copy buttons.
- **Start here** — the 100 most-heard-in-court terms (the Top 100 study guide).
- **Practice** — flashcards and multiple-choice quizzes built from the
  glossary data, in sets of 10, by category, EN→ES or ES→EN, plus a
  "missed terms" deck saved on the device.
- **Protocols, Country Guide, Hearing Scripts, Practice Notes** — the
  reference tabs from the original LexiPro page, carried over verbatim.
- **Top 100 PDF** — the printable study guide (newsletter signup optional;
  the download link is always visible).
- **Contribute** — lawyers and court interpreters can submit terminology
  for editorial review. Submissions are private and never publish
  automatically.

## Source of truth

The glossary data (`src/data/interpreterAssistant.json`) and the Top 100 PDF
are copied verbatim from the LexiPro page on mimstudiospro.com
(`mimstudiospro/mimstudiospro.com`, route `src/routes/lexipro.tsx`). Nothing
in the glossary was invented, re-translated, or re-categorised for this site.

Two honest limits of the source data, kept as-is:

- The source has only five categories (Court & Legal, Basic, Advanced,
  General, Education) — there is no finer per-term metadata, so the
  glossary cannot be split into Criminal / Civil / Family / Immigration /
  Evidence / Sentencing without inventing categories. Category counts are
  shown instead.
- Only 78 of the 994 terms carry a note, and none carries an example
  sentence. Terms show a note only when the source has one.

## Technical notes

- Vite 8 + React 19 + TypeScript + Tailwind v4, plain Vite SPA with hash
  routing, deployed to GitHub Pages. No Lovable, no server.
- The glossary itself is local data — no database, no sign-in. Supabase
  (main project) is used only for the two public forms: the newsletter
  signup (`collection_waitlist`, collection `lexipro-top-100`) and the
  contributor form (`lexipro_contributions`). Both are insert-only for the
  public, readable only by the site owner.
- The owner-email notification (`notifyOwner`) from the main site is a
  server function and cannot run in a static site; form rows are still
  saved and visible in the main site's Studio inbox.
- UI is English-only. Spanish appears only as the glossary terms and
  translations themselves — that is what LexiPro is.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # vitest
npm run lint     # oxlint
npm run build    # tsc + vite build
```

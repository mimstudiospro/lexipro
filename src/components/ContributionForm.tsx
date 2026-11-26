import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import { supabase } from "../lib/supabase";

/**
 * Contributor form, carried over from the main site's LexiPro page.
 * Lawyers and court interpreters submit terminology for editorial
 * review. Submissions are private and never publish automatically.
 *
 * One thing the static site cannot do: the main site's `notifyOwner`
 * email after a successful insert is a server function, so it is not
 * wired here. Rows still land in `lexipro_contributions` and are visible
 * in the main site's Studio inbox.
 */
const contributionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  profession: z.enum(["lawyer", "court_interpreter"]),
  english: z.string().trim().min(1).max(1000),
  spanish: z.string().trim().min(1).max(1000),
  context: z.string().trim().max(2000),
  source: z.string().trim().max(1000),
  consent: z.literal(true),
});

export function ContributionForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const parsed = contributionSchema.safeParse({
      ...values,
      consent: values.consent === "on",
    });
    if (!parsed.success) {
      setError(
        "Please complete both translations, your professional details, and consent.",
      );
      return;
    }
    if (!supabase) {
      setError("Contributions are unavailable right now. Please try again later.");
      return;
    }
    setBusy(true);
    try {
      const id = crypto.randomUUID();
      const result = await supabase
        .from("lexipro_contributions")
        .insert({ id, ...parsed.data });
      if (result.error) throw result.error;
      form.reset();
      setSent(true);
    } catch {
      setError("Could not send your contribution. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="py-8">
        <h3 className="headline text-2xl">Contribution received.</h3>
        <p className="mt-3 text-muted">
          Your submission is private and awaiting editorial review. It has
          not been added to the glossary.
        </p>
        <button
          type="button"
          className="mt-6 border border-ink px-6 py-3 text-sm font-semibold hover:bg-coral-soft"
          onClick={() => setSent(false)}
        >
          + Submit another contribution
        </button>
      </div>
    );
  }

  const fieldClass =
    "mt-2 w-full border border-ink bg-panel p-3 text-ink outline-none focus:border-coral";
  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm">
          Full name *
          <input
            name="name"
            required
            autoComplete="name"
            maxLength={120}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          Email *
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={255}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block text-sm">
        Professional role *
        <select name="profession" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Select
          </option>
          <option value="lawyer">Lawyer</option>
          <option value="court_interpreter">Court interpreter</option>
        </select>
      </label>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm">
          English term or phrase *
          <textarea
            name="english"
            lang="en"
            required
            rows={3}
            maxLength={1000}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          Spanish translation *
          <textarea
            name="spanish"
            lang="es"
            required
            rows={3}
            maxLength={1000}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block text-sm">
        Context, jurisdiction &amp; usage notes
        <textarea
          name="context"
          rows={3}
          maxLength={2000}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm">
        Source or reference (optional)
        <input name="source" maxLength={1000} className={fieldClass} />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 size-4 shrink-0"
        />
        <span>
          I am a lawyer or court interpreter and permit LexiPro to review,
          edit, and publish this contribution. I have not included
          confidential case information.
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="border border-ink bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Submit for review"}
      </button>
    </form>
  );
}

import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import { supabase } from "../lib/supabase";

const newsletterSchema = z.object({
  email: z.string().trim().email("Add a valid email address").max(255),
});

/**
 * Top 100 study guide: joins the studio newsletter, then reveals the
 * downloadable PDF. The direct download link stays visible regardless,
 * so visitors are never blocked if the newsletter table has not been
 * created yet.
 */
export function Top100Section() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = newsletterSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget).entries()),
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your email.");
      return;
    }
    if (!supabase) {
      setError("Newsletter signup is unavailable right now. The guide below still downloads.");
      return;
    }
    setStatus("sending");
    const submissionId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from("collection_waitlist")
      .insert({
        id: submissionId,
        collection: "lexipro-top-100",
        email: parsed.data.email.toLowerCase(),
      });
    // 23505 = already signed up; treat as success.
    if (insertError && insertError.code !== "23505") {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
      return;
    }
    setStatus("sent");
  }

  return (
    <section id="top-100" className="scroll-mt-48 border-t border-line bg-panel">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <p className="label text-coral">LexiPro · study guide</p>
        <h2 className="headline mt-4 text-3xl md:text-4xl">
          Top 100 Court Interpreting Terms
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          The first 100 Court &amp; Legal terms from the glossary, in one
          printable guide — English and Spanish, with notes. Join the studio
          newsletter and the download is yours.
        </p>
        {status === "sent" ? (
          <p
            role="status"
            className="mt-8 max-w-xl border border-ink bg-paper px-5 py-4 text-sm text-ink"
          >
            You&apos;re on the list — the guide is yours.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 max-w-xl" noValidate>
            <label htmlFor="top100-email" className="label text-muted">
              Join the newsletter
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="top100-email"
                name="email"
                type="email"
                required
                maxLength={255}
                autoComplete="email"
                placeholder="you@example.com"
                className="min-w-0 flex-1 border border-ink bg-paper px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-coral"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status === "sending"
                  ? "Joining…"
                  : "Join the newsletter & download the guide"}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-coral">
                {error}
              </p>
            )}
            <p className="mt-3 text-xs text-muted">
              Study guides and studio news, now and then. Nothing else.
            </p>
          </form>
        )}
        <p className="mt-6 text-sm">
          <a
            href="./top-100-court-interpreting-terms.pdf"
            download
            className="font-semibold text-ink underline underline-offset-4 hover:text-coral"
          >
            Download the PDF
          </a>
          <span className="text-muted">
            {" "}
            · 100 terms · English &amp; Spanish · printable
          </span>
        </p>
      </div>
    </section>
  );
}

import { useState } from "react";

/** Per-entry copy button: copies "EN — ES" plus the note when the
 * entry has one, for pasting into a brief or court document. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (older browser, no permission):
      // fall back to a temporary textarea selection.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        return;
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      aria-label="Copy term & definition"
      className="inline-flex items-center gap-1.5 border border-ink/30 px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-ink hover:text-ink"
    >
      {copied ? (
        <span aria-hidden="true">✓</span>
      ) : (
        <span aria-hidden="true">⧉</span>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

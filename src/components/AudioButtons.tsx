import { useState } from "react";
import { speak, ttsSupported } from "../lib/tts";

/**
 * Free audio for an entry: one button for English, one for Spanish.
 * Uses the browser's built-in speech synthesis — no audio files.
 */
export function AudioButtons({
  en,
  es,
}: {
  en: string;
  es: string;
}) {
  const [speaking, setSpeaking] = useState<"en" | "es" | null>(null);

  if (!ttsSupported()) return null;

  function onSpeak(which: "en" | "es") {
    const text = which === "en" ? en : es;
    if (text.trim() === "") return;
    speak(text, which === "en" ? "en-US" : "es-MX");
    setSpeaking(which);
    window.setTimeout(() => setSpeaking((s) => (s === which ? null : s)), 1500);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => onSpeak("en")}
        aria-label="Listen in English"
        className="inline-flex items-center gap-1 border border-ink/30 px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-ink hover:text-ink"
      >
        <span aria-hidden="true">▶</span> EN{speaking === "en" ? "…" : ""}
      </button>
      {es.trim() !== "" && (
        <button
          type="button"
          onClick={() => onSpeak("es")}
          aria-label="Listen in Spanish"
          className="inline-flex items-center gap-1 border border-ink/30 px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <span aria-hidden="true">▶</span> ES{speaking === "es" ? "…" : ""}
        </button>
      )}
    </span>
  );
}

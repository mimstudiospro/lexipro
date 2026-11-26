/**
 * Free text-to-speech audio for every glossary entry, via the browser's
 * built-in speech synthesis — the same "Speak EN / Speak ES" pattern the
 * leading rival uses. No audio files, no service, nothing to download.
 * Spanish defaults to a Mexican voice when the device has one, falling
 * back to any Spanish voice.
 */

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: "en-US" | "es-MX"): void {
  if (!ttsSupported() || text.trim() === "") return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const want = lang.slice(0, 2).toLowerCase();
  const voices = synth.getVoices();
  const voice =
    voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(want) &&
        v.lang.toLowerCase().includes("mx"),
    ) ?? voices.find((v) => v.lang.toLowerCase().startsWith(want));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

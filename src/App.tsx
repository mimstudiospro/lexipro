import { useEffect, useState } from "react";
import { anchorId, parseHash } from "./lib/routes";
import type { Route } from "./lib/routes";
import { HomePage } from "./components/HomePage";
import { TermPage } from "./components/TermPage";
import { StartHerePage } from "./components/StartHerePage";
import { QuizPage } from "./components/QuizPage";

function currentRoute(): Route {
  return parseHash(window.location.hash);
}

export default function App() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? { view: "home" } : currentRoute(),
  );

  useEffect(() => {
    function onHash() {
      const next = currentRoute();
      setRoute(next);
      // Section anchors on the home page (e.g. #contribute, #top-100):
      // the route stays "home" and we scroll to the section instead.
      const anchor = anchorId(window.location.hash);
      if (anchor) {
        window.setTimeout(() => {
          document.getElementById(anchor)?.scrollIntoView();
        }, 50);
      } else {
        window.scrollTo(0, 0);
      }
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <a href="#/" className="flex items-baseline gap-2">
            <span className="headline text-2xl">LexiPro</span>
            <span className="label hidden text-muted sm:inline">
              Court Spanish / English
            </span>
          </a>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <a href="#/" className="font-semibold hover:text-coral">
              Glossary
            </a>
            <a href="#/start-here" className="font-semibold hover:text-coral">
              Start here
            </a>
            <a href="#/quiz" className="font-semibold hover:text-coral">
              Practice
            </a>
            <a href="#top-100" className="font-semibold hover:text-coral">
              Top 100
            </a>
            <a href="#contribute" className="font-semibold hover:text-coral">
              Contribute
            </a>
          </nav>
        </div>
      </header>

      <main>
        {route.view === "home" && <HomePage />}
        {route.view === "term" && <TermPage slug={route.slug} />}
        {route.view === "start-here" && <StartHerePage />}
        {route.view === "quiz" && <QuizPage />}
      </main>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <p className="headline text-xl">LexiPro</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            A comprehensive bilingual glossary for court interpreters. Built
            in the booth, for the booth.
          </p>
          <p className="mt-6 text-sm">
            <a
              href="https://www.mimstudiospro.com"
              className="font-semibold underline underline-offset-4 hover:text-coral"
            >
              MIM Studios Pro
            </a>
            <span className="text-muted">
              {" "}
              ·{" "}
              <a
                href="https://lang.mimstudiospro.com"
                className="underline underline-offset-4 hover:text-coral"
              >
                Language services
              </a>
            </span>
          </p>
          <p className="mt-4 text-xs text-muted">
            LexiPro is a reference tool, not legal advice. Always render what
            the court actually says.
          </p>
        </div>
      </footer>
    </div>
  );
}

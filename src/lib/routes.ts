/** Hash routes for the app. Pure function of the hash string, so it
 * is unit-testable without a browser. */

export type Route =
  | { view: "home" }
  | { view: "term"; slug: string }
  | { view: "start-here" }
  | { view: "quiz" };

const SLUG = "[a-z0-9-]+";

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "");
  let match = path.match(new RegExp(`^term/(${SLUG})$`));
  if (match) return { view: "term", slug: match[1] };
  if (path === "start-here") return { view: "start-here" };
  if (path === "quiz") return { view: "quiz" };
  return { view: "home" };
}

/** Section anchors on the home page (e.g. #contribute, #top-100). */
export function anchorId(hash: string): string | null {
  const path = hash.replace(/^#\/?/, "");
  if (path === "" || path.startsWith("term/")) return null;
  if (path === "start-here" || path === "quiz") return null;
  return path;
}

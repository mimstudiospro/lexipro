import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True only when both env vars are set. */
export const supabaseConfigured = Boolean(url && key);

/**
 * Null when unconfigured — the app must not crash, it just cannot submit
 * the newsletter or contributor forms.
 *
 * No auth in v1: the source LexiPro page has no sign-in, and both forms
 * are public inserts (insert-only for the public, readable only by the
 * site owner), exactly as on the main site.
 */
export const supabase: SupabaseClient | null =
  supabaseConfigured && url && key ? createClient(url, key) : null;

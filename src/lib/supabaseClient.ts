import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Returns a browser-side Supabase client using the anon key.
 * Use this in components/hooks when direct Supabase access is needed.
 * For sensitive operations, prefer calling internal API routes.
 */
export function supabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Helpful for local dev misconfigurations
    // eslint-disable-next-line no-console
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Set them in your .env.local file.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

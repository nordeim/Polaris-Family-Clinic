import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabase URL is not set. Please configure NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.'
  );
}

/**
 * Server-side Supabase client using the service role key.
 * IMPORTANT: Only import and use this in server-side contexts (API routes, scripts).
 */
export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

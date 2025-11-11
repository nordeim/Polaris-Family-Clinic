import type { NextApiRequest } from 'next';
import { supabaseServer } from './supabaseServer';

/**
 * Extracts the Supabase user from an incoming API request.
 *
 * Looks for:
 * - Authorization: Bearer <access_token>
 * - sb-access-token cookie
 *
 * Assumes the token is a Supabase JWT (from Supabase Auth).
 */
export async function getUserFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  const cookieToken = req.cookies['sb-access-token'];

  const token = bearerToken || cookieToken;

  if (!token) return null;

  const { data, error } = await supabaseServer.auth.getUser(token);

  if (error || !data?.user) {
    return null;
  }

  return data.user;
}

/**
 * Ensures the request is authenticated.
 * Returns the Supabase user object, or throws an Error('UNAUTHORIZED').
 *
 * API route handlers should:
 * - Wrap in try/catch
 * - Return 401 when this throws
 */
export async function requireAuth(req: NextApiRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

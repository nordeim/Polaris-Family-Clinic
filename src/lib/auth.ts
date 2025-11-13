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

/**
 * Ensures the request is made by a staff/doctor/admin user.
 *
 * Behavior:
 * - Uses requireAuth to resolve the Supabase user.
 * - Looks up staff_profiles by user_id.
 * - Verifies role is one of: 'staff', 'doctor', 'admin'.
 *
 * Returns:
 * - { user, staffProfile } on success.
 *
 * Throws:
 * - Error('UNAUTHORIZED') if no valid Supabase user.
 * - Error('FORBIDDEN') if user is not in staff_profiles with required role.
 *
 * Usage:
 * - All staff-only API routes (e.g. /api/staff/*) MUST use requireStaff
 *   as the first gate before accessing sensitive clinic-wide data.
 */
export async function requireStaff(req: NextApiRequest) {
  const user = await requireAuth(req);

  const { data: staffProfile, error } = await supabaseServer
    .from('staff_profiles')
    .select('id, user_id, display_name, role')
    .eq('user_id', user.id)
    .single();

  if (error || !staffProfile) {
    throw new Error('FORBIDDEN');
  }

  if (!['staff', 'doctor', 'admin'].includes(staffProfile.role)) {
    throw new Error('FORBIDDEN');
  }

  return { user, staffProfile };
}

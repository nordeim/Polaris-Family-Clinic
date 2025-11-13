import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/appointments/mine.get
 *
 * Responsibilities:
 * - Return appointments belonging to the authenticated patient.
 * - Rely on:
 *   - Supabase Auth for identity.
 *   - patient_profiles.user_id mapping.
 *   - RLS on appointments for defense in depth.
 *
 * Behavior:
 * - 200: { appointments: [...] } with minimal fields for patient view.
 * - 401: if not authenticated.
 *
 * Notes:
 * - Only upcoming and recent appointments are relevant for patients.
 *   For MVP, we return all appointments linked to the caller, ordered by scheduled_start.
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let user;
  try {
    user = await requireAuth(req);
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    // Find patient_profile for this user
    const { data: profile, error: profileError } = await supabaseServer
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      // No profile ⇒ no appointments to show
      res.status(200).json({ appointments: [] });
      return;
    }

    // Fetch appointments for this patient.
    // RLS additionally ensures they only see their own.
    const { data, error } = await supabaseServer
      .from('appointments')
      .select(
        `
        id,
        scheduled_start,
        status,
        doctor:doctors ( name )
      `
      )
      .eq('patient_id', profile.id)
      .order('scheduled_start', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching patient appointments', error);
      res
        .status(500)
        .json({ error: 'Failed to load your appointments.' });
      return;
    }

    res.status(200).json({
      appointments: data || []
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in appointments.mine.get', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
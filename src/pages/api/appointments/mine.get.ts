import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * GET /api/appointments/mine.get
 *
 * Returns upcoming + past appointments for the authenticated patient,
 * scoped strictly to their own patient_profile.
 *
 * Security:
 * - Requires auth.
 * - Resolves patient_profiles.id by user_id = auth user id.
 * - Relies on RLS and explicit filtering.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end();
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
    // 1) Resolve patient_profile for this user
    const { data: profile, error: profileError } = await supabaseServer
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      // eslint-disable-next-line no-console
      console.error('Error fetching patient profile in appointments/mine:', profileError);
      res.status(500).json({ error: 'Failed to fetch appointments' });
      return;
    }

    if (!profile) {
      // No profile yet → no appointments
      res.status(200).json({ appointments: [] });
      return;
    }

    // 2) Fetch this patient's appointments
    const { data, error } = await supabaseServer
      .from('appointments')
      .select('id, scheduled_start, status, queue_number, doctor_id')
      .eq('patient_id', profile.id)
      .order('scheduled_start', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching patient appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
      return;
    }

    res.status(200).json({ appointments: data ?? [] });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in appointments/mine.get:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
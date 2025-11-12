import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * GET /api/patient/profile.get
 *
 * Returns the current patient's profile (masked NRIC), or null if not created.
 *
 * Security:
 * - Requires authenticated Supabase user.
 * - Uses user.id -> patient_profiles.user_id mapping.
 * - Relies on RLS plus explicit equality on user_id.
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
    const { data, error } = await supabaseServer
      .from('patient_profiles')
      .select('id, full_name, nric_masked, dob, language, chas_tier')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching patient profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
      return;
    }

    res.status(200).json({ profile: data || null });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in patient/profile.get:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
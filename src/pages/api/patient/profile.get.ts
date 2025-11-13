import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/patient/profile.get
 *
 * Responsibilities:
 * - Return the authenticated user's patient profile, if it exists.
 * - Never return raw NRIC.
 * - Shape response for direct consumption by /profile page.
 *
 * Response:
 * - 200 { profile: { id, full_name, nric_masked, dob, language, chas_tier } }
 * - 404 { error: 'Profile not found' } if no row exists.
 * - 401 { error: 'Unauthorized' } if unauthenticated.
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
    const { data, error } = await supabaseServer
      .from('patient_profiles')
      .select('id, full_name, nric_masked, dob, language, chas_tier')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.details?.includes('Results contain 0 rows')) {
        // No profile yet
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      // eslint-disable-next-line no-console
      console.error('Error fetching patient profile', error);
      res.status(500).json({ error: 'Failed to load profile' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.status(200).json({ profile: data });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in profile.get', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
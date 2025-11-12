import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { ProfileSchema } from '@/lib/validation';

/**
 * PUT /api/patient/profile.put
 *
 * Creates or updates the authenticated patient's profile.
 *
 * Responsibilities:
 * - Validate request body via ProfileSchema.
 * - Hash + mask NRIC securely.
 * - Upsert into patient_profiles for the current auth user.
 *
 * Security:
 * - Requires authenticated Supabase user.
 * - Uses NRIC_HASH_SECRET for deterministic hashing.
 * - Never returns raw NRIC.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
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

  const parseResult = ProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid input',
      details: parseResult.error.flatten()
    });
    return;
  }

  const { full_name, nric, dob, language, chas_tier } = parseResult.data;

  const secret = process.env.NRIC_HASH_SECRET;
  if (!secret) {
    // eslint-disable-next-line no-console
    console.error('NRIC_HASH_SECRET is not configured');
    res
      .status(500)
      .json({ error: 'Server configuration error (NRIC hashing not configured)' });
    return;
  }

  const nric_hash = crypto
    .createHmac('sha256', secret)
    .update(nric)
    .digest('hex');

  const nric_masked = maskNric(nric);

  try {
    const { data, error } = await supabaseServer
      .from('patient_profiles')
      .upsert(
        {
          user_id: user.id,
          full_name,
          nric_hash,
          nric_masked,
          dob,
          language,
          chas_tier
        },
        {
          onConflict: 'user_id'
        }
      )
      .select('id, full_name, nric_masked, dob, language, chas_tier')
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error upserting patient profile:', error);
      res.status(500).json({ error: 'Failed to save profile' });
      return;
    }

    res.status(200).json({ profile: data });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in patient/profile.put:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function maskNric(nric: string): string {
  if (nric.length <= 4) return '****';
  const first = nric.charAt(0);
  const last = nric.charAt(nric.length - 1);
  return `${first}******${last}`;
}
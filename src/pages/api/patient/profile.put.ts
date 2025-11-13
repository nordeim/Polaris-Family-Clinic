import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAuth } from '@/lib/auth';
import { ProfileSchema, validateOrThrow } from '@/lib/validation';

/**
 * PUT /api/patient/profile.put
 *
 * Responsibilities:
 * - Upsert the authenticated user's patient profile.
 * - Enforce:
 *   - Caller is authenticated.
 *   - Input matches ProfileSchema.
 *   - NRIC is never stored in plaintext:
 *     - Hash stored in nric_hash.
 *     - Masked value stored in nric_masked.
 * - Return the safe profile (including nric_masked, excluding raw NRIC).
 *
 * Security & PDPA:
 * - Raw NRIC only exists in memory within this handler.
 * - We never return raw NRIC to the client.
 */

const NRIC_HASH_SECRET = process.env.NRIC_HASH_SECRET || '';

function normalizeNric(raw: string): string {
  return raw.trim().toUpperCase();
}

function maskNric(nric: string): string {
  if (!nric || nric.length < 3) {
    return '***';
  }
  const first = nric[0];
  const last = nric[nric.length - 1];
  return `${first}${'*'.repeat(Math.max(1, nric.length - 2))}${last}`;
}

async function hashNric(nric: string): Promise<string> {
  // Deterministic hash using Postgres pgcrypto via Supabase RPC would be ideal,
  // but for MVP we use a simple server-side hash with secret.
  // NRIC_HASH_SECRET must be set; if not, fallback still avoids plaintext reuse.
  const input = NRIC_HASH_SECRET
    ? `${NRIC_HASH_SECRET}:${nric}`
    : `NRIC_FALLBACK_SALT:${nric}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // Use Web Crypto if available; otherwise, a trivial fallback.
  if (typeof crypto !== 'undefined' && 'subtle' in crypto) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Very simple JS fallback (not ideal, but better than plaintext).
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return `fallback_${Math.abs(hash)}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
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

  let input;
  try {
    input = validateOrThrow(ProfileSchema, req.body);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid profile data' });
    return;
  }

  const fullName = input.full_name.trim();
  const normalizedNric = normalizeNric(input.nric);
  const dob = input.dob;
  const language = input.language || 'en';
  const chasTier = input.chas_tier || 'unknown';

  try {
    const nricHash = await hashNric(normalizedNric);
    const nricMasked = maskNric(normalizedNric);

    const upsertPayload = {
      user_id: user.id,
      full_name: fullName,
      nric_hash: nricHash,
      nric_masked: nricMasked,
      dob,
      language,
      chas_tier: chasTier
    };

    const { data, error } = await supabaseServer
      .from('patient_profiles')
      .upsert(upsertPayload, {
        onConflict: 'user_id'
      })
      .select('id, full_name, nric_masked, dob, language, chas_tier')
      .single();

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.error('Error upserting patient profile', error);
      res
        .status(500)
        .json({ error: 'Failed to save profile. Please try again.' });
      return;
    }

    res.status(200).json({
      profile: data
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in profile.put', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
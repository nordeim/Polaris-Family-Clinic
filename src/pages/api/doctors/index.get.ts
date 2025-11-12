import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * GET /api/doctors/index.get
 *
 * Public endpoint.
 * Returns list of active doctors for booking:
 * - id
 * - name
 * - photo_url
 * - languages
 *
 * Backed by:
 * - doctors table (see database_schema.sql)
 * - RLS allows public SELECT on active doctors.
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

  try {
    const { data, error } = await supabaseServer
      .from('doctors')
      .select('id, name, photo_url, languages')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Failed to fetch doctors' });
      return;
    }

    res.status(200).json({ doctors: data ?? [] });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in doctors/index.get:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
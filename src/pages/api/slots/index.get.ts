import type { NextApiRequest, NextApiResponse } from 'next';
import { getAvailableSlots } from '@/lib/slots';

/**
 * GET /api/slots/index.get
 *
 * Query params:
 * - doctor_id (string, required)
 * - date (YYYY-MM-DD, required, clinic-local)
 *
 * Returns:
 * - { slots: { iso: string; label: string }[] }
 *
 * Logic:
 * - Delegates to getAvailableSlots(doctorId, date).
 * - That helper:
 *   - Reads clinic_settings for slot_duration_min.
 *   - Builds working-day slots (per PAD; implement there).
 *   - Filters out booked slots from appointments.
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

  const doctorId = String(req.query.doctor_id || '').trim();
  const date = String(req.query.date || '').trim();

  if (!doctorId || !date) {
    res.status(400).json({ error: 'doctor_id and date are required' });
    return;
  }

  try {
    const slots = await getAvailableSlots(doctorId, date);
    res.status(200).json({ slots });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error in slots/index.get:', e);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { assertStaff } from '@/lib/queue';

/**
 * GET /api/staff/appointments.get
 *
 * Staff-only endpoint:
 * - Returns today's appointments with patient + doctor display info.
 *
 * Response shape:
 * {
 *   appointments: Array<{
 *     id: string;
 *     scheduled_start: string;
 *     status: string;
 *     queue_number: string | null;
 *     patient_full_name: string;
 *     doctor_name: string;
 *   }>
 * }
 *
 * Security:
 * - requireAuth
 * - assertStaff(user.id) must succeed (role in staff|doctor|admin).
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

  let userId: string;
  try {
    const user = await requireAuth(req);
    userId = user.id as string;
    await assertStaff(userId);
  } catch (err: any) {
    if (err?.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const today = dayjs();
    const start = today.startOf('day').toISOString();
    const end = today.endOf('day').toISOString();

    const { data, error } = await supabaseServer
      .from('appointments')
      .select(
        `
        id,
        scheduled_start,
        status,
        queue_number,
        patient:patient_profiles(full_name),
        doctor:doctors(name)
      `
      )
      .gte('scheduled_start', start)
      .lte('scheduled_start', end)
      .order('scheduled_start', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching staff appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
      return;
    }

    const appointments =
      (data || []).map((row: any) => ({
        id: row.id,
        scheduled_start: row.scheduled_start,
        status: row.status,
        queue_number: row.queue_number,
        patient_full_name: row.patient?.full_name || 'Unknown',
        doctor_name: row.doctor?.name || 'Unknown'
      })) ?? [];

    res.status(200).json({ appointments });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in staff/appointments.get:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
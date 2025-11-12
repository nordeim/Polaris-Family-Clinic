import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { getNextQueueNumber, assertStaff } from '@/lib/queue';

/**
 * POST /api/staff/appointment-status.post
 *
 * Staff-only endpoint:
 * - Updates an appointment's status.
 * - On first transition to 'arrived', assigns a queue_number if missing.
 *
 * Request body:
 * {
 *   appointment_id: string (uuid),
 *   status: 'arrived' | 'in_consultation' | 'completed' | 'no_show'
 * }
 *
 * Response:
 * - 200 { success: true, queue_number?: string }
 * - Standard 4xx/5xx on errors.
 */

const StatusSchema = z.object({
  appointment_id: z.string().uuid(),
  status: z.enum(['arrived', 'in_consultation', 'completed', 'no_show'])
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end();
    return;
  }

  // Auth + staff check
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

  // Validate input
  const parsed = StatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid input',
      details: parsed.error.flatten()
    });
    return;
  }

  const { appointment_id, status } = parsed.data;

  try {
    // Fetch current appointment row
    const { data: appt, error: fetchError } = await supabaseServer
      .from('appointments')
      .select('id, doctor_id, scheduled_start, queue_number')
      .eq('id', appointment_id)
      .maybeSingle();

    if (fetchError || !appt) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    let queue_number = appt.queue_number as string | null;

    // Assign queue number on first arrival
    if (status === 'arrived' && !queue_number) {
      try {
        queue_number = await getNextQueueNumber(
          appt.doctor_id as string,
          appt.scheduled_start as string
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to compute next queue number:', e);
        res.status(500).json({ error: 'Failed to assign queue number' });
        return;
      }
    }

    // Update appointment status (and queue number if applicable)
    const { error: updateError } = await supabaseServer
      .from('appointments')
      .update({
        status,
        queue_number
      })
      .eq('id', appointment_id);

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error('Error updating appointment status:', updateError);
      res.status(500).json({ error: 'Failed to update status' });
      return;
    }

    res.status(200).json({ success: true, queue_number: queue_number || undefined });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in staff/appointment-status.post:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
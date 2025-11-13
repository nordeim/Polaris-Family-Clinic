import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireStaff } from '@/lib/auth';
import { getNextQueueNumber } from '@/lib/queue';

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
 *
 * Security:
 * - requireStaff(req): user must be staff|doctor|admin.
 * - DB-level RLS as defense in depth.
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
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Auth + staff check via central helper
  try {
    await requireStaff(req);
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (err?.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    // eslint-disable-next-line no-console
    console.error(
      'Error in requireStaff for staff/appointment-status.post',
      err
    );
    res.status(500).json({ error: 'Internal server error' });
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
      .select('id, doctor_id, scheduled_start, status, queue_number')
      .eq('id', appointment_id)
      .maybeSingle();

    if (fetchError || !appt) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Handle 'arrived': idempotent queue assignment
    if (status === 'arrived') {
      // If already arrived with queue number, be idempotent
      if (appt.status === 'arrived' && appt.queue_number) {
        res.status(200).json({
          success: true,
          queue_number: appt.queue_number
        });
        return;
      }

      let queue_number = appt.queue_number as string | null;

      if (!queue_number) {
        try {
          queue_number = await getNextQueueNumber(
            appt.doctor_id as string,
            appt.scheduled_start as string
          );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(
            'Failed to compute next queue number:',
            e
          );
          res
            .status(500)
            .json({ error: 'Failed to assign queue number' });
          return;
        }
      }

      const { error: updateError } = await supabaseServer
        .from('appointments')
        .update({
          status: 'arrived',
          queue_number
        })
        .eq('id', appointment_id);

      if (updateError) {
        // eslint-disable-next-line no-console
        console.error(
          'Error updating appointment status to arrived:',
          updateError
        );
        res.status(500).json({ error: 'Failed to update status' });
        return;
      }

      res.status(200).json({
        success: true,
        queue_number: queue_number || undefined
      });
      return;
    }

    // Other statuses: simple update, queue_number unchanged
    const { error: updateError } = await supabaseServer
      .from('appointments')
      .update({
        status
      })
      .eq('id', appointment_id);

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error(
        'Error updating appointment status:',
        updateError
      );
      res.status(500).json({ error: 'Failed to update status' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      'Unexpected error in staff/appointment-status.post:',
      e
    );
    res.status(500).json({ error: 'Internal server error' });
  }
}
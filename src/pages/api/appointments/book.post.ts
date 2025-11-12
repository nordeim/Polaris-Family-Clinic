import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { BookAppointmentSchema } from '@/lib/validation';

/**
 * POST /api/appointments/book.post
 *
 * Body:
 * - doctor_id: string (uuid)
 * - scheduled_start: string (ISO datetime)
 *
 * Behavior:
 * - Auth required.
 * - Validates input with BookAppointmentSchema.
 * - Ensures a patient_profiles row exists for the caller.
 * - Inserts a new appointment in "booked" status.
 * - Returns the created appointment.
 *
 * Notes:
 * - Queue number is assigned later when staff marks "arrived".
 * - Twilio notifications are integrated in a later phase via notifications.ts.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
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

  const parsed = BookAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid input',
      details: parsed.error.flatten()
    });
    return;
  }

  const { doctor_id, scheduled_start } = parsed.data;
  const start = dayjs(scheduled_start);
  if (!start.isValid()) {
    res.status(400).json({ error: 'Invalid scheduled_start' });
    return;
  }

  try {
    // Ensure patient_profile exists
    const { data: profile, error: profileError } = await supabaseServer
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      res.status(400).json({ error: 'Patient profile not found' });
      return;
    }

    // Create appointment
    const { data: appt, error: apptError } = await supabaseServer
      .from('appointments')
      .insert({
        patient_id: profile.id,
        doctor_id,
        scheduled_start: start.toISOString(),
        status: 'booked'
      })
      .select('id, patient_id, doctor_id, scheduled_start, status, queue_number')
      .single();

    if (apptError || !appt) {
      // eslint-disable-next-line no-console
      console.error('Error creating appointment:', apptError);
      res.status(500).json({ error: 'Failed to create appointment' });
      return;
    }

    res.status(201).json({
      success: true,
      appointment: appt
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in appointments/book.post:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
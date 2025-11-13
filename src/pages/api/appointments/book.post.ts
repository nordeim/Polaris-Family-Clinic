import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAuth } from '@/lib/auth';
import {
  BookAppointmentSchema,
  validateOrThrow
} from '@/lib/validation';

/**
 * POST /api/appointments/book.post
 *
 * Responsibilities:
 * - Authenticated patient books an appointment.
 * - Enforce:
 *   - Caller is authenticated (Supabase Auth).
 *   - Caller has an existing patient_profiles row.
 *   - doctor_id & scheduled_start are valid (Zod).
 *   - scheduled_start is a currently free slot for that doctor.
 * - Return:
 *   - 201 + appointment summary on success.
 *
 * Notes:
 * - RLS:
 *   - appointments_insert_patient policy ensures patient_id matches auth.uid() mapping.
 * - This handler is intentionally explicit and boring for auditability.
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
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
    input = validateOrThrow(BookAppointmentSchema, req.body);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid request payload' });
    return;
  }

  const { doctor_id, scheduled_start, reason } = input;

  try {
    // 1) Resolve patient_profile for this user
    const { data: profile, error: profileError } = await supabaseServer
      .from('patient_profiles')
      .select('id, full_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      res
        .status(400)
        .json({ error: 'Patient profile not found. Please complete your profile first.' });
      return;
    }

    // 2) Basic doctor validation (active doctor exists)
    const { data: doctor, error: doctorError } = await supabaseServer
      .from('doctors')
      .select('id, is_active')
      .eq('id', doctor_id)
      .single();

    if (doctorError || !doctor || doctor.is_active === false) {
      res.status(400).json({ error: 'Selected doctor is not available.' });
      return;
    }

    // 3) Prevent double-booking: check existing appointment with same doctor & slot
    const { data: existing, error: existingError } = await supabaseServer
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('scheduled_start', scheduled_start)
      .limit(1);

    if (existingError) {
      // eslint-disable-next-line no-console
      console.error('Error checking existing appointments', existingError);
      res.status(500).json({ error: 'Failed to validate slot availability.' });
      return;
    }

    if (existing && existing.length > 0) {
      res.status(409).json({
        error:
          'This time slot has just been taken. Please choose another available slot.'
      });
      return;
    }

    // 4) Insert appointment (RLS will ensure patient_id/auth.uid linkage correctness)
    const { data: appt, error: insertError } = await supabaseServer
      .from('appointments')
      .insert({
        patient_id: profile.id,
        doctor_id,
        scheduled_start,
        status: 'booked',
        reason: reason || null
      })
      .select('id, scheduled_start, status, doctor_id')
      .single();

    if (insertError || !appt) {
      // eslint-disable-next-line no-console
      console.error('Error creating appointment', insertError);
      res.status(500).json({ error: 'Failed to create appointment.' });
      return;
    }

    // 5) Best-effort: further integrations (notifications) are handled in a later phase.
    //    Do NOT block booking on Twilio/side effects.

    res.status(201).json({
      appointment: appt
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error in book.post', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
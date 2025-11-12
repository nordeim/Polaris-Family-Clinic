import dayjs from 'dayjs';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * getNextQueueNumber
 *
 * Compute the next queue number for a given doctor on the day of `datetime`.
 *
 * Format:
 * - A001, A002, ...
 *
 * Rules:
 * - Scope is per doctor per calendar day (clinic-local assumption).
 * - Looks at existing appointments.queue_number for that doctor/day.
 * - If none: A001.
 * - Else: increment the highest numeric suffix.
 *
 * Notes:
 * - Uses supabaseServer (service role) and is intended only in server/API contexts.
 * - Deterministic and simple by design; do not add "smart" behavior.
 */
export async function getNextQueueNumber(
  doctorId: string,
  datetime: string
): Promise<string> {
  if (!doctorId || !datetime) {
    throw new Error('doctorId and datetime are required');
  }

  const day = dayjs(datetime);
  if (!day.isValid()) {
    throw new Error('Invalid datetime for queue number calculation');
  }

  const dayStart = day.startOf('day').toISOString();
  const dayEnd = day.endOf('day').toISOString();

  const { data, error } = await supabaseServer
    .from('appointments')
    .select('queue_number')
    .eq('doctor_id', doctorId)
    .gte('scheduled_start', dayStart)
    .lte('scheduled_start', dayEnd);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching existing queue numbers:', error);
    throw new Error('Failed to compute queue number');
  }

  const existing = (data || [])
    .map((row: { queue_number: string | null }) => row.queue_number)
    .filter((q): q is string => Boolean(q));

  if (existing.length === 0) {
    return 'A001';
  }

  const maxNum = Math.max(
    ...existing.map((q) => {
      const numeric = parseInt(q.replace(/\D/g, '') || '0', 10);
      return Number.isNaN(numeric) ? 0 : numeric;
    })
  );

  const next = (maxNum + 1).toString().padStart(3, '0');
  return `A${next}`;
}

/**
 * assertStaff
 *
 * Shared helper for staff-only API routes (Phase 3).
 * Checks if the given userId has a staff_profiles row with role in:
 * - staff, doctor, admin
 *
 * Throws:
 * - Error('FORBIDDEN') if not staff.
 */
export async function assertStaff(userId: string): Promise<void> {
  const { data, error } = await supabaseServer
    .from('staff_profiles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data || !['staff', 'doctor', 'admin'].includes(data.role)) {
    throw new Error('FORBIDDEN');
  }
}
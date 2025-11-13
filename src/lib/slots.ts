import dayjs from 'dayjs';
import { supabaseServer } from './supabaseServer';

/**
 * Slot calculation helpers
 *
 * Responsibilities:
 * - Generate available appointment slots for a given doctor and date.
 * - Respect:
 *   - clinic_settings.slot_duration_min
 *   - clinic_settings.booking_window_days
 *   - Basic clinic hours (configurable here if not stored per-doctor).
 * - Exclude:
 *   - Slots already occupied in appointments.
 *
 * Notes:
 * - Keep deliberately simple and transparent.
 * - All times are treated in Asia/Singapore timezone context.
 */

const DEFAULT_OPEN_HOURS = [
  // Morning session
  { start: '08:30', end: '13:00' },
  // Afternoon session
  { start: '14:00', end: '17:30' }
];

type ClinicSettings = {
  slot_duration_min: number;
  booking_window_days: number;
};

/**
 * Load clinic-wide settings once per call.
 */
async function getClinicSettings(): Promise<ClinicSettings> {
  const { data, error } = await supabaseServer
    .from('clinic_settings')
    .select('slot_duration_min, booking_window_days')
    .limit(1)
    .single();

  if (error || !data) {
    // Fallback to safe defaults if settings not configured.
    return {
      slot_duration_min: 15,
      booking_window_days: 7
    };
  }

  return {
    slot_duration_min: data.slot_duration_min ?? 15,
    booking_window_days: data.booking_window_days ?? 7
  };
}

/**
 * Fetch existing appointments for the doctor on that date.
 */
async function getExistingAppointmentsForDay(doctorId: string, dayStartIso: string, dayEndIso: string) {
  const { data, error } = await supabaseServer
    .from('appointments')
    .select('scheduled_start')
    .eq('doctor_id', doctorId)
    .gte('scheduled_start', dayStartIso)
    .lt('scheduled_start', dayEndIso);

  if (error) {
    throw error;
  }

  return (data || []).map((row) => row.scheduled_start as string);
}

/**
 * Generate slot start timestamps between given bounds.
 */
function generateSlotsForDay(
  date: dayjs.Dayjs,
  settings: ClinicSettings
): string[] {
  const slots: string[] = [];
  const tzDate = date; // Dayjs default; assume server already in Asia/Singapore context.

  for (const session of DEFAULT_OPEN_HOURS) {
    let cursor = tzDate
      .hour(parseInt(session.start.split(':')[0], 10))
      .minute(parseInt(session.start.split(':')[1], 10))
      .second(0)
      .millisecond(0);

    const sessionEnd = tzDate
      .hour(parseInt(session.end.split(':')[0], 10))
      .minute(parseInt(session.end.split(':')[1], 10))
      .second(0)
      .millisecond(0);

    while (cursor.add(settings.slot_duration_min, 'minute').isBefore(sessionEnd.add(1, 'minute'))) {
      slots.push(cursor.toISOString());
      cursor = cursor.add(settings.slot_duration_min, 'minute');
    }
  }

  return slots;
}

/**
 * getAvailableSlots
 *
 * - doctorId: UUID of doctor.
 * - dateStr: 'YYYY-MM-DD' in clinic timezone (Asia/Singapore).
 *
 * Returns ISO strings suitable for client-side formatting.
 */
export async function getAvailableSlots(doctorId: string, dateStr: string): Promise<string[]> {
  if (!doctorId || !dateStr) {
    return [];
  }

  const settings = await getClinicSettings();

  const today = dayjs().startOf('day');
  const target = dayjs(dateStr, 'YYYY-MM-DD').startOf('day');

  // Enforce booking window
  if (
    target.isBefore(today) ||
    target.diff(today, 'day') > settings.booking_window_days
  ) {
    return [];
  }

  const dayStart = target.toISOString();
  const dayEnd = target.add(1, 'day').toISOString();

  const allSlots = generateSlotsForDay(target, settings);
  if (!allSlots.length) return [];

  const existing = await getExistingAppointmentsForDay(
    doctorId,
    dayStart,
    dayEnd
  );

  const taken = new Set(
    existing.map((iso) => dayjs(iso).toISOString())
  );

  // Filter out any slot that exactly matches an existing appointment.
  // This is simple but effective for MVP.
  return allSlots.filter((slotIso) => !taken.has(slotIso));
}
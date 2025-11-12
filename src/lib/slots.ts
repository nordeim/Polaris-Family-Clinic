import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { supabaseServer } from '@/lib/supabaseServer';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Slot model returned by getAvailableSlots.
 */
export type Slot = {
  iso: string; // ISO datetime in UTC
  label: string; // Human readable label in clinic local time, e.g. "09:00"
};

/**
 * getAvailableSlots
 *
 * Compute available appointment slots for a given doctor on a specific date,
 * based on:
 * - clinic_settings.slot_duration_min
 * - fixed working hours (MVP-simple)
 * - existing booked appointments
 *
 * Notes:
 * - Timezone defaults to 'Asia/Singapore' or the value in clinic_settings.timezone.
 * - Non-goal: complex rosters; this is intentionally simple and deterministic.
 * - Uses service-role supabaseServer in a controlled, server-only context.
 */
export async function getAvailableSlots(
  doctorId: string,
  date: string
): Promise<Slot[]> {
  if (!doctorId || !date) {
    throw new Error('doctorId and date are required');
  }

  // 1) Load clinic settings for slot duration and timezone
  const { data: settings, error: settingsError } = await supabaseServer
    .from('clinic_settings')
    .select('slot_duration_min, timezone')
    .limit(1)
    .maybeSingle();

  if (settingsError) {
    // eslint-disable-next-line no-console
    console.error('Failed to load clinic_settings:', settingsError);
    throw new Error('Failed to load clinic settings');
  }

  const slotDurationMin = settings?.slot_duration_min ?? 15;
  const tz = settings?.timezone || 'Asia/Singapore';

  // 2) Define working hours for MVP (can be tuned later or made configurable)
  // For now: 09:00–12:00 and 14:00–17:00 clinic-local.
  const day = dayjs.tz(date, 'YYYY-MM-DD', tz);
  if (!day.isValid()) {
    throw new Error('Invalid date format, expected YYYY-MM-DD');
  }

  const windows: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [
    {
      start: day.hour(9).minute(0).second(0).millisecond(0),
      end: day.hour(12).minute(0).second(0).millisecond(0)
    },
    {
      start: day.hour(14).minute(0).second(0).millisecond(0),
      end: day.hour(17).minute(0).second(0).millisecond(0)
    }
  ];

  // 3) Load existing appointments for that doctor/day to exclude booked slots
  const startOfDayUtc = windows[0].start.utc().toISOString();
  const endOfDayUtc = windows[windows.length - 1].end.utc().toISOString();

  const { data: appts, error: apptsError } = await supabaseServer
    .from('appointments')
    .select('scheduled_start, status')
    .eq('doctor_id', doctorId)
    .gte('scheduled_start', startOfDayUtc)
    .lte('scheduled_start', endOfDayUtc);

  if (apptsError) {
    // eslint-disable-next-line no-console
    console.error('Failed to load existing appointments:', apptsError);
    throw new Error('Failed to load appointments');
  }

  // Treat booked + arrived + in_consultation as occupying a slot.
  const occupiedIso = new Set(
    (appts || [])
      .filter((a) =>
        ['booked', 'arrived', 'in_consultation'].includes(a.status)
      )
      .map((a) => normalizeToSlotIso(a.scheduled_start, tz, slotDurationMin))
      .filter((v): v is string => Boolean(v))
  );

  // 4) Generate candidate slots and filter out occupied ones
  const slots: Slot[] = [];

  for (const { start, end } of windows) {
    let current = start.clone();

    while (current.isBefore(end)) {
      const isoUtc = current.clone().utc().toISOString();
      const label = current.format('HH:mm');

      const key = normalizeToSlotIso(isoUtc, tz, slotDurationMin);
      if (key && !occupiedIso.has(key)) {
        slots.push({ iso: isoUtc, label });
      }

      current = current.add(slotDurationMin, 'minute');
    }
  }

  return slots;
}

/**
 * Normalize a datetime into a canonical slot iso string (UTC) based on:
 * - Given timezone
 * - Slot duration
 *
 * This ensures both generation and occupancy checks snap to the same grid.
 */
function normalizeToSlotIso(
  iso: string,
  tz: string,
  slotDurationMin: number
): string | null {
  const m = dayjs(iso).tz(tz);
  if (!m.isValid()) return null;

  const minutesFromStart = m.hour() * 60 + m.minute();
  const snapped = Math.floor(minutesFromStart / slotDurationMin) * slotDurationMin;

  const snappedMoment = m
    .startOf('day')
    .add(snapped, 'minute')
    .second(0)
    .millisecond(0);

  return snappedMoment.utc().toISOString();
}
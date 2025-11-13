import { useEffect, useState } from 'react';
import { Alert, Button, Loader, Select, Stack, Text, Textarea } from '@mantine/core';
import dayjs from 'dayjs';

type Doctor = {
  id: string;
  name: string;
};

type SlotOption = {
  value: string;
  label: string;
};

type ApiError = {
  error?: string;
  message?: string;
};

function formatSlotLabel(iso: string) {
  const d = dayjs(iso);
  return d.format('ddd, D MMM YYYY · h:mm A');
}

/**
 * BookingForm
 *
 * Client-side form for selecting:
 * - doctor
 * - date
 * - time slot
 * - optional reason
 *
 * Relies on internal APIs:
 * - GET /api/doctors
 * - GET /api/slots?doctor_id=&date=
 * - POST /api/appointments/book
 *
 * This is intentionally boring, explicit, senior-friendly.
 */
export function BookingForm() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [date, setDate] = useState<string>('');
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load doctors on mount
  useEffect(() => {
    let cancelled = false;
    async function loadDoctors() {
      try {
        setLoadingDoctors(true);
        const res = await fetch('/api/doctors');
        if (!res.ok) {
          throw new Error('Unable to load doctors');
        }
        const data = await res.json();
        if (!cancelled) {
          setDoctors(data.doctors || data || []);
        }
      } catch (e) {
        if (!cancelled) {
          setErrorMessage(
            'Unable to load doctors right now. Please refresh or try again shortly.'
          );
        }
      } finally {
        if (!cancelled) setLoadingDoctors(false);
      }
    }
    void loadDoctors();
    return () => {
      cancelled = true;
    };
  }, []);

  // When doctor or date changes, fetch slots
  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      setSlot(null);
      return;
    }

    let cancelled = false;
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setErrorMessage(null);
        setSlots([]);
        setSlot(null);

        const params = new URLSearchParams({
          doctor_id: doctorId ?? '',
          date
        });
        const res = await fetch(`/api/slots?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Unable to load slots');
        }
        const data = await res.json();
        if (cancelled) return;

        const options: SlotOption[] = (data.slots || []).map((iso: string) => ({
          value: iso,
          label: formatSlotLabel(iso)
        }));

        setSlots(options);
      } catch (e) {
        if (!cancelled) {
          setErrorMessage(
            'Unable to load available time slots. Please adjust your selection or try again.'
          );
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [doctorId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!doctorId || !slot) {
      setErrorMessage('Please choose a doctor and time slot to continue.');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/appointments/book.post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          scheduled_start: slot,
          reason: reason.trim() || undefined
        })
      });

      if (!res.ok) {
        const data: ApiError = await res.json().catch(() => ({}));
        if (res.status === 409 || (data.error || '').toLowerCase().includes('slot')) {
          setErrorMessage(
            'That time was just taken. Please pick another available slot.'
          );
        } else if (res.status === 400) {
          setErrorMessage(
            data.error ||
              'Some details were invalid. Please review your selections and try again.'
          );
        } else if (res.status === 401) {
          setErrorMessage(
            'Your session seems to have expired. Please sign in again to continue.'
          );
        } else {
          setErrorMessage(
            data.error ||
              data.message ||
              'We could not create your booking. Please try again or contact the clinic.'
          );
        }
        return;
      }

      const data = await res.json();
      setSuccessMessage(
        `Your appointment is confirmed for ${formatSlotLabel(
          data.appointment?.scheduled_start || slot
        )}.`
      );
      // Reset slot/reason to avoid duplicate submissions; keep doctor/date.
      setReason('');
      setSlot(null);
    } catch (e) {
      setErrorMessage(
        'Network issue while creating your booking. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const doctorOptions =
    doctors.map((d) => ({
      value: d.id,
      label: d.name
    })) ?? [];

  const today = dayjs().format('YYYY-MM-DD');

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        {errorMessage && (
          <Alert color="red" title="Booking issue">
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert color="green" title="Booking confirmed">
            {successMessage}
          </Alert>
        )}

        {/* Doctor select */}
        <div>
          <Text fw={500} mb={4}>
            Select doctor
          </Text>
          {loadingDoctors ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading doctors…
              </Text>
            </div>
          ) : (
            <Select
              data={doctorOptions}
              placeholder="Choose a doctor"
              value={doctorId}
              onChange={setDoctorId}
              nothingFoundMessage="No doctors available"
              size="md"
              searchable={doctorOptions.length > 5}
              disabled={submitting || doctorOptions.length === 0}
            />
          )}
        </div>

        {/* Date select (simple for MVP: today + some days via native input) */}
        <div>
          <Text fw={500} mb={4}>
            Choose date
          </Text>
          <input
            type="date"
            className="field-input"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting || doctorOptions.length === 0}
          />
          <Text size="xs" c="dimmed" mt={4}>
            Only valid clinic days/times will show available slots.
          </Text>
        </div>

        {/* Slots */}
        <div>
          <Text fw={500} mb={4}>
            Choose time slot
          </Text>
          {loadingSlots && doctorId && date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading available slots…
              </Text>
            </div>
          )}
          {!loadingSlots && slots.length === 0 && doctorId && date && (
            <Text size="sm" c="dimmed">
              No available slots for this doctor on the selected date. Please choose another date or
              doctor.
            </Text>
          )}
          {!loadingSlots && slots.length > 0 && (
            <Select
              data={slots}
              placeholder="Select a time"
              value={slot}
              onChange={setSlot}
              size="md"
              disabled={submitting}
            />
          )}
        </div>

        {/* Reason */}
        <div>
          <Text fw={500} mb={4}>
            Reason for visit (optional)
          </Text>
          <Textarea
            placeholder="E.g. Cough and fever for 3 days"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            minRows={2}
            maxRows={4}
            disabled={submitting}
          />
        </div>

        {/* Submit */}
        <div style={{ marginTop: '0.5rem' }}>
          <Button
            type="submit"
            className="ui-btn ui-btn--primary ui-btn--lg ui-btn--full"
            disabled={submitting || !doctorId || !slot}
          >
            {submitting ? 'Booking your appointment…' : 'Confirm booking'}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
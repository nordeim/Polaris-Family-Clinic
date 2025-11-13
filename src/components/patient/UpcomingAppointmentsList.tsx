import { useEffect, useState } from 'react';
import { Alert, Loader, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

type Appointment = {
  id: string;
  scheduled_start: string;
  status: string;
  doctor?: {
    name?: string;
  };
};

type Props = {
  /**
   * Optional: hide the header block and only render the list.
   */
  compact?: boolean;
};

/**
 * UpcomingAppointmentsList
 *
 * Responsibilities:
 * - Fetch the current patient's upcoming appointments from /api/appointments/mine.get.
 * - Render them in a simple, senior-friendly list.
 * - Provide clear messaging when there are no upcoming visits.
 *
 * Notes:
 * - Requires the user to be authenticated; otherwise API should return 401.
 * - This is read-only; staff actions happen via staff console.
 */
export function UpcomingAppointmentsList({ compact }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/appointments/mine.get');
        if (!res.ok) {
          if (res.status === 401) {
            // Not signed in; treat as no data but don't scare user.
            if (!cancelled) {
              setAppointments([]);
              setError(
                'Sign in to see your upcoming appointments.'
              );
            }
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load appointments');
        }
        const data = await res.json();
        if (cancelled) return;
        setAppointments(data.appointments || []);
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.message || 'Unable to load your appointments right now.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!compact) {
    return (
      <Stack gap="sm">
        <Title order={3}>Your upcoming visits</Title>
        <Text size="sm" c="dimmed">
          Check your confirmed appointments here. Queue numbers will be assigned when you arrive at the clinic.
        </Text>
        <UpcomingAppointmentsInner
          appointments={appointments}
          loading={loading}
          error={error}
        />
      </Stack>
    );
  }

  return (
    <UpcomingAppointmentsInner
      appointments={appointments}
      loading={loading}
      error={error}
    />
  );
}

type InnerProps = {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
};

function UpcomingAppointmentsInner({
  appointments,
  loading,
  error
}: InnerProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Loading your appointments…
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="red">
        {error}
      </Alert>
    );
  }

  if (!appointments.length) {
    return (
      <Text size="sm" c="dimmed">
        You have no upcoming appointments yet. Book a slot to see it listed here.
      </Text>
    );
  }

  return (
    <div className="ui-card">
      <Stack gap="xs">
        {appointments.map((appt) => {
          const when = dayjs(appt.scheduled_start);
          const dateStr = when.format('ddd, D MMM YYYY');
          const timeStr = when.format('h:mm A');
          const doctorName = appt.doctor?.name || 'Doctor';

          return (
            <div
              key={appt.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '0.4rem 0',
                borderBottom: '1px solid rgba(209,213,219,0.4)'
              }}
            >
              <Text fw={500}>
                {doctorName}
              </Text>
              <Text size="sm">
                {dateStr} at {timeStr}
              </Text>
              <Text size="xs" c="dimmed">
                Status: {appt.status}
              </Text>
            </div>
          );
        })}
      </Stack>
    </div>
  );
}
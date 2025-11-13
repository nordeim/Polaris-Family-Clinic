import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  Container,
  Loader,
  Stack,
  Table,
  Title,
  Text,
  Badge,
  Group,
  Button
} from '@mantine/core';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { UiButton } from '@/components/ui/button';
import { supabaseClient } from '@/lib/supabaseClient';

/**
 * /staff/appointments
 *
 * Staff Portal – Today’s Appointments & Queue Management (MVP)
 *
 * Goals:
 * - Single-screen view of today's appointments.
 * - Staff/doctor/admin only (enforced via /api/staff/* + requireStaff).
 * - Clear actions to:
 *   - Mark Arrived (assign queue number if needed).
 *   - Mark In Consultation.
 *   - Mark Completed / No Show.
 * - Complement the patient booking flow without adding complexity.
 *
 * Notes:
 * - This page is intentionally client-side:
 *   - Uses Supabase browser client to confirm there is a session.
 *   - Relies on backend `/api/staff/appointments.get` and
 *     `/api/staff/appointment-status.post` for authorization + data.
 * - If the user is not staff, APIs return 403, surfaced as a clear message.
 */

type StaffAppointment = {
  id: string;
  scheduled_start: string;
  status: 'booked' | 'arrived' | 'in_consultation' | 'completed' | 'no_show' | string;
  queue_number: string | null;
  patient_full_name: string;
  doctor_name: string;
};

type StatusAction = 'arrived' | 'in_consultation' | 'completed' | 'no_show';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function StatusBadge({ status }: { status: StaffAppointment['status'] }) {
  const map: Record<string, { color: string; label: string }> = {
    booked: { color: 'gray', label: 'Booked' },
    arrived: { color: 'blue', label: 'Arrived' },
    in_consultation: { color: 'yellow', label: 'In Consultation' },
    completed: { color: 'green', label: 'Completed' },
    no_show: { color: 'red', label: 'No Show' }
  };
  const cfg = map[status] || { color: 'gray', label: status };
  return (
    <Badge color={cfg.color} variant="light">
      {cfg.label}
    </Badge>
  );
}

function QueueControls({
  appt,
  onUpdate
}: {
  appt: StaffAppointment;
  onUpdate: (id: string, action: StatusAction) => Promise<void>;
}) {
  const disabled = appt.status === 'completed' || appt.status === 'no_show';

  if (disabled) {
    return <Text size="xs" c="dimmed">No further actions</Text>;
  }

  const actions: { label: string; action: StatusAction; visible: boolean }[] = [
    {
      label: 'Mark Arrived',
      action: 'arrived',
      visible: appt.status === 'booked'
    },
    {
      label: 'In Consultation',
      action: 'in_consultation',
      visible: appt.status === 'arrived'
    },
    {
      label: 'Completed',
      action: 'completed',
      visible: appt.status === 'in_consultation'
    },
    {
      label: 'No Show',
      action: 'no_show',
      visible: appt.status === 'booked' || appt.status === 'arrived'
    }
  ];

  return (
    <Group gap={4} wrap="wrap">
      {actions
        .filter((a) => a.visible)
        .map((a) => (
          <Button
            key={a.action}
            size="compact-xs"
            variant={a.action === 'completed' ? 'filled' : 'outline'}
            color={
              a.action === 'no_show'
                ? 'red'
                : a.action === 'in_consultation'
                ? 'yellow'
                : a.action === 'arrived'
                ? 'blue'
                : 'green'
            }
            onClick={() => onUpdate(appt.id, a.action)}
          >
            {a.label}
          </Button>
        ))}
    </Group>
  );
}

function TodayAppointmentsTable({
  appointments,
  onUpdate
}: {
  appointments: StaffAppointment[];
  onUpdate: (id: string, action: StatusAction) => Promise<void>;
}) {
  if (!appointments.length) {
    return (
      <Text size="sm" c="dimmed">
        No appointments found for today.
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Time</Table.Th>
          <Table.Th>Queue</Table.Th>
          <Table.Th>Patient</Table.Th>
          <Table.Th>Doctor</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th style={{ width: 220 }}>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {appointments.map((appt) => (
          <Table.Tr key={appt.id}>
            <Table.Td>{formatTime(appt.scheduled_start)}</Table.Td>
            <Table.Td>
              {appt.queue_number ? (
                <Badge color="blue" variant="filled">
                  {appt.queue_number}
                </Badge>
              ) : (
                <Text size="xs" c="dimmed">
                  —
                </Text>
              )}
            </Table.Td>
            <Table.Td>{appt.patient_full_name}</Table.Td>
            <Table.Td>{appt.doctor_name}</Table.Td>
            <Table.Td>
              <StatusBadge status={appt.status} />
            </Table.Td>
            <Table.Td>
              <QueueControls appt={appt} onUpdate={onUpdate} />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

export default function StaffAppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<StaffAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  async function fetchAppointments() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/staff/appointments.get');
      if (res.status === 401 || res.status === 403) {
        setUnauthorized(true);
        setAppointments([]);
        return;
      }
      if (!res.ok) {
        setError('Unable to load today’s appointments.');
        return;
      }
      const data = (await res.json()) as { appointments: StaffAppointment[] };
      setAppointments(data.appointments || []);
    } catch (e: any) {
      setError('Unable to load today’s appointments.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    // First ensure there is a Supabase session; if not, surface unauthorized hint.
    const supabase = supabaseClient();
    let cancelled = false;

    async function bootstrap() {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!session) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        await fetchAppointments();
      } catch {
        if (!cancelled) {
          setError('Unable to verify staff session.');
          setLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUpdateStatus(id: string, action: StatusAction) {
    setError(null);
    try {
      const res = await fetch('/api/staff/appointment-status.post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: id, status: action })
      });

      if (res.status === 401 || res.status === 403) {
        setUnauthorized(true);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data?.error || 'Failed to update status. Please try again.');
        return;
      }

      // Optimistic refresh: refetch current list to avoid drift.
      await fetchAppointments();
    } catch (e: any) {
      setError('Failed to update status. Please try again.');
    }
  }

  return (
    <>
      <Head>
        <title>Staff Portal – Today's Appointments | Gabriel Family Clinic</title>
      </Head>
      <PublicHeader />
      <main className="ui-section ui-section--default">
        <Container size="lg">
          <Stack gap="lg">
            <header>
              <p className="eyebrow">Staff Portal</p>
              <Title order={1}>Today's Appointments & Queue</Title>
              <Text className="hero-subtitle">
                View and manage today's schedule at a glance. Mark arrivals, move patients
                into consultation, and keep the queue flowing smoothly for doctors and patients.
              </Text>
            </header>

            {loading && (
              <Group gap="sm">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading today's appointments...
                </Text>
              </Group>
            )}

            {!loading && unauthorized && (
              <Alert color="red" title="Not authorized">
                You must be signed in as clinic staff to access this page. Please log in with your
                staff account. If you believe this is an error, contact the clinic administrator.
                <div style={{ marginTop: '0.75rem' }}>
                  <UiButton href="/login" variant="primary" size="md">
                    Go to login
                  </UiButton>
                </div>
              </Alert>
            )}

            {!loading && !unauthorized && error && (
              <Alert color="red" title="Error">
                {error}
              </Alert>
            )}

            {!loading && !unauthorized && !error && (
              <>
                <Group justify="space-between" align="center">
                  <Text size="sm" c="dimmed">
                    Showing appointments for today. Data refreshes on actions; click below to
                    manually refresh.
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={fetchAppointments}
                    loading={refreshing}
                  >
                    Refresh
                  </Button>
                </Group>
                <TodayAppointmentsTable
                  appointments={appointments}
                  onUpdate={handleUpdateStatus}
                />
              </>
            )}
          </Stack>
        </Container>
      </main>
    </>
  );
}
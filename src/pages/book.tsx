import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Container, Stack, Title, Text, Loader, Alert } from '@mantine/core';
import { supabaseClient } from '@/lib/supabaseClient';
import { UiButton } from '@/components/ui/button';
import { BookingForm } from '@/components/patient/BookingForm';
import { PublicHeader } from '@/components/layout/PublicHeader';

/**
 * /book
 *
 * Core booking entry page.
 *
 * Responsibilities:
 * - Provide a clear, single place for patients to book appointments.
 * - Enforce prerequisites:
 *   - User must be authenticated.
 *   - User must have a patient_profile.
 * - Delegate booking UI to BookingForm once prerequisites are met.
 *
 * Notes:
 * - Auth check is performed client-side via Supabase browser client.
 * - API handlers:
 *   - /api/patient/profile.get
 *   - /api/doctors/index.get
 *   - /api/slots/index.get
 *   - /api/appointments/book.post
 */

type PatientProfile = {
  id: string;
  full_name: string;
};

function useAuthAndProfile() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<null | { user: { id: string } }>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = supabaseClient();

    async function bootstrap() {
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (!currentSession) {
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(currentSession);

        const res = await fetch('/api/patient/profile.get');
        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          setProfile(data?.profile ?? null);
        } else if (res.status !== 404) {
          // 404 means no profile yet; other errors are surfaced
          setError('Unable to load your profile. Please try again.');
        }
      } catch (e) {
        if (isMounted) {
          setError('Unable to verify your session. Please refresh and try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  return { loading, session, profile, error };
}

export default function BookPage() {
  const { loading, session, profile, error } = useAuthAndProfile();

  return (
    <>
      <Head>
        <title>Book an Appointment – Gabriel Family Clinic</title>
      </Head>
      <PublicHeader />
      <main className="ui-section ui-section--default">
        <Container size="lg">
          <Stack gap="lg">
            <header>
              <p className="eyebrow">Online Booking</p>
              <Title order={1}>Book your visit in just a few simple steps</Title>
              <Text className="hero-subtitle">
                Choose your doctor, pick a time, and arrive with confidence. No long calls, no
                guesswork, just a clear queue and calm visit.
              </Text>
            </header>

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Checking your session and profile…
                </Text>
              </div>
            )}

            {!loading && error && (
              <Alert color="red" title="Something went wrong">
                {error}
              </Alert>
            )}

            {!loading && session === null && !error && (
              <div className="ui-card ui-card--elevated">
                <Title order={3}>Sign in to book your appointment</Title>
                <Text size="sm" c="dimmed" mt={4}>
                  For your safety and privacy, bookings are linked to your verified mobile or email
                  and a simple patient profile. No complex passwords.
                </Text>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <UiButton href="/login" variant="primary" size="lg">
                    Continue to login
                  </UiButton>
                  <UiButton href="/" variant="outline" size="lg">
                    Back to home
                  </UiButton>
                </div>
              </div>
            )}

            {!loading && session && !profile && !error && (
              <div className="ui-card ui-card--elevated">
                <Title order={3}>Complete your patient profile</Title>
                <Text size="sm" c="dimmed" mt={4}>
                  Before you book, we need a few details (name, NRIC, date of birth) to keep your
                  records safe and correctly linked. This only takes a minute and is required by the
                  clinic.
                </Text>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <UiButton href="/profile" variant="primary" size="lg">
                    Set up my profile
                  </UiButton>
                  <UiButton href="/" variant="outline" size="lg">
                    Back to home
                  </UiButton>
                </div>
              </div>
            )}

            {!loading && session && profile && !error && (
              <>
                <div className="ui-card ui-card--elevated">
                  <Title order={3}>Welcome back, {profile.full_name}</Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    Choose your preferred doctor, date, and time slot below. You'll receive a
                    confirmation once your booking is created.
                  </Text>
                  <div style={{ marginTop: '1.5rem' }}>
                    <BookingForm />
                  </div>
                </div>
              </>
            )}
          </Stack>
        </Container>
      </main>
    </>
  );
}
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Alert,
  Container,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { supabaseClient } from '@/lib/supabaseClient';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { UiButton } from '@/components/ui/button';

/**
 * /login
 *
 * Minimal Supabase Auth entry page for patients/staff.
 *
 * Goals:
 * - Senior-friendly, single-screen login.
 * - Support email magic link and (optionally) phone OTP.
 * - On success, send user back to:
 *   - /book if they came from booking,
 *   - /profile if they came from profile,
 *   - or / by default.
 *
 * Notes:
 * - This page uses client-side Supabase auth.
 * - For production, ensure:
 *   - SUPABASE redirect URLs configured.
 *   - SMS/OTP or magic link auth enabled per clinic preference.
 */


export default function LoginPage() {
  const router = useRouter();

  // Guard against missing env vars during build/SSR:
  // - In real deployments, NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  //   must be set (see .env.example and README).
  // - During static export or misconfigured environments, we avoid throwing and
  //   instead render a graceful error message.
  const safeSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? supabaseClient()
      : null;
  const redirectTo =
    (typeof router.query.redirect === 'string' && router.query.redirect) || '/book';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to intended target
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      if (!safeSupabase) return;
      const {
        data: { session }
      } = await safeSupabase.auth.getSession();
      if (!cancelled && session) {
        router.replace(redirectTo);
      }
    }
    void checkSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter a valid email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Enter a valid email address');
      return;
    }

    // If Supabase client is not available (e.g., missing env vars),
    // fail gracefully instead of throwing during build/SSR.
    if (!safeSupabase) {
      setError(
        'Sign-in is temporarily unavailable due to configuration. Please try again later.'
      );
      return;
    }

    setStatus('sending');
    setError(null);

    try {
      const { error } = await safeSupabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}${redirectTo}`
              : redirectTo
        }
      });

      if (error) {
        setStatus('error');
        setError(error.message || 'Unable to send login link');
        return;
      }

      setStatus('sent');
    } catch (e: any) {
      setStatus('error');
      setError(
        e?.message || 'Unable to start login. Please try again shortly.'
      );
    }
  }

  return (
    <>
      <Head>
        <title>Sign in – Gabriel Family Clinic</title>
      </Head>
      <PublicHeader />
      <main className="ui-section ui-section--default">
        <Container size="lg">
          <Stack gap="lg">
            <header>
              <p className="eyebrow">Secure Sign In</p>
              <Title order={1}>Sign in to manage your visits</Title>
              <Text className="hero-subtitle">
                Use a one-time secure link sent to your email. No passwords to remember,
                just simple, safe access for you and your family.
              </Text>
            </header>

            <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
              <Stack gap="sm">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                    if (error) setError(null);
                  }}
                />

                <UiButton
                  variant="primary"
                  size="lg"
                  disabled={status === 'sending'}
                >
                  {status === 'sending'
                    ? 'Sending login link…'
                    : 'Send me a login link'}
                </UiButton>

                {status === 'sent' && !error && (
                  <Alert color="green" mt="xs">
                    A secure login link has been sent. Please check your email to continue.
                  </Alert>
                )}

                {error && (
                  <Alert color="red" mt="xs">
                    {error}
                  </Alert>
                )}

                <Text size="xs" c="dimmed">
                  By continuing, you agree for the clinic to contact you about your
                  appointments. We keep your data PDPA-safe.
                </Text>
              </Stack>
            </form>
          </Stack>
        </Container>
      </main>
    </>
  );
}
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

type LoginFormValues = {
  email: string;
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseClient();
  const redirectTo =
    (typeof router.query.redirect === 'string' && router.query.redirect) || '/book';

  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  // If already logged in, redirect to intended target
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();
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

    setStatus('sending');
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
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
                  as="button"
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
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Alert,
  Container,
  Stack,
  Text,
  TextInput,
  Select,
  Button,
  Loader,
  Title
} from '@mantine/core';
import { supabaseClient } from '@/lib/supabaseClient';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { ProfileSchema, type ProfileInput } from '@/lib/validation';

/**
 * /profile
 *
 * Patient profile management page.
 *
 * Responsibilities:
 * - Require authentication (client-side check).
 * - Load existing patient profile via /api/patient/profile.get.
 * - Allow creating/updating profile via /api/patient/profile.put.
 * - Enforce schema rules via ProfileSchema before sending.
 *
 * Notes:
 * - NRIC is handled on the server:
 *   - Client sends raw NRIC in payload.
 *   - API hashes + masks it according to PDPA requirements.
 */

type LoadedProfile = {
  full_name: string;
  nric_masked?: string;
  dob: string;
  language: string;
  chas_tier: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<ProfileInput>({
    full_name: '',
    nric: '',
    dob: '',
    language: 'en',
    chas_tier: 'unknown'
  });
  const [nricHint, setNricHint] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const supabase = supabaseClient();

    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        setHasSession(false);
      } else {
        setHasSession(true);
      }
      setSessionChecked(true);
    }

    void checkSession();
  }, []);

  // Load existing profile when authenticated
  useEffect(() => {
    if (!sessionChecked || !hasSession) return;

    let cancelled = false;
    async function loadProfile() {
      try {
        setLoadingProfile(true);
        setError(null);
        const res = await fetch('/api/patient/profile.get');
        if (!res.ok) {
          if (res.status === 404) {
            // No profile yet, keep defaults.
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load profile');
        }
        const data = (await res.json()) as { profile?: LoadedProfile };
        if (cancelled) return;
        if (data.profile) {
          setForm((prev) => ({
            ...prev,
            full_name: data.profile!.full_name,
            // Do not pre-fill NRIC; use masked hint
            nric: '',
            dob: data.profile!.dob,
            language: data.profile!.language || 'en',
            chas_tier:
              (data.profile!.chas_tier as ProfileInput['chas_tier']) || 'unknown'
          }));
          if (data.profile.nric_masked) {
            setNricHint(`Current ID on file: ${data.profile.nric_masked}`);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Unable to load your profile.');
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [sessionChecked, hasSession]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    try {
      // Validate on client for better UX
      const validated = ProfileSchema.parse(form);

      setSaving(true);
      const res = await fetch('/api/patient/profile.put', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validated)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || 'Failed to save profile. Please try again.'
        );
      }

      setSaved(true);
      // After successful save, clear NRIC field and show masked hint from response if present
      const data = await res.json().catch(() => ({} as any));
      if (data.profile?.nric_masked) {
        setNricHint(`Current ID on file: ${data.profile.nric_masked}`);
      }
      setForm((prev) => ({ ...prev, nric: '' }));
    } catch (err: any) {
      setError(err.message || 'Invalid details, please review and try again.');
    } finally {
      setSaving(false);
    }
  }

  if (sessionChecked && !hasSession) {
    // Not logged in: guide to login.
    return (
      <>
        <Head>
          <title>My Profile – Gabriel Family Clinic</title>
        </Head>
        <PublicHeader />
        <main className="ui-section ui-section--default">
          <Container size="lg">
            <Stack gap="md">
              <Title order={1}>My Profile</Title>
              <Alert color="blue" title="Sign in required">
                Please sign in so we can link your profile to your secure account.
              </Alert>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button
                  className="ui-btn ui-btn--primary ui-btn--lg"
                  onClick={() => router.push('/login')}
                >
                  Go to login
                </Button>
                <Button
                  variant="outline"
                  className="ui-btn ui-btn--outline ui-btn--lg"
                  onClick={() => router.push('/')}
                >
                  Back to home
                </Button>
              </div>
            </Stack>
          </Container>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile – Gabriel Family Clinic</title>
      </Head>
      <PublicHeader />
      <main className="ui-section ui-section--default">
        <Container size="lg">
          <Stack gap="lg">
            <header>
              <p className="eyebrow">My Details</p>
              <Title order={1}>Keep your patient details up to date</Title>
              <Text className="hero-subtitle">
                We use this information to find your records quickly and keep your visits smooth.
                You only need to fill this once; you can update it anytime.
              </Text>
            </header>

            {loadingProfile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading your profile…
                </Text>
              </div>
            )}

            {error && (
              <Alert color="red" title="Profile issue">
                {error}
              </Alert>
            )}

            {saved && !error && (
              <Alert color="green" title="Profile saved">
                Your details have been updated. You can now book appointments confidently.
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="sm">
                <TextInput
                  label="Full name (as in NRIC)"
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, full_name: e.currentTarget.value }))
                  }
                />

                <TextInput
                  label="NRIC / FIN"
                  required={!nricHint}
                  value={form.nric}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nric: e.currentTarget.value.trim() }))
                  }
                  placeholder="E.g. S1234567A"
                  description={
                    nricHint
                      ? `${nricHint}. Update only if your ID has changed.`
                      : 'Used only for verification; stored securely and shown masked.'
                  }
                />

                <TextInput
                  type="date"
                  label="Date of birth"
                  required
                  value={form.dob}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dob: e.currentTarget.value }))
                  }
                />

                <Select
                  label="Preferred language"
                  data={[
                    { value: 'en', label: 'English' },
                    { value: 'zh', label: 'Chinese' },
                    { value: 'ms', label: 'Malay' },
                    { value: 'ta', label: 'Tamil' }
                  ]}
                  value={form.language}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      language: value || 'en'
                    }))
                  }
                />

                <Select
                  label="CHAS tier (optional)"
                  data={[
                    { value: 'unknown', label: 'Not sure / not applicable' },
                    { value: 'none', label: 'None' },
                    { value: 'blue', label: 'Blue' },
                    { value: 'orange', label: 'Orange' },
                    { value: 'green', label: 'Green' }
                  ]}
                  value={form.chas_tier}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      chas_tier: (value as ProfileInput['chas_tier']) || 'unknown'
                    }))
                  }
                />

                <div style={{ marginTop: '0.75rem' }}>
                  <Button
                    type="submit"
                    className="ui-btn ui-btn--primary ui-btn--lg"
                    disabled={saving}
                  >
                    {saving ? 'Saving your profile…' : 'Save profile'}
                  </Button>
                </div>
              </Stack>
            </form>
          </Stack>
        </Container>
      </main>
    </>
  );
}
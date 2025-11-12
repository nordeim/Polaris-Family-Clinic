import Link from 'next/link';
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Grid,
  Divider
} from '@mantine/core';
import { UiButton } from '@/components/ui/button';
import { UiCard } from '@/components/ui/card';
import { UiBadge } from '@/components/ui/badge';
import { Section } from '@/components/ui/section';

/**
 * Dynamic landing page
 *
 * Canonical reference:
 * - static/index.html
 * - static/styles/globals.css
 * - static/js/landing.js
 *
 * Goals:
 * - Senior-friendly, high contrast, calm, trustworthy.
 * - Clear primary CTA: Book Appointment.
 * - Obvious entry points for:
 *   - Patients: /book, /profile
 *   - Staff/Doctors: /staff/appointments
 * - Minimal JS; mostly static layout + links.
 * - Uses shared UI primitives (UiButton, UiCard, UiBadge, Section) + Mantine layout.
 */

export default function HomePage() {
  return (
    <main>
      {/* Hero / Header */}
      <Section variant="default">
        <Container size="lg">
          <Stack gap="lg">
            {/* Top nav / logo row */}
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <UiBadge variant="soft">Gabriel Family Clinic</UiBadge>
                <Text size="xs" c="dimmed">
                  Family GP &middot; Tampines, Singapore
                </Text>
              </Group>

              <Group gap="xs" visibleFrom="sm">
                <Link href="/book" passHref legacyBehavior>
                  <UiButton variant="outline" size="sm">
                    Book
                  </UiButton>
                </Link>
                <Link href="/profile" passHref legacyBehavior>
                  <UiButton variant="ghost" size="sm">
                    My Profile
                  </UiButton>
                </Link>
                <Link href="/staff/appointments" passHref legacyBehavior>
                  <UiButton variant="subtle" size="sm">
                    Staff Portal
                  </UiButton>
                </Link>
              </Group>
            </Group>

            <Grid gutter="xl" align="stretch">
              {/* Left: Hero copy */}
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="md">
                  <Text size="xs" c="dimmed">
                    One clinic. One simple system. One happy patient.
                  </Text>
                  <Title order={1}>
                    A calm, clear way to visit your neighborhood doctor.
                  </Title>
                  <Text size="md" c="dimmed">
                    Built for seniors, caregivers, and our clinic team. Book
                    appointments in a few taps, avoid long waits, and always
                    know what's happening next.
                  </Text>

                  {/* Primary CTAs */}
                  <Group gap="md" mt="sm">
                    <Link href="/book" passHref legacyBehavior>
                      <UiButton size="lg">Book an appointment</UiButton>
                    </Link>
                    <Link href="/profile" passHref legacyBehavior>
                      <UiButton variant="outline" size="lg">
                        View / update my profile
                      </UiButton>
                    </Link>
                  </Group>

                  {/* Supporting points */}
                  <Group gap="md" mt="sm" wrap="wrap">
                    <UiBadge variant="soft">
                      Easy for seniors & caregivers
                    </UiBadge>
                    <UiBadge variant="outline">
                      PDPA-conscious, secure records
                    </UiBadge>
                    <UiBadge variant="outline">
                      One clinic, no confusing apps
                    </UiBadge>
                  </Group>
                </Stack>
              </Grid.Col>

              {/* Right: Booking & Queue preview */}
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="sm">
                  <UiCard elevated className="hero-card">
                    <Text size="xs" c="dimmed">
                      Quick overview
                    </Text>
                    <Title order={3} fz="lg">
                      Today at Gabriel Family Clinic
                    </Title>
                    <Text size="sm" mt={4}>
                      Booking and queue information shown here is a preview.
                      Actual times appear after you book.
                    </Text>
                    <Divider my="sm" />
                    <Group justify="space-between">
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Next available slot
                        </Text>
                        <Text size="md" fw={600}>
                          09:15 AM &ndash; Dr Tan
                        </Text>
                      </Stack>
                      <Stack gap={2} align="flex-end">
                        <Text size="xs" c="dimmed">
                          Now serving
                        </Text>
                        <Text size="md" fw={600}>
                          A012
                        </Text>
                      </Stack>
                    </Group>
                    <Divider my="sm" />
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">
                        How it works:
                      </Text>
                      <ul className="list-check">
                        <li>Book a time that suits you.</li>
                        <li>Arrive a little before your slot.</li>
                        <li>Watch the queue number on-screen at reception.</li>
                      </ul>
                    </Stack>
                    <Link href="/book" passHref legacyBehavior>
                      <UiButton fullWidth size="md" style={{ marginTop: '0.5rem' }}>
                        Start booking now
                      </UiButton>
                    </Link>
                  </UiCard>

                  <UiCard className="hero-mini-card">
                    <Text size="xs" c="dimmed">
                      For our staff & doctors
                    </Text>
                    <Text size="sm">
                      Use the Staff Portal to see today's appointments,
                      update statuses, and keep the waiting room calm.
                    </Text>
                    <Link href="/staff/appointments" passHref legacyBehavior>
                      <UiButton variant="subtle" size="sm" style={{ marginTop: '0.25rem' }}>
                        Go to Staff Portal
                      </UiButton>
                    </Link>
                  </UiCard>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Why Us */}
      <Section variant="alt">
        <Container size="lg">
          <Grid gutter="xl" align="flex-start">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2}>Why this system works for our patients</Title>
              <Text size="sm" c="dimmed" mt="xs">
                We built this with our seniors in mind:
              </Text>
              <ul className="list-check">
                <li>Large, readable text. Clear buttons.</li>
                <li>No passwords to remember &mdash; simple secure login.</li>
                <li>Clear instructions at every step.</li>
              </ul>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={3} fz="lg">
                And for our clinic team
              </Title>
              <ul className="list-check">
                <li>Today's appointments in one clean view.</li>
                <li>Simple queue numbers, no messy paper lists.</li>
                <li>Built on Supabase & Next.js for reliability.</li>
              </ul>
            </Grid.Col>
          </Grid>
        </Container>
      </Section>

      {/* How It Works */}
      <Section variant="default">
        <Container size="lg">
          <Title order={2}>How it works (for patients)</Title>
          <Grid gutter="lg" mt="md">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <UiCard>
                <div className="step-number">1</div>
                <Title order={3} fz="md" mt="xs">
                  Verify your mobile
                </Title>
                <Text size="sm" c="dimmed">
                  Secure login using your mobile number or email. No complex
                  passwords.
                </Text>
              </UiCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <UiCard>
                <div className="step-number">2</div>
                <Title order={3} fz="md" mt="xs">
                  Create your profile
                </Title>
                <Text size="sm" c="dimmed">
                  Provide your name, NRIC (stored safely), and basic details
                  once. Edit anytime.
                </Text>
              </UiCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <UiCard>
                <div className="step-number">3</div>
                <Title order={3} fz="md" mt="xs">
                  Book & come on time
                </Title>
                <Text size="sm" c="dimmed">
                  Choose your doctor, pick a time, and see your queue number
                  when you arrive.
                </Text>
              </UiCard>
            </Grid.Col>
          </Grid>
        </Container>
      </Section>

      {/* Seniors-first + Staff section */}
      <Section variant="alt">
        <Container size="lg">
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2}>Designed for seniors</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Simple words, big buttons, no clutter. If you can use WhatsApp,
                you can use this.
              </Text>
              <ul className="list-check">
                <li>Mobile-friendly and readable.</li>
                <li>Works on clinic tablet with staff assistance.</li>
                <li>Step-by-step guidance for first-time users.</li>
              </ul>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2}>Built for one clinic</Title>
              <Text size="sm" c="dimmed" mt="xs">
                No multi-clinic complexity. Everything is tuned for Gabriel
                Family Clinic's daily flow.
              </Text>
              <ul className="list-check">
                <li>Reception sees today's appointments.</li>
                <li>Doctors see who is next without noise.</li>
                <li>Queue numbers stay predictable and calm.</li>
              </ul>
            </Grid.Col>
          </Grid>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="cta">
        <Container size="lg">
          <Grid gutter="lg" align="center">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Title order={2}>
                Ready to book your next visit with Gabriel Family Clinic?
              </Title>
              <Text size="sm" mt="xs">
                Start with a simple profile, choose your doctor, and pick a time
                that works for you.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="xs">
                <Link href="/book" passHref legacyBehavior>
                  <UiButton fullWidth size="lg" variant="primary">
                    Book an appointment
                  </UiButton>
                </Link>
                <Link href="/profile" passHref legacyBehavior>
                  <UiButton fullWidth size="md" variant="outline">
                    View / update my profile
                  </UiButton>
                </Link>
                <Link href="/staff/appointments" passHref legacyBehavior>
                  <UiButton fullWidth size="sm" variant="ghost">
                    Staff / doctor portal
                  </UiButton>
                </Link>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Section>

      {/* Footer */}
      <Section variant="default">
        <Container size="lg">
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Gabriel Family Clinic &middot; 123 Tampines Street 11, #01-456,
              Singapore
            </Text>
            <Text size="xs" c="dimmed">
              For real medical emergencies, please call 995 or visit the nearest hospital.
            </Text>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}

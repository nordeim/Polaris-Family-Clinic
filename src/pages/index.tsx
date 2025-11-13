import {
  Container,
  Stack,
  Title,
  Text,
  Grid
} from '@mantine/core';
import { UiButton } from '@/components/ui/button';
import { UiCard } from '@/components/ui/card';
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

import { PublicHeader } from '@/components/layout/PublicHeader';

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        {/* Hero */}
        <Section id="hero" variant="default">
          <Container size="lg">
            <Stack gap="lg">
            {/* Hero grid */}

            <Grid gutter="xl" align="stretch">
              {/* Left: Hero copy */}
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="md">
                  <Text size="xs" c="dimmed" className="eyebrow">
                    One clinic. One simple system.
                  </Text>
                  <Title order={1}>
                    Clinic care, made simple{' '}
                    <span className="text-highlight">for everyone.</span>
                  </Title>
                  <Text size="sm" className="hero-subtitle">
                    From grandma's check-up to your busy workday flu visit,
                    Gabriel Family Clinic keeps booking and waiting simple,
                    clear, and friendly for our neighborhood.
                  </Text>

                  {/* Primary CTAs */}
                  <div className="hero-actions">
                    <UiButton href="/book" size="lg" variant="primary">
                      Book an Appointment
                    </UiButton>
                    <a
                      href="#seniors"
                      className="btn btn-outline btn-large"
                    >
                      View Queue & Patient Guide
                    </a>
                  </div>

                  <div className="hero-trust">
                    <div className="badge-soft">
                      Designed for seniors & caregivers
                    </div>
                    <div className="hero-note">
                      Simple screens, big text, no apps to install.
                    </div>
                  </div>
                </Stack>
              </Grid.Col>

              {/* Right: Booking & Queue preview */}
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="sm">
                  <UiCard elevated className="hero-card">
                    <div className="hero-card-header">
                      <div>
                        <div className="hero-card-title">
                          Quick Booking Preview
                        </div>
                        <div className="hero-card-subtitle">
                          See how easy it feels in our real app.
                        </div>
                      </div>
                      <span className="hero-card-pill">2 min</span>
                    </div>
                    <div className="hero-card-body">
                      <label className="field-label">Select Doctor</label>
                      <div className="field-select">
                        <span>Dr Tan (Family Physician)</span>
                        <span className="chevron">⌄</span>
                      </div>
                      <label className="field-label">Choose Date</label>
                      <div className="field-select">
                        <span>Today, 3:15 PM</span>
                        <span className="chevron">📅</span>
                      </div>
                      <label className="field-label">Your Name</label>
                      <input
                        className="field-input"
                        type="text"
                        placeholder="E.g. Mdm Tan Ah Lian"
                      />
                      <button className="btn btn-primary btn-full mt-2">
                        Confirm Booking
                      </button>
                      <div className="hero-card-footnote">
                        You'll receive a confirmation and gentle reminders.
                        No password, no clutter.
                      </div>
                    </div>
                  </UiCard>

                  <UiCard className="hero-mini-card">
                    <div className="hero-mini-label">Live Queue Snapshot</div>
                    <div className="hero-mini-items">
                      <div className="hero-mini-item">
                        <div className="mini-label">Now Seeing</div>
                        <div className="mini-value">A012</div>
                      </div>
                      <div className="hero-mini-item">
                        <div className="mini-label">You're Next</div>
                        <div className="mini-value text-positive">A013</div>
                      </div>
                      <div className="hero-mini-item">
                        <div className="mini-label">Est. Wait</div>
                        <div className="mini-value">8 mins</div>
                      </div>
                    </div>
                    <div className="hero-mini-note">
                      In the real system, this updates live for patients and staff.
                    </div>
                  </UiCard>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Why Us */}
      <Section id="why" variant="alt">
        <Container size="lg">
          <div className="section-header">
            <Title order={2}>Why Gabriel Family Clinic</Title>
            <Text size="sm">
              Built with our neighbors in mind: clear, calm, and respectful of your time.
            </Text>
          </div>
          <div className="grid-three">
            <UiCard elevated className="feature-card">
              <div className="feature-icon">🧓</div>
              <Title order={3}>Senior-friendly by design</Title>
              <Text size="sm">
                Large text, high contrast, simple steps. No app downloads, no confusing menus.
              </Text>
            </UiCard>
            <UiCard elevated className="feature-card">
              <div className="feature-icon">⏱️</div>
              <Title order={3}>Shorter, calmer waits</Title>
              <Text size="sm">
                Book ahead or walk in – see your queue number and estimated wait clearly.
              </Text>
            </UiCard>
            <UiCard elevated className="feature-card">
              <div className="feature-icon">🔒</div>
              <Title order={3}>Privacy built in</Title>
              <Text size="sm">
                IDs are masked, data is protected, and access follows clinical best practices.
              </Text>
            </UiCard>
          </div>
        </Container>
      </Section>

      {/* How It Works */}
      <Section id="how" variant="default">
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

      {/* For Seniors & Families */}
      <Section id="seniors" variant="alt">
        <Container size="lg">
          <div className="seniors-grid">
            <div>
              <Title order={2}>Made for seniors and families</Title>
              <Text className="lead">
                Your parents and grandparents deserve calm, not chaos.
              </Text>
              <ul className="list-check">
                <li>Simple screens you can read at a glance.</li>
                <li>No passwords to remember – secure links instead.</li>
                <li>Caregivers can help manage appointments easily.</li>
                <li>Clear queue info so no one has to stand and wait.</li>
              </ul>
            </div>
            <UiCard elevated className="seniors-card">
              <Title order={3} className="seniors-card-title">
                “Ah Ma can see her queue number!”
              </Title>
              <Text className="seniors-card-quote">
                “The staff just showed us this screen. Now my mum can sit and rest
                while I check her turn on my phone. Very thoughtful.”
              </Text>
              <div className="seniors-card-meta">
                – A daughter of a regular patient
              </div>
            </UiCard>
          </div>
        </Container>
      </Section>

      {/* For Staff */}
      <Section variant="default">
        <Container size="lg">
          <div className="staff-grid">
            <div>
              <Title order={2}>Built to make clinic teams happier too</Title>
              <Text className="lead">
                One clean dashboard for front-desk and doctors.
              </Text>
              <ul className="list-check">
                <li>See today's appointments and walk-ins at a glance.</li>
                <li>Assign queue numbers with one tap.</li>
                <li>Reduce repeated questions at the counter.</li>
                <li>Keep patients informed without extra calls.</li>
              </ul>
            </div>
            <UiCard elevated className="staff-card">
              <div className="staff-label">Staff Portal Preview</div>
              <div className="staff-row">
                <span>10:00 AM – Mdm Tan Ah Lian</span>
                <span className="badge-soft">Arrived · A013</span>
              </div>
              <div className="staff-row">
                <span>10:15 AM – Mr Lee Wei Jian</span>
                <span className="badge-soft">Booked</span>
              </div>
              <div className="staff-row">
                <span>10:30 AM – Walk-in</span>
                <span className="badge-soft">In Queue</span>
              </div>
              <div className="staff-note">
                The real system uses secure staff login with live data.
              </div>
            </UiCard>
          </div>
        </Container>
      </Section>

      {/* CTA Section / Book */}
      <Section id="book" variant="cta">
        <Container size="lg">
          <div className="cta-container">
            <div>
              <Title order={2}>
                Ready to make visits calmer for everyone?
              </Title>
              <Text>
                Start with simple online booking and a clear queue. We'll handle
                the details so you can focus on care.
              </Text>
            </div>
            <div className="cta-actions">
              <a href="#hero" className="btn btn-primary btn-large">
                Try the booking experience
              </a>
              <a href="#contact" className="btn btn-outline btn-large">
                Talk to our clinic team
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* Contact / Footer */}
      <Section id="contact" variant="alt">
        <Container size="lg">
          <div className="contact-grid">
            <div>
              <Title order={3}>Gabriel Family Clinic</Title>
              <Text>
                123 Sample Street, #01-234
                <br />
                Singapore 123456
              </Text>
              <Text>Tel: +65 6000 0000</Text>
            </div>
            <div>
              <Title order={4}>Hours</Title>
              <Text size="sm">
                Mon–Fri: 8:30 AM – 1:00 PM, 2:00 PM – 5:30 PM
                <br />
                Sat: 8:30 AM – 1:00 PM
                <br />
                Sun & PH: Closed
              </Text>
            </div>
            <div>
              <Title order={4}>Quick Links</Title>
              <ul className="footer-links">
                <li>
                  <a href="#hero">Home</a>
                </li>
                <li>
                  <a href="#why">Why Us</a>
                </li>
                <li>
                  <a href="#how">How It Works</a>
                </li>
                <li>
                  <a href="#seniors">For Seniors</a>
                </li>
                <li>
                  <a href="#book">Book</a>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>
      <footer className="site-footer">
        <Container size="lg" className="footer-inner">
          <div>© Gabriel Family Clinic. All rights reserved.</div>
          <div className="footer-sub">
            This is a design mockup of the digital companion experience.
          </div>
        </Container>
      </footer>
    </main>
    </>
  );
}

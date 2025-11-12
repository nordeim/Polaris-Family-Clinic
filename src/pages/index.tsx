import Link from 'next/link';
import { Button, Container, Stack, Text, Title } from '@mantine/core';

export default function HomePage() {
  return (
    <Container
      size="sm"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Stack gap="xl">
        <Title order={1}>Gabriel Family Clinic</Title>
        <Text size="lg">
          One clinic. One simple system. One happy patient.
        </Text>
        <Text>
          This is the official booking and queue companion for Gabriel Family Clinic.
          Designed for seniors, caregivers, and our clinic team — simple, clear, and safe.
        </Text>

        <Stack gap="md">
          <Link href="/book" passHref legacyBehavior>
            <Button component="a" size="lg">
              Book an Appointment
            </Button>
          </Link>

          <Link href="/profile" passHref legacyBehavior>
            <Button component="a" variant="outline" size="lg">
              View / Update My Profile
            </Button>
          </Link>

          <Link href="/staff/appointments" passHref legacyBehavior>
            <Button component="a" variant="subtle" size="md">
              Staff / Doctor Portal
            </Button>
          </Link>
        </Stack>

        <Text size="sm" c="dimmed">
          Tip: For now, these links may be placeholders until later phases are implemented.
        </Text>
      </Stack>
    </Container>
  );
}

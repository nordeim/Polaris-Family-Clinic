import type { AppProps } from 'next/app';
import { MantineProvider, createTheme } from '@mantine/core';

import '@/styles/globals.css';
import '@/styles/tokens.css';

/**
 * Theme tuned to align Mantine base with the static landing mockup:
 * - Inter for body text.
 * - DM Sans for headings.
 * - Softer default radius and neutral palette.
 * - Container width aligned with design (1120px via CSS).
 */
const gabrielTheme = createTheme({
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily:
      "DM Sans, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: '600'
  },
  primaryColor: 'blue',
  defaultRadius: 'md'
});

export default function GabrielClinicApp({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={gabrielTheme}>
      <Component {...pageProps} />
    </MantineProvider>
  );
}

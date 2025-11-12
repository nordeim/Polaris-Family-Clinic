import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';

import '@/styles/globals.css';

export default function GabrielClinicApp({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider
      theme={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        primaryColor: 'blue',
        defaultRadius: 'md',
        headings: {
          fontWeight: '700'
        }
      }}
    >
      <Component {...pageProps} />
    </MantineProvider>
  );
}

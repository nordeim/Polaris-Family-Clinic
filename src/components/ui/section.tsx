import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import clsx from 'clsx';

export type SectionVariant = 'default' | 'alt' | 'cta';

export interface SectionProps {
  id?: string;
  variant?: SectionVariant;
  children: ReactNode;
  className?: string;
}

/**
 * Section
 *
 * Layout primitive for landing + app sections.
 * - Maps directly to .ui-section tokens in src/styles/tokens.css.
 * - Variants:
 *   - default: light background.
 *   - alt: surface background.
 *   - cta: gradient primary band.
 *
 * Usage:
 * <Section id="hero" variant="default">...</Section>
 */
export function Section(props: SectionProps) {
  const { id, variant = 'default', children, className } = props;

  const classes = clsx(
    'ui-section',
    {
      'ui-section--default': variant === 'default',
      'ui-section--alt': variant === 'alt',
      'ui-section--cta': variant === 'cta'
    },
    className
  );

  return (
    <Box id={id} component="section" className={classes}>
      {children}
    </Box>
  );
}
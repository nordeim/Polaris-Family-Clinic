import { Card, CardProps } from '@mantine/core';
import clsx from 'clsx';

export interface UiCardProps extends CardProps {
  elevated?: boolean;
}

/**
 * UiCard
 *
 * Thin wrapper around Mantine Card:
 * - Applies shared design tokens from src/styles/tokens.css.
 * - Provides optional "elevated" variant for hero/feature blocks.
 */
export function UiCard(props: UiCardProps) {
  const { elevated, className, children, ...rest } = props;

  const classes = clsx(
    'ui-card',
    {
      'ui-card--elevated': elevated
    },
    className
  );

  return (
    <Card className={classes} {...rest}>
      {children}
    </Card>
  );
}
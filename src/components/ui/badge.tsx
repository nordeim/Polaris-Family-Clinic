import { Badge, BadgeProps } from '@mantine/core';
import clsx from 'clsx';

export type UiBadgeVariant = 'soft' | 'outline';

export interface UiBadgeProps extends BadgeProps {
  variant?: UiBadgeVariant;
}

/**
 * UiBadge
 *
 * Thin wrapper around Mantine Badge:
 * - Uses tokens.css-driven classes to keep badges consistent.
 * - Variants:
 *   - soft: primary-soft pill.
 *   - outline: subtle outline pill.
 */
export function UiBadge(props: UiBadgeProps) {
  const { variant = 'soft', className, children, ...rest } = props;

  const classes = clsx(
    'ui-badge',
    {
      'ui-badge--soft': variant === 'soft',
      'ui-badge--outline': variant === 'outline'
    },
    className
  );

  return (
    <Badge className={classes} {...rest}>
      {children}
    </Badge>
  );
}
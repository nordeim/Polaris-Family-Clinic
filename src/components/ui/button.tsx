import Link, { LinkProps } from 'next/link';
import { Button, ButtonProps } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';

type UiButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle';
type UiButtonSize = 'sm' | 'md' | 'lg';

type AnchorLikeProps = {
  href?: LinkProps['href'];
};

export interface UiButtonProps extends ButtonProps, AnchorLikeProps {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

/**
 * UiButton
 *
 * Design objectives:
 * - Senior-friendly pill button with clear hierarchy.
 * - Minimal Mantine visual noise: rely on .ui-btn* classes from tokens.css.
 * - Correct link semantics:
 *    - If href is provided:
 *        - Wrap in Next.js <Link> and render <a> as the clickable element.
 *    - Otherwise:
 *        - Render as standard <button>.
 */
export function UiButton(props: UiButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth,
    href,
    className,
    children,
    ...rest
  } = props;

  const classes = clsx(
    'ui-btn',
    {
      'ui-btn--primary': variant === 'primary',
      'ui-btn--outline': variant === 'outline',
      'ui-btn--ghost': variant === 'ghost',
      'ui-btn--subtle': variant === 'subtle',
      'ui-btn--sm': size === 'sm',
      'ui-btn--md': size === 'md',
      'ui-btn--lg': size === 'lg',
      'ui-btn--full': fullWidth
    },
    className
  );

  // If href is provided, render as a real link wrapped in Next.js Link.
  if (href) {
    return (
      <Link href={href} legacyBehavior passHref>
        <a className={classes}>{children}</a>
      </Link>
    );
  }

  // Fallback: plain button
  return (
    <Button
      className={classes}
      variant="subtle"
      radius="xl"
      {...rest}
    >
      {children}
    </Button>
  );
}
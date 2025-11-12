import { Button, ButtonProps } from '@mantine/core';
import clsx from 'clsx';

type UiButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle';
type UiButtonSize = 'sm' | 'md' | 'lg';

export interface UiButtonProps extends ButtonProps {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  fullWidth?: boolean;
}

/**
 * UiButton
 *
 * Thin wrapper around Mantine Button to:
 * - Apply shared design tokens from src/styles/tokens.css.
 * - Keep landing + app buttons visually consistent and senior-friendly.
 *
 * Notes:
 * - Uses className / data attributes for styling via CSS tokens.
 * - Avoids over-abstracting Mantine; just a stable surface for this project.
 */
export function UiButton(props: UiButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth,
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

  return (
    <Button className={classes} {...rest}>
      {children}
    </Button>
  );
}
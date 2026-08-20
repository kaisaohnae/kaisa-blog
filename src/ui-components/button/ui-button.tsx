import type {ButtonHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from '../lib/control-utils';
import {UiSpinner} from '../spinner/ui-spinner';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type UiButtonSize = 'sm' | 'md' | 'lg';

export type UiButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: UiButtonVariant;
  uiSize?: UiButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
};

export function UiButton({
  variant = 'primary',
  uiSize = 'md',
  loading = false,
  fullWidth = false,
  leadingIcon,
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: UiButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(
        'ui-btn',
        `ui-btn--${variant}`,
        `ui-btn--${uiSize}`,
        fullWidth && 'ui-btn--block',
        loading && 'ui-btn--loading',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <UiSpinner variant="ring" uiSize="sm" className="ui-btn__spinner" /> : leadingIcon}
      <span className="ui-btn__label">{children}</span>
    </button>
  );
}

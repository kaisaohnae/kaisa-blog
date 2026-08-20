import type {ButtonHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from './lib';
import {Ex3Spinner} from './ex3-spinner';

export type Ex3ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type Ex3ButtonSize = 'sm' | 'md' | 'lg';

export type Ex3ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Ex3ButtonVariant;
  uiSize?: Ex3ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
};

export function Ex3Button({
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
}: Ex3ButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(
        'ex3k-btn',
        `ex3k-btn--${variant}`,
        `ex3k-btn--${uiSize}`,
        fullWidth && 'ex3k-btn--block',
        loading && 'ex3k-btn--loading',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Ex3Spinner variant="ring" uiSize="sm" className="ex3k-btn__spinner" /> : leadingIcon}
      <span className="ex3k-btn__label">{children}</span>
    </button>
  );
}

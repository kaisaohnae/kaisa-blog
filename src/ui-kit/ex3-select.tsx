import type {SelectHTMLAttributes} from 'react';
import {joinClasses} from './lib';

export type Ex3SelectSize = 'sm' | 'md' | 'lg';

export type Ex3SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  uiSize?: Ex3SelectSize;
  invalid?: boolean;
};

export function Ex3Select({
  uiSize = 'md',
  invalid,
  className,
  disabled,
  children,
  ...props
}: Ex3SelectProps) {
  return (
    <span className={joinClasses('ex3k-select-wrap', `ex3k-select-wrap--${uiSize}`, disabled && 'is-disabled')}>
      <select
        className={joinClasses(
          'ex3k-select',
          `ex3k-select--${uiSize}`,
          invalid && 'ex3k-select--invalid',
          disabled && 'ex3k-is-disabled',
          className,
        )}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
    </span>
  );
}

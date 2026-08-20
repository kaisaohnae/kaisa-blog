import type {InputHTMLAttributes} from 'react';
import {joinClasses} from './lib';

export type Ex3InputSize = 'sm' | 'md' | 'lg';

export type Ex3InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  uiSize?: Ex3InputSize;
  invalid?: boolean;
};

export function Ex3Input({
  uiSize = 'md',
  invalid,
  className,
  disabled,
  readOnly,
  placeholder = ' ',
  ...props
}: Ex3InputProps) {
  return (
    <input
      className={joinClasses(
        'ex3k-input',
        `ex3k-input--${uiSize}`,
        invalid && 'ex3k-input--invalid',
        disabled && 'ex3k-is-disabled',
        readOnly && 'ex3k-is-readonly',
        className,
      )}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

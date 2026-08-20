import type {ReactNode} from 'react';
import {joinClasses} from './lib';

export type Ex3FieldProps = {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function Ex3Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  disabled,
  children,
  className,
}: Ex3FieldProps) {
  return (
    <div
      className={joinClasses(
        'ex3k-field',
        error && 'ex3k-field--invalid',
        disabled && 'ex3k-field--disabled',
        className,
      )}
    >
      <div className="ex3k-field__control">
        {label ? (
          <label
            htmlFor={htmlFor}
            className={joinClasses('ex3k-field__label', required && 'ex3k-field__label--required')}
          >
            {label}
          </label>
        ) : null}
        {children}
      </div>
      {error ? <span className="ex3k-field__error">{error}</span> : null}
      {!error && hint ? <span className="ex3k-field__hint">{hint}</span> : null}
    </div>
  );
}

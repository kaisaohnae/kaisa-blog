import type {ReactNode} from 'react';
import {UiLabel} from '../label/ui-label';
import {joinClasses} from '../lib/control-utils';

export type UiFieldProps = {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function UiField({
  label,
  htmlFor,
  required,
  hint,
  error,
  disabled,
  children,
  className,
}: UiFieldProps) {
  return (
    <div
      className={joinClasses(
        'ui-field',
        error && 'ui-field--invalid',
        disabled && 'ui-field--disabled',
        className,
      )}
    >
      {label ? (
        <UiLabel htmlFor={htmlFor} required={required}>
          {label}
        </UiLabel>
      ) : null}
      {children}
      {error ? <p className="ui-field__error">{error}</p> : null}
      {!error && hint ? <p className="ui-field__hint">{hint}</p> : null}
    </div>
  );
}

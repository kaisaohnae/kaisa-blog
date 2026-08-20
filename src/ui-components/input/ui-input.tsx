import type {InputHTMLAttributes} from 'react';
import {joinClasses} from '../lib/control-utils';

export type UiInputSize = 'sm' | 'md' | 'lg';

export type UiInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  uiSize?: UiInputSize;
  invalid?: boolean;
};

export function UiInput({
  uiSize = 'md',
  invalid,
  className,
  disabled,
  readOnly,
  ...props
}: UiInputProps) {
  return (
    <input
      className={joinClasses(
        'ui-input',
        `ui-input--${uiSize}`,
        invalid && 'ui-input--invalid',
        disabled && 'ui-is-disabled',
        readOnly && 'ui-is-readonly',
        className,
      )}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

import type {TextareaHTMLAttributes} from 'react';
import {joinClasses} from '../lib/control-utils';

export type UiTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function UiTextarea({
  invalid,
  className,
  disabled,
  readOnly,
  ...props
}: UiTextareaProps) {
  return (
    <textarea
      className={joinClasses(
        'ui-textarea',
        invalid && 'ui-textarea--invalid',
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

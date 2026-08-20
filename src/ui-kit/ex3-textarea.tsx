import type {TextareaHTMLAttributes} from 'react';
import {joinClasses} from './lib';

export type Ex3TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Ex3Textarea({
  invalid,
  className,
  disabled,
  readOnly,
  placeholder = ' ',
  ...props
}: Ex3TextareaProps) {
  return (
    <textarea
      className={joinClasses(
        'ex3k-textarea',
        invalid && 'ex3k-textarea--invalid',
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

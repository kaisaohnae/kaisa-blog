import type {InputHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from './lib';

export type Ex3ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
};

export function Ex3Toggle({label, description, className, disabled, ...props}: Ex3ToggleProps) {
  return (
    <label className={joinClasses('ex3k-toggle', disabled && 'is-disabled', className)}>
      <input type="checkbox" className="ex3k-toggle__input" disabled={disabled} {...props} />
      <span className="ex3k-toggle__track" aria-hidden="true">
        <span className="ex3k-toggle__thumb" />
      </span>
      <span className="ex3k-toggle__copy">
        <span className="ex3k-toggle__label">{label}</span>
        {description ? <span className="ex3k-toggle__desc">{description}</span> : null}
      </span>
    </label>
  );
}

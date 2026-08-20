import type {InputHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from './lib';

export type Ex3CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
};

export function Ex3Checkbox({label, description, className, disabled, ...props}: Ex3CheckboxProps) {
  return (
    <label className={joinClasses('ex3k-check', disabled && 'is-disabled', description ? 'ex3k-check--desc' : undefined, className)}>
      <input type="checkbox" className="ex3k-check__input" disabled={disabled} {...props} />
      <span className="ex3k-check__chip">
        <span className="ex3k-check__mark" aria-hidden="true" />
        <span className="ex3k-check__copy">
          <span className="ex3k-check__label">{label}</span>
          {description ? <span className="ex3k-check__desc">{description}</span> : null}
        </span>
      </span>
    </label>
  );
}

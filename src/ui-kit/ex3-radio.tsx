import type {InputHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from './lib';

export type Ex3RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
};

export function Ex3Radio({label, description, className, disabled, ...props}: Ex3RadioProps) {
  return (
    <label className={joinClasses('ex3k-radio', disabled && 'is-disabled', className)}>
      <input type="radio" className="ex3k-radio__input" disabled={disabled} {...props} />
      <span className="ex3k-radio__card">
        <span className="ex3k-radio__mark" aria-hidden="true" />
        <span className="ex3k-radio__copy">
          <span className="ex3k-radio__label">{label}</span>
          {description ? <span className="ex3k-radio__desc">{description}</span> : null}
        </span>
      </span>
    </label>
  );
}

export type Ex3RadioGroupProps = {
  children: ReactNode;
  row?: boolean;
  className?: string;
  invalid?: boolean;
  'aria-label'?: string;
};

export function Ex3RadioGroup({
  children,
  row,
  className,
  invalid,
  'aria-label': ariaLabel,
}: Ex3RadioGroupProps) {
  return (
    <div
      className={joinClasses(
        'ex3k-radio-group',
        row && 'ex3k-radio-group--row',
        invalid && 'ex3k-radio-group--invalid',
        className,
      )}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
    >
      {children}
    </div>
  );
}

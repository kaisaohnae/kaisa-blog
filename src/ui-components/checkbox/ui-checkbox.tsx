import type {InputHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from '../lib/control-utils';

export type UiCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
};

export function UiCheckbox({label, description, className, disabled, ...props}: UiCheckboxProps) {
  return (
    <label
      className={joinClasses(
        'ui-check',
        disabled && 'ui-control--disabled',
        description ? 'ui-check--with-desc' : undefined,
        className,
      )}
    >
      <input type="checkbox" className="ui-check__input" disabled={disabled} {...props} />
      <span className="ui-check__control" aria-hidden="true" />
      <span className="ui-choice__content">
        <span className="ui-choice__label">{label}</span>
        {description ? <span className="ui-choice__desc">{description}</span> : null}
      </span>
    </label>
  );
}

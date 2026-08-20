import type {InputHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from '../lib/control-utils';

export type UiToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
};

export function UiToggle({label, description, className, disabled, ...props}: UiToggleProps) {
  return (
    <label
      className={joinClasses(
        'ui-toggle',
        disabled && 'ui-control--disabled',
        description ? 'ui-toggle--with-desc' : undefined,
        className,
      )}
    >
      <input type="checkbox" className="ui-toggle__input" disabled={disabled} {...props} />
      <span className="ui-toggle__track" aria-hidden="true">
        <span className="ui-toggle__thumb" />
      </span>
      <span className="ui-choice__content">
        <span className="ui-choice__label">{label}</span>
        {description ? <span className="ui-choice__desc">{description}</span> : null}
      </span>
    </label>
  );
}

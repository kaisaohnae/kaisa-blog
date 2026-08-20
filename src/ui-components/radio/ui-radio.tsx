import type {InputHTMLAttributes, ReactNode} from 'react';
import {joinClasses} from '../lib/control-utils';

export type UiRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
};

export function UiRadio({label, description, className, disabled, ...props}: UiRadioProps) {
  return (
    <label
      className={joinClasses(
        'ui-radio',
        disabled && 'ui-control--disabled',
        description ? 'ui-radio--with-desc' : undefined,
        className,
      )}
    >
      <input type="radio" className="ui-radio__input" disabled={disabled} {...props} />
      <span className="ui-radio__control" aria-hidden="true" />
      <span className="ui-choice__content">
        <span className="ui-choice__label">{label}</span>
        {description ? <span className="ui-choice__desc">{description}</span> : null}
      </span>
    </label>
  );
}

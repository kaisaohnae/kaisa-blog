import type {ReactNode} from 'react';
import {joinClasses} from '../lib/control-utils';

export type UiRadioGroupProps = {
  children: ReactNode;
  row?: boolean;
  className?: string;
  invalid?: boolean;
  'aria-label'?: string;
};

export function UiRadioGroup({
  children,
  row,
  className,
  invalid,
  'aria-label': ariaLabel,
}: UiRadioGroupProps) {
  return (
    <div
      className={joinClasses(
        'ui-radio-group',
        row && 'ui-radio-group--row',
        invalid && 'ui-radio-group--invalid',
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

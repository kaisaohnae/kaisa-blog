import type {SelectHTMLAttributes} from 'react';
import {joinClasses} from '../lib/control-utils';

export type UiSelectSize = 'sm' | 'md' | 'lg';

export type UiSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  uiSize?: UiSelectSize;
  invalid?: boolean;
};

export function UiSelect({
  uiSize = 'md',
  invalid,
  className,
  disabled,
  children,
  ...props
}: UiSelectProps) {
  return (
    <select
      className={joinClasses(
        'ui-select',
        `ui-select--${uiSize}`,
        invalid && 'ui-select--invalid',
        disabled && 'ui-is-disabled',
        className,
      )}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

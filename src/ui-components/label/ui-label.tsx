import type {LabelHTMLAttributes, ReactNode} from 'react';

export type UiLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  children: ReactNode;
};

export function UiLabel({required, className, children, ...props}: UiLabelProps) {
  return (
    <label
      className={['ui-label', required ? 'ui-label--required' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </label>
  );
}

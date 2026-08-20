import {joinClasses} from '../lib/control-utils';

export type UiSpinnerVariant = 'ring' | 'dots' | 'bars' | 'pulse';
export type UiSpinnerSize = 'sm' | 'md' | 'lg';

export type UiSpinnerProps = {
  variant?: UiSpinnerVariant;
  uiSize?: UiSpinnerSize;
  label?: string;
  className?: string;
};

export function UiSpinner({
  variant = 'ring',
  uiSize = 'md',
  label = '로딩 중',
  className,
}: UiSpinnerProps) {
  const rootClass = joinClasses(
    'ui-spinner',
    `ui-spinner--${variant}`,
    `ui-spinner--${uiSize}`,
    className,
  );

  if (variant === 'dots') {
    return (
      <span className={rootClass} role="status" aria-label={label}>
        <span className="ui-spinner__dot" />
        <span className="ui-spinner__dot" />
        <span className="ui-spinner__dot" />
      </span>
    );
  }

  if (variant === 'bars') {
    return (
      <span className={rootClass} role="status" aria-label={label}>
        <span className="ui-spinner__bar" />
        <span className="ui-spinner__bar" />
        <span className="ui-spinner__bar" />
        <span className="ui-spinner__bar" />
      </span>
    );
  }

  if (variant === 'pulse') {
    return <span className={rootClass} role="status" aria-label={label} />;
  }

  return <span className={rootClass} role="status" aria-label={label} />;
}

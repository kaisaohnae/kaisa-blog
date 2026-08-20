import {joinClasses} from './lib';

export type Ex3SpinnerVariant =
  | 'ring'
  | 'dots'
  | 'bars'
  | 'pulse'
  | 'orbit'
  | 'dash'
  | 'wave'
  | 'diamond';
export type Ex3SpinnerSize = 'sm' | 'md' | 'lg';

export type Ex3SpinnerProps = {
  variant?: Ex3SpinnerVariant;
  uiSize?: Ex3SpinnerSize;
  label?: string;
  className?: string;
};

export function Ex3Spinner({
  variant = 'ring',
  uiSize = 'md',
  label = 'Loading',
  className,
}: Ex3SpinnerProps) {
  const rootClass = joinClasses('ex3k-spinner', `ex3k-spinner--${variant}`, `ex3k-spinner--${uiSize}`, className);

  if (variant === 'dots') {
    return (
      <span className={rootClass} role="status" aria-label={label}>
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (variant === 'bars') {
    return (
      <span className={rootClass} role="status" aria-label={label}>
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (variant === 'wave') {
    return (
      <span className={rootClass} role="status" aria-label={label}>
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (variant === 'orbit') {
    return (
      <span className={rootClass} role="status" aria-label={label}>
        <span className="ex3k-spinner__core" />
        <span className="ex3k-spinner__sat" />
      </span>
    );
  }

  if (variant === 'pulse' || variant === 'diamond') {
    return <span className={rootClass} role="status" aria-label={label} />;
  }

  return (
    <span className={rootClass} role="status" aria-label={label}>
      <span className="ex3k-spinner__orbit" />
      {variant === 'ring' ? <span className="ex3k-spinner__orbit ex3k-spinner__orbit--alt" /> : null}
    </span>
  );
}

'use client';

import {createPortal} from 'react-dom';
import {Ex3Spinner, type Ex3SpinnerVariant} from './ex3-spinner';

export type Ex3LoadingTone = 'light' | 'dark' | 'blur';

export type Ex3LoadingProps = {
  open: boolean;
  variant?: Ex3SpinnerVariant;
  message?: string;
  overlay?: Ex3LoadingTone;
};

export function Ex3Loading({open, variant = 'ring'}: Ex3LoadingProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="ex3k-loading" role="status" aria-live="polite" aria-busy="true">
      <Ex3Spinner variant={variant} uiSize="lg" />
    </div>,
    document.body,
  );
}

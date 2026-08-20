'use client';

import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Ex3Button} from './ex3-button';

export type Ex3AlertProps = {
  open: boolean;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function Ex3Alert({
  open,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
}: Ex3AlertProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="ex3k-overlay" role="presentation">
      <div className="ex3k-dialog ex3k-dialog--alert" role="alertdialog" aria-live="assertive">
        <p className="ex3k-dialog__message">{message}</p>
        <div className="ex3k-dialog__actions">
          {cancelText ? (
            <Ex3Button variant="ghost" onClick={onCancel}>
              {cancelText}
            </Ex3Button>
          ) : null}
          <Ex3Button variant={cancelText ? 'danger' : 'primary'} onClick={onConfirm ?? onCancel}>
            {confirmText}
          </Ex3Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

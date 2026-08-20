'use client';

import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Ex3Button} from './ex3-button';

export type Ex3PopupProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  hideOnBackdrop?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function Ex3Popup({
  open,
  title,
  message,
  confirmText = 'OK',
  cancelText,
  hideOnBackdrop = true,
  onConfirm,
  onCancel,
}: Ex3PopupProps) {
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
    <div
      className="ex3k-overlay"
      role="presentation"
      onClick={() => {
        if (hideOnBackdrop) onCancel?.();
      }}
    >
      <div
        className="ex3k-dialog ex3k-dialog--popup"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <h3 className="ex3k-dialog__title">{title}</h3> : null}
        <p className="ex3k-dialog__message">{message}</p>
        <div className="ex3k-dialog__actions">
          {cancelText ? (
            <Ex3Button variant="ghost" onClick={onCancel}>
              {cancelText}
            </Ex3Button>
          ) : null}
          <Ex3Button onClick={onConfirm ?? onCancel}>{confirmText}</Ex3Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

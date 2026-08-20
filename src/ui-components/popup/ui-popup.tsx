'use client';

import {useCallback} from 'react';
import usePopupStore from '@/store/use-popup-store';

export default function UiPopup() {
  const popup = usePopupStore(useCallback((state) => state.popup, []));
  const hidePopup = usePopupStore.getState().hidePopup;

  if (!popup) {
    return null;
  }

  const handleConfirm = () => {
    popup.onConfirm?.();
    hidePopup();
  };

  const handleCancel = () => {
    popup.onCancel?.();
    hidePopup();
  };

  const handleBackdropClick = () => {
    if (popup.hideOnBackdrop !== false) {
      hidePopup();
    }
  };

  return (
    <div id="ui-popup" className="ui-popup" role="dialog" aria-modal="true">
      <button
        type="button"
        className="ui-popup__backdrop"
        aria-label="닫기"
        onClick={handleBackdropClick}
      />
      <div className="ui-popup__panel">
        {popup.title ? <h2 className="ui-popup__title">{popup.title}</h2> : null}
        {popup.message ? <div className="ui-popup__message">{popup.message}</div> : null}
        <div className="ui-popup__actions">
          {popup.cancelText ? (
            <button type="button" className="ui-popup__btn ui-popup__btn--ghost" onClick={handleCancel}>
              {popup.cancelText}
            </button>
          ) : null}
          <button type="button" className="ui-popup__btn ui-popup__btn--primary" onClick={handleConfirm}>
            {popup.confirmText ?? '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}

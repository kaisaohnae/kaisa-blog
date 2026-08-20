'use client';

import React, { useCallback } from 'react';
import useAlertStore from '@/store/use-alert-store';

export default function UiAlert() {
  const alert = useAlertStore(useCallback((state) => state.alert, []));
  const { hideAlert } = useAlertStore.getState();
  if (!alert) {
    return null;
  }
  return (
    <div id="alert">
      <div className="box">
        <div className="message">{alert.message}</div>
        <div className="buttons">
          {alert.button && alert.button.length > 0 ? (
            alert.button.map((btn: any, index: number) => (
              <button
                key={index as any}
                className={btn.type === 'on' ? 'on' : 'off'}
                style={btn.rate ? { flex: btn.rate } : { flex: 1 }}
                onClick={btn.callback}
              >
                {btn.text}
              </button>
            ))
          ) : (
            <button className="on" onClick={hideAlert}>
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

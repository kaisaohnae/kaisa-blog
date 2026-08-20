'use client';

import {useCallback} from 'react';
import useLoadingStore from '@/store/use-loading-store';
import {UiSpinner} from '../spinner/ui-spinner';
import {joinClasses} from '../lib/control-utils';

export default function UiLoading() {
  const loading = useLoadingStore(useCallback((state) => state.loading, []));
  const variant = useLoadingStore(useCallback((state) => state.variant, []));
  const message = useLoadingStore(useCallback((state) => state.message, []));
  const overlay = useLoadingStore(useCallback((state) => state.overlay, []));

  if (!loading) {
    return null;
  }

  return (
    <div
      id="loading"
      className={joinClasses('ui-loading-overlay', `ui-loading-overlay--${overlay}`)}
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="ui-loading-overlay__panel">
        <UiSpinner variant={variant} uiSize="lg" />
        {message ? <p className="ui-loading-overlay__message">{message}</p> : null}
      </div>
    </div>
  );
}

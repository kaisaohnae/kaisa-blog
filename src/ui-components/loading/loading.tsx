'use client';

import {useCallback} from 'react';
import useLoadingStore from '@/store/use-loading-store';
import {UiSpinner} from '../spinner/ui-spinner';

export default function UiLoading() {
  const loading = useLoadingStore(useCallback((state) => state.loading, []));
  const variant = useLoadingStore(useCallback((state) => state.variant, []));

  if (!loading) {
    return null;
  }

  return (
    <div id="loading" className="ui-loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <UiSpinner variant={variant} uiSize="lg" />
    </div>
  );
}

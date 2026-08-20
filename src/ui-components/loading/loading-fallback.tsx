'use client';

import {UiSpinner} from '../spinner/ui-spinner';
import {joinClasses} from '../lib/control-utils';

type LoadingFallbackProps = {
  className?: string;
};

export default function LoadingFallback({className}: LoadingFallbackProps) {
  return (
    <div className={joinClasses('page-loading', className)} role="status" aria-live="polite" aria-busy="true">
      <UiSpinner variant="ring" uiSize="lg" />
    </div>
  );
}

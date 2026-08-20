'use client';

import SiteValidator from '@/components/site-validator';
import {useState, Suspense} from 'react';

export default function LayoutSub({children}: Readonly<{children: React.ReactNode}>) {
  const [isReady, setReady] = useState(false);

  return (
    <Suspense>
      <div id="content">{isReady && children}</div>
      <SiteValidator onReady={() => setReady(true)} />
    </Suspense>
  );
}

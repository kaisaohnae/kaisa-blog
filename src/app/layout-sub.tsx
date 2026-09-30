'use client';

import SiteValidator from '@/components/site-validator';
import {useState, Suspense} from 'react';

export default function LayoutSub({children}: Readonly<{children: React.ReactNode}>) {
  const [isReady, setReady] = useState(false);

  return (
    // Static export renders this boundary as its fallback (SiteValidator reads search params),
    // so the fallback must hold the page height or the footer jumps up under the header.
    <Suspense fallback={<div id="content" className="content--pending" aria-busy="true" />}>
      <div id="content" className={isReady ? undefined : 'content--pending'} aria-busy={isReady ? undefined : true}>
        {isReady && children}
      </div>
      <SiteValidator onReady={() => setReady(true)} />
    </Suspense>
  );
}

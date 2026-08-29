'use client';

import {Suspense, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';

function IssuesRedirect() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const qs = search.toString();
    router.replace(qs ? `/posts/?${qs}` : '/posts/');
  }, [router, search]);

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IssuesRedirect />
    </Suspense>
  );
}

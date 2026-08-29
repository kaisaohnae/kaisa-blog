'use client';

import {Suspense, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';

function IssuesViewRedirect() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const qs = search.toString();
    router.replace(qs ? `/posts/view/?${qs}` : '/posts/');
  }, [router, search]);

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IssuesViewRedirect />
    </Suspense>
  );
}

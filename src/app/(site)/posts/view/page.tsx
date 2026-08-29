import {Suspense} from 'react';
import BlogPostViewPage from '@/components/blog/blog-post-view-page';
import {LoadingFallback} from '@/ui-components';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="blog-main">
          <LoadingFallback />
        </main>
      }
    >
      <BlogPostViewPage listHref="/posts/" />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';

type BlogPaginationProps = {
  currentPage: number;
  lastPage: number;
  buildHref: (page: number) => string;
};

function pageWindow(current: number, last: number): number[] {
  if (last <= 7) {
    return Array.from({length: last}, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, last, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= last - 2) {
    pages.add(last - 1);
    pages.add(last - 2);
    pages.add(last - 3);
  }

  return [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
}

export default function BlogPagination({currentPage, lastPage, buildHref}: BlogPaginationProps) {
  if (lastPage <= 1) return null;

  const pages = pageWindow(currentPage, lastPage);

  return (
    <nav className="blog-pagination" aria-label="페이지">
      {currentPage > 1 ? (
        <Link href={buildHref(currentPage - 1)} className="blog-pagination__nav" rel="prev">
          이전
        </Link>
      ) : (
        <span className="blog-pagination__nav blog-pagination__nav--disabled" aria-disabled="true">
          이전
        </span>
      )}

      <ol className="blog-pagination__pages">
        {pages.map((page, index) => {
          const prev = pages[index - 1];
          const showGap = prev !== undefined && page - prev > 1;
          return (
            <li key={page} className="blog-pagination__item">
              {showGap && <span className="blog-pagination__gap">…</span>}
              {page === currentPage ? (
                <span className="blog-pagination__page blog-pagination__page--current" aria-current="page">
                  {page}
                </span>
              ) : (
                <Link href={buildHref(page)} className="blog-pagination__page">
                  {page}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {currentPage < lastPage ? (
        <Link href={buildHref(currentPage + 1)} className="blog-pagination__nav" rel="next">
          다음
        </Link>
      ) : (
        <span className="blog-pagination__nav blog-pagination__nav--disabled" aria-disabled="true">
          다음
        </span>
      )}
    </nav>
  );
}

export function buildHomeListHref(params: {
  page: number;
  keyword?: string;
  categoryId?: string;
  basePath?: string;
}): string {
  const base = params.basePath ?? '/posts/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  const search = new URLSearchParams();
  if (params.keyword) search.set('q', params.keyword);
  if (params.categoryId) search.set('categoryId', params.categoryId);
  if (params.page > 1) search.set('page', String(params.page));
  const qs = search.toString();
  return qs ? `${normalized}?${qs}` : normalized;
}

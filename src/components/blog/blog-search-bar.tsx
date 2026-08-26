'use client';

import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useState, type FormEvent} from 'react';
import {Ex3Field, Ex3Input} from '@/ui-kit';

type BlogSearchBarProps = {
  className?: string;
  listBasePath?: string;
};

export default function BlogSearchBar({
  className,
  listBasePath = '/issues/',
}: BlogSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const [query, setQuery] = useState(urlQuery);
  const base = listBasePath.endsWith('/') ? listBasePath : `${listBasePath}/`;

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const runSearch = () => {
    const next = query.trim();
    const params = new URLSearchParams();
    if (next) params.set('q', next);
    if (categoryId) params.set('categoryId', categoryId);
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    runSearch();
  };

  return (
    <form
      className={['blog-search', 'ex3-kit', className].filter(Boolean).join(' ')}
      onSubmit={submit}
      role="search"
    >
      <Ex3Field label="글 검색" htmlFor="blog-search" className="blog-search__field">
        <Ex3Input
          id="blog-search"
          type="search"
          uiSize="sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Ex3Field>
      <button
        type="button"
        className="blog-search__btn"
        aria-label="검색"
        onClick={(event) => {
          event.preventDefault();
          runSearch();
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

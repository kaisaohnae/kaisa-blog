'use client';

import {Suspense, useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {apiPost} from '@/config/api-config';
import BlogPostCard, {type BlogListItem} from '@/components/blog/blog-post-card';
import BlogSearchBar from '@/components/blog/blog-search-bar';
import BlogCategoryFilter, {findCategoryLabel, type BlogCategory} from '@/components/blog/blog-category-filter';
import BlogPagination, {buildHomeListHref} from '@/components/blog/blog-pagination';

const PAGE_SIZE = 10;

type PostListResponse = {
  list: BlogListItem[];
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
};

function BlogHomeContent({listBasePath = '/posts/'}: {listBasePath?: string}) {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('q')?.trim() || '';
  const categoryId = searchParams.get('categoryId')?.trim() || '';
  const pageParam = Number(searchParams.get('page') || '1');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const base = listBasePath.endsWith('/') ? listBasePath : `${listBasePath}/`;

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiPost<{list: BlogCategory[]; totalPostCount?: number}>('bl/get-category-list', {})
      .then((body) => {
        setCategories(body.data.list || []);
        setTotalPostCount(body.data.totalPostCount ?? 0);
      })
      .catch(() => {
        setCategories([]);
        setTotalPostCount(0);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const payload: {
      pageSize: number;
      totalPage: number;
      page: number;
      keyword?: string;
      categoryId?: number;
    } = {
      pageSize: PAGE_SIZE,
      totalPage: PAGE_SIZE,
      page,
    };
    if (keyword) payload.keyword = keyword;
    if (categoryId && Number.isFinite(Number(categoryId))) {
      payload.categoryId = Number(categoryId);
    }

    apiPost<PostListResponse>('bl/get-post-list', payload)
      .then((body) => {
        const data = body.data;
        setPosts(data.list || []);
        setCurrentPage(data.currentPage ?? page);
        setLastPage(Math.max(1, data.lastPage ?? 1));
      })
      .catch((e) => {
        setPosts([]);
        setCurrentPage(1);
        setLastPage(1);
        setError(e.message || '글을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [keyword, categoryId, page]);

  const categoryName = useMemo(
    () => findCategoryLabel(categories, categoryId),
    [categories, categoryId],
  );

  const emptyMessage = useMemo(() => {
    if (keyword && categoryName) {
      return `"${categoryName}" · "${keyword}"에 대한 검색 결과가 없습니다.`;
    }
    if (keyword) {
      return `"${keyword}"에 대한 검색 결과가 없습니다.`;
    }
    if (categoryName) {
      return `"${categoryName}" 카테고리에 공개된 글이 없습니다.`;
    }
    return '아직 공개된 글이 없습니다.';
  }, [categoryName, keyword]);

  const buildHref = (nextPage: number) =>
    buildHomeListHref({page: nextPage, keyword, categoryId, basePath: base});

  return (
    <main className="blog-main">
      <div className="site-shell">
        <div className="site-shell__inner blog-home">
          <div className="blog-search-area">
            <BlogSearchBar className="blog-search--home" listBasePath={base} />
            <BlogCategoryFilter
              categories={categories}
              totalPostCount={totalPostCount}
              listBasePath={base}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <section className="blog-list" aria-label="Posts">
            {posts.map((post) => (
              <BlogPostCard key={post.postNo} post={post} detailBasePath="/posts/view/" />
            ))}
            {!loading && !error && posts.length === 0 && <p className="muted empty-state">{emptyMessage}</p>}
          </section>
          {!loading && !error && lastPage > 1 && (
            <div className="blog-list-footer">
              <BlogPagination currentPage={currentPage} lastPage={lastPage} buildHref={buildHref} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function BlogHomePage({listBasePath = '/posts/'}: {listBasePath?: string}) {
  return (
    <Suspense fallback={<main className="blog-main" aria-busy="true" />}>
      <BlogHomeContent listBasePath={listBasePath} />
    </Suspense>
  );
}

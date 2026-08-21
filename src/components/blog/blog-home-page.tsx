'use client';

import {Suspense, useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {apiPost} from '@/config/api-config';
import BlogPostCard, {type BlogListItem} from '@/components/blog/blog-post-card';
import BlogSearchBar from '@/components/blog/blog-search-bar';
import BlogCategoryFilter, {findCategoryLabel, type BlogCategory} from '@/components/blog/blog-category-filter';

function BlogHomeContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('q')?.trim() || '';
  const categoryId = searchParams.get('categoryId')?.trim() || '';
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [posts, setPosts] = useState<BlogListItem[]>([]);
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
    const payload: {totalPage: number; keyword?: string; categoryId?: number} = {totalPage: 20};
    if (keyword) payload.keyword = keyword;
    if (categoryId && Number.isFinite(Number(categoryId))) {
      payload.categoryId = Number(categoryId);
    }

    apiPost<{list: BlogListItem[]}>('bl/get-post-list', payload)
      .then((body) => setPosts(body.data.list || []))
      .catch((e) => {
        setPosts([]);
        setError(e.message || '글을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [keyword, categoryId]);

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

  return (
    <main className="blog-main">
      <div className="site-shell">
        <div className="site-shell__inner blog-home">
          <div className="blog-search-area">
            <BlogSearchBar className="blog-search--home" />
            <BlogCategoryFilter categories={categories} totalPostCount={totalPostCount} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <section className="blog-list" aria-label="Blog posts">
            {posts.map((post) => (
              <BlogPostCard key={post.postNo} post={post} />
            ))}
            {!loading && !error && posts.length === 0 && <p className="muted empty-state">{emptyMessage}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function BlogHomePage() {
  return (
    <Suspense fallback={<main className="blog-main" aria-busy="true" />}>
      <BlogHomeContent />
    </Suspense>
  );
}

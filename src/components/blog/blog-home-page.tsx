'use client';

import {useEffect, useState} from 'react';
import {apiPost} from '@/config/api-config';
import BlogPostCard, {type BlogListItem} from '@/components/blog/blog-post-card';

export default function BlogHomePage() {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiPost<{list: BlogListItem[]}>('bl/get-post-list', {totalPage: 20})
      .then((body) => setPosts(body.data.list || []))
      .catch((e) => setError(e.message || '글을 불러오지 못했습니다.'));
  }, []);

  return (
    <main className="blog-main">
      <div className="site-shell">
        <div className="site-shell__inner">
          {error && <p className="form-error">{error}</p>}
          <section className="blog-list" aria-label="Blog posts">
            {posts.map((post) => (
              <BlogPostCard key={post.postNo} post={post} />
            ))}
            {!error && posts.length === 0 && <p className="muted empty-state">아직 공개된 글이 없습니다.</p>}
          </section>
        </div>
      </div>
    </main>
  );
}

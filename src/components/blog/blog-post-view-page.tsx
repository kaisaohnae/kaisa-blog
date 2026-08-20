'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {apiPost} from '@/config/api-config';
import CommentSection from '@/components/blog/comment-section';
import PostContent from '@/components/blog/post-content';
import {isPostRead, markPostAsRead} from '@/lib/read-posts-storage';
type Post = {
  postNo: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  createDt?: string;
  category?: {categoryName?: string};
};

export default function BlogPostViewPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setError('글 주소가 없습니다.');
      return;
    }
    const alreadyRead = isPostRead({slug});
    apiPost<Post>('bl/get-post', {slug, countView: alreadyRead ? 'N' : 'Y'})
      .then((body) => {
        const nextPost = body.data;
        setPost(nextPost);
        if (!alreadyRead && nextPost?.postNo) {
          markPostAsRead(nextPost.postNo, nextPost.slug || slug);
        }
      })
      .catch((e) => setError(e.message || '글을 불러오지 못했습니다.'));
  }, [slug]);

  if (error) {
    return (
      <main className="blog-main">
        <div className="site-shell">
          <p className="form-error">{error}</p>
          <Link href="/">목록으로</Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="blog-main">
        <div className="site-shell" />
      </main>
    );
  }

  return (
    <main className="blog-main">
      <div className="site-shell">
        <article className="blog-post site-shell__inner">
          <Link href="/" className="blog-post__back">
            ← 목록으로
          </Link>
          <div className="blog-post__meta">
            <span>{post.createDt ? String(post.createDt).slice(0, 10) : ''}</span>
            <span>{post.category?.categoryName}</span>
          </div>
          <h1 className="blog-post__title">{post.title}</h1>
          <PostContent content={post.content || ''} />
          <CommentSection postNo={post.postNo} />
        </article>
      </div>
    </main>
  );
}

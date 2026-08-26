import Link from 'next/link';
import PostContent from '@/components/blog/post-content';
import type {BlogPost} from '@/data/blog-posts';

export default function BlogPostPage({post}: {post: BlogPost}) {
  return (
    <main className="blog-main">
      <div className="site-shell">
        <article className="blog-post site-shell__inner">
          <Link href="/posts/" className="blog-post__back">
            ← 목록으로
          </Link>
          <div className="blog-post__meta">
            <span>{post.publishedAt}</span>
          </div>
          <h1 className="blog-post__title">{post.title}</h1>
          <PostContent content={post.content.trim()} />
        </article>
      </div>
    </main>
  );
}

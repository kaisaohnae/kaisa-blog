import Link from 'next/link';
import PostContent from '@/components/blog/post-content';
import type {BlogPost} from '@/data/blog-posts';

export default function BlogPostPage({
  post,
  prev,
  next,
}: {
  post: BlogPost;
  prev?: BlogPost | null;
  next?: BlogPost | null;
}) {
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

          <nav className="blog-post__footer-nav" aria-label="포스트 이동">
            {(prev || next) && (
              <div className="blog-post__adjacent">
                {prev ? (
                  <Link href={`/posts/${prev.slug}/`} className="blog-post__adjacent-link">
                    <span className="blog-post__adjacent-label">이전 글</span>
                    <span className="blog-post__adjacent-title">{prev.title}</span>
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={`/posts/${next.slug}/`}
                    className="blog-post__adjacent-link blog-post__adjacent-link--next"
                  >
                    <span className="blog-post__adjacent-label">다음 글</span>
                    <span className="blog-post__adjacent-title">{next.title}</span>
                  </Link>
                ) : null}
              </div>
            )}
            <Link href="/posts/" className="blog-post__back blog-post__back--footer">
              ← 목록으로
            </Link>
          </nav>
        </article>
      </div>
    </main>
  );
}

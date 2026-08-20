import BlogPostCard from '@/components/blog/blog-post-card';
import {BLOG_POSTS} from '@/data/blog-posts';

export default function BlogHomePage() {
  return (
    <main className="blog-main">
      <div className="site-shell">
        <div className="site-shell__inner">
          <section className="blog-hero">
            <p className="blog-hero__eyebrow">Kaisa Blog</p>
            <h1 className="blog-hero__title">기록과 아이디어를 남기는 공간</h1>
            <p className="blog-hero__desc">
              kaisa-fo와 같은 Next.js 프레임워크 기반으로 시작한 블로그 프로젝트입니다. API 연동 전까지는 로컬 mock 데이터로 동작합니다.
            </p>
          </section>
          <section className="blog-list" aria-label="Blog posts">
            {BLOG_POSTS.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';

export type BlogListItem = {
  postNo: number;
  slug: string;
  title: string;
  excerpt?: string;
  createDt?: string;
  viewCount?: number;
  category?: {categoryName?: string};
};

export default function BlogPostCard({post}: {post: BlogListItem}) {
  return (
    <Link href={`/posts/view/?slug=${encodeURIComponent(post.slug)}`} className="blog-card">
      <div className="blog-card__meta">
        <span>{post.createDt ? String(post.createDt).slice(0, 10) : ''}</span>
        <span>{post.category?.categoryName || 'Blog'}</span>
        <span>조회 {post.viewCount ?? 0}</span>
      </div>
      <h2 className="blog-card__title">{post.title}</h2>
      <p className="blog-card__excerpt">{post.excerpt}</p>
    </Link>
  );
}

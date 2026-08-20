import Link from 'next/link';
import type {BlogPost} from '@/data/blog-posts';

export default function BlogPostCard({post}: {post: BlogPost}) {
  return (
    <Link href={`/posts/${post.slug}/`} className="blog-card">
      <div className="blog-card__meta">
        <span>{post.publishedAt}</span>
        <span>{post.category}</span>
        <span>{post.readingMinutes} min read</span>
      </div>
      <h2 className="blog-card__title">{post.title}</h2>
      <p className="blog-card__excerpt">{post.excerpt}</p>
      <div className="blog-card__tags">
        {post.tags.map((tag) => (
          <span key={tag} className="blog-tag">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

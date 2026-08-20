import BlogPostPage from '@/components/blog/blog-post-page';
import {getBlogPost, getBlogPostSlugs} from '@/data/blog-posts';
import {notFound} from 'next/navigation';

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({slug}));
}

export default function Page({params}: {params: {slug: string}}) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}

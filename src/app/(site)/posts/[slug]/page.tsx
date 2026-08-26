import type {Metadata} from 'next';
import BlogPostPage from '@/components/blog/blog-post-page';
import JsonLd from '@/components/seo/json-ld';
import {getBlogPost, getBlogPostSlugs} from '@/data/blog-posts';
import {postJsonLd, postPageMetadata} from '@/lib/seo';
import {notFound} from 'next/navigation';

export function generateStaticParams() {
  return getBlogPostSlugs().map(slug => ({slug}));
}

export function generateMetadata({params}: {params: {slug: string}}): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return postPageMetadata(post);
}

export default function Page({params}: {params: {slug: string}}) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();
  return (
    <>
      <JsonLd data={postJsonLd(post)} />
      <BlogPostPage post={post} />
    </>
  );
}

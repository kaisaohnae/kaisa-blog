import type {Metadata} from 'next';
import BlogPostPage from '@/components/blog/blog-post-page';
import JsonLd from '@/components/seo/json-ld';
import {getAdjacentBlogPosts, getBlogPost, getBlogPostSlugs} from '@/data/blog-posts';
import {postJsonLd, postPageMetadata} from '@/lib/seo';
import {notFound} from 'next/navigation';

type PageProps = {
  params: Promise<{slug: string}>;
};

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return postPageMetadata(post);
}

export default async function Page({params}: PageProps) {
  const {slug} = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const {prev, next} = getAdjacentBlogPosts(slug);

  return (
    <>
      <JsonLd data={postJsonLd(post)} />
      <BlogPostPage post={post} prev={prev} next={next} />
    </>
  );
}

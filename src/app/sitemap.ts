import type {MetadataRoute} from 'next';
import {absoluteUrl} from '@/config/site';
import {getAllBlogPosts} from '@/data/blog-posts';

export const dynamic = 'force-static';

const PUBLIC_PAGES = ['/', '/posts/', '/issues/', '/login/', '/register/', '/find-id/', '/reset-password/'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = PUBLIC_PAGES.map(path => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' || path === '/posts/' ? 'daily' : 'monthly',
    priority: path === '/' || path === '/posts/' ? 1 : path === '/issues/' ? 0.5 : 0.4,
  }));

  const posts: MetadataRoute.Sitemap = getAllBlogPosts().map(post => ({
    url: absoluteUrl(`/posts/${post.slug}/`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...posts];
}

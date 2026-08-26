import type {MetadataRoute} from 'next';
import {absoluteUrl} from '@/config/site';
import {getBlogPostSlugs} from '@/data/blog-posts';

export const dynamic = 'force-static';

const PUBLIC_PAGES = ['/', '/login/', '/register/', '/find-id/', '/reset-password/'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = PUBLIC_PAGES.map(path => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'monthly',
    priority: path === '/' ? 1 : 0.4,
  }));

  const posts: MetadataRoute.Sitemap = getBlogPostSlugs().map(slug => ({
    url: absoluteUrl(`/posts/${slug}/`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...posts];
}

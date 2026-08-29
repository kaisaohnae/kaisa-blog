import type {MetadataRoute} from 'next';
import {absoluteUrl} from '@/config/site';

export const dynamic = 'force-static';

const PUBLIC_PAGES = ['/', '/posts/', '/login/', '/register/', '/find-id/', '/reset-password/'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_PAGES.map(path => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' || path === '/posts/' ? 'daily' : 'monthly',
    priority: path === '/' || path === '/posts/' ? 1 : 0.4,
  }));
}

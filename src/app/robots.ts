import type {MetadataRoute} from 'next';
import {getSiteUrl} from '@/config/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/manager/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}

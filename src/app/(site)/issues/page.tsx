import BlogHomePage from '@/components/blog/blog-home-page';
import JsonLd from '@/components/seo/json-ld';
import {buildPageMetadata, homeJsonLd} from '@/lib/seo';
import {SITE_NAME} from '@/config/site';

export const metadata = buildPageMetadata({
  title: 'Issues',
  description: `${SITE_NAME} 이슈 (DB)`,
  path: '/issues/',
  index: false,
});

export default function Page() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <BlogHomePage listBasePath="/issues/" />
    </>
  );
}

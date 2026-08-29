import BlogHomePage from '@/components/blog/blog-home-page';
import JsonLd from '@/components/seo/json-ld';
import {buildPageMetadata, homeJsonLd} from '@/lib/seo';
import {SITE_NAME} from '@/config/site';

export const metadata = buildPageMetadata({
  title: 'Posts',
  description: `${SITE_NAME} 포스트`,
  path: '/posts/',
});

export default function Page() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <BlogHomePage listBasePath="/posts/" />
    </>
  );
}

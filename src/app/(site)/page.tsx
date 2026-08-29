import BlogHomePage from '@/components/blog/blog-home-page';
import JsonLd from '@/components/seo/json-ld';
import {homeJsonLd, homePageMetadata} from '@/lib/seo';

export const metadata = homePageMetadata();

export default function Page() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <BlogHomePage listBasePath="/posts/" />
    </>
  );
}

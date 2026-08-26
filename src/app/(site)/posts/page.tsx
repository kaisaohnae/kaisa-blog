import MdPostsHomePage from '@/components/blog/md-posts-home-page';
import JsonLd from '@/components/seo/json-ld';
import {getAllBlogPosts, getBlogCategories} from '@/data/blog-posts';
import {buildPageMetadata, homeJsonLd} from '@/lib/seo';
import {SITE_NAME} from '@/config/site';

export const metadata = buildPageMetadata({
  title: 'Posts',
  description: `${SITE_NAME} 기술 포스트 (Markdown)`,
  path: '/posts/',
});

export default function Page() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <MdPostsHomePage posts={getAllBlogPosts()} categories={getBlogCategories()} />
    </>
  );
}

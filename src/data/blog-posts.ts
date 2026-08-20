export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  category: string;
  tags: string[];
  readingMinutes: number;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'welcome-to-kaisa-blog',
    title: 'Kaisa Blog 시작하기',
    excerpt: 'kaisa-fo와 같은 Next.js 프레임워크 기반으로 블로그 프로젝트 초기 세팅을 마쳤습니다.',
    content: `
      <p>이 블로그는 kaisa-fo와 동일한 Next.js + TypeScript + Zustand 구조로 시작했습니다.</p>
      <p>차트 라이브러리는 제외했고, 정적 export 방식으로 배포할 수 있도록 구성했습니다.</p>
      <h2>앞으로 할 일</h2>
      <ul>
        <li>kaisa-blog-api와 연동</li>
        <li>카테고리/태그 필터</li>
        <li>마크다운 또는 CMS 연동</li>
      </ul>
    `,
    publishedAt: '2026-08-20',
    category: 'Notice',
    tags: ['setup', 'nextjs'],
    readingMinutes: 3,
  },
  {
    slug: 'blog-layout-notes',
    title: '블로그 레이아웃 구성 메모',
    excerpt: '헤더, 푸터, 다크모드, 공통 UI 컴포넌트를 kaisa-fo와 같은 방식으로 맞춰 두었습니다.',
    content: `
      <p>초기 세팅 단계에서는 목록 페이지와 상세 페이지만 제공합니다.</p>
      <p>공통 UI(Alert, Loading, Popup)와 API 인터셉터 구조는 그대로 가져왔습니다.</p>
    `,
    publishedAt: '2026-08-18',
    category: 'Dev',
    tags: ['layout', 'ui'],
    readingMinutes: 2,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}

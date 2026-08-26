---
slug: nextjs-05
order: 5
category: nextjs
categoryLabel: Next.js
title: "SSG·generateStaticParams·정적 export"
summary: "빌드 타임에 HTML을 고정하는 SSG와 generateStaticParams, output export의 제약까지 정리한다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# SSG·generateStaticParams·정적 export

> 요약: 빌드 타임에 HTML을 고정하는 SSG와 generateStaticParams, output export의 제약까지 정리한다.

---

## 1. 왜 정적 HTML인가

검색·공유 미리보기는 **첫 응답 HTML**을 본다.  
빌드 때 본문이 들어 있으면 SEO에 유리하고, CDN 캐시도 쉽다.

App Router에서 동적 경로를 정적화하려면:

```tsx
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({slug}));
}
```

빌드 로그에 `/posts/[slug]`가 ● (SSG)로 찍히는지 확인한다.

---

## 2. params는 Promise여도 정적이다

```tsx
export default async function Page({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return <Article post={post} />;
}
```

`await params`는 Next API일 뿐, 페이지를 CSR로 바꾸지 않는다.  
`generateStaticParams`가 있으면 **미리 렌더된 HTML**이 나온다.

---

## 3. `output: 'export'`

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
};
```

결과물: `out/` 정적 파일 → GitHub Pages, S3, 일반 웹서버.

제약 예:

- 서버 Runtime Route Handler 제한
- 미들웨어·ISR·On-demand revalidate 제한
- 동적 서버만 가능한 기능 사용 불가

가능하면: MD/API를 **빌드 시** 읽어 HTML 생성.

---

## 4. notFound와 누락 경로

```tsx
import {notFound} from 'next/navigation';

if (!post) notFound();
```

`dynamicParams` 설정에 따라 빌드에 없는 slug 처리가 달라진다.  
문서 사이트는 보통 **알려진 slug만** 빌드한다.

---

## 5. 체크리스트

- [ ] 공개 글 slug가 `generateStaticParams`에 포함
- [ ] 상세 HTML에 제목·본문·메타가 들어 있음
- [ ] export면 서버 전용 기능 미사용
- [ ] sitemap에 동일 URL 반영

---

## 연습

1. 동적 `[slug]` 3개를 SSG로 빌드해 `out/` HTML을 연다.
2. `await params`로 바꾼 뒤에도 정적 HTML인지 확인한다.
3. export 모드에서 깨지는 API를 목록으로 적는다.

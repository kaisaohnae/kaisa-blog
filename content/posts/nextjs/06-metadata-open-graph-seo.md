---
slug: nextjs-06
order: 6
category: nextjs
categoryLabel: Next.js
title: "Metadata·Open Graph·SEO 기본기"
summary: "metadata API와 generateMetadata로 title·description·canonical·OG를 페이지마다 맞춘다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# Metadata·Open Graph·SEO 기본기

> 요약: metadata API와 generateMetadata로 title·description·canonical·OG를 페이지마다 맞춘다.

---

## 1. 정적 metadata

```tsx
// app/layout.tsx 또는 page.tsx
export const metadata = {
  title: {
    default: 'Kaisa Blog',
    template: '%s · Kaisa Blog',
  },
  description: '기술 블로그',
};
```

하위 페이지 `title: 'Posts'` → `Posts · Kaisa Blog`.

---

## 2. 동적 generateMetadata

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {canonical: `https://blog.example.com/posts/${slug}/`},
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://blog.example.com/posts/${slug}/`,
    },
  };
}
```

목록·홈과 **실제 글 URL이 동일**해야 한다.  
쿼리 스트링 상세(`/view?slug=`)는 메타·sitemap과 어긋나기 쉽다.

---

## 3. 같이 챙길 것

| 항목 | 역할 |
|------|------|
| `robots.txt` | 크롤 허용/차단 |
| `sitemap.xml` | URL 목록 |
| JSON-LD | Article / Breadcrumb |
| OG image | 공유 미리보기 CTR |
| `lang` | `<html lang="ko">` |

```ts
// app/sitemap.ts
export default function sitemap() {
  return getAllSlugs().map((slug) => ({
    url: `https://blog.example.com/posts/${slug}/`,
    lastModified: new Date(),
  }));
}
```

---

## 4. noindex가 맞는 곳

- 로그인·회원가입
- 관리자
- 검색 결과 중복·내부 도구

```ts
robots: {index: false, follow: false}
```

---

## 5. 실수

- 모든 페이지 동일 title
- canonical이 www/non-www와 불일치
- 본문은 CSR인데 메타만 정적
- trailing slash 불일치로 중복 URL

---

## 연습

1. 글 상세에 `generateMetadata` + canonical을 붙인다.
2. sitemap에 글 URL만 넣고 인증 페이지는 제외/noindex 한다.
3. 카톡·슬랙에 URL을 붙여 OG 미리보기를 확인한다.

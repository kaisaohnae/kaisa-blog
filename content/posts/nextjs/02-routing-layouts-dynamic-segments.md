---
slug: nextjs-02
order: 2
category: nextjs
categoryLabel: Next.js
title: "라우팅·레이아웃·동적 세그먼트"
summary: "파일 기반 라우팅, 동적·캐치올 세그먼트, 중첩 레이아웃으로 URL과 UI 구조를 설계한다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# 라우팅·레이아웃·동적 세그먼트

> 요약: 파일 기반 라우팅, 동적·캐치올 세그먼트, 중첩 레이아웃으로 URL과 UI 구조를 설계한다.

---

## 1. 기본 규칙

| 파일 | URL |
|------|-----|
| `app/page.tsx` | `/` |
| `app/posts/page.tsx` | `/posts` |
| `app/posts/[slug]/page.tsx` | `/posts/:slug` |
| `app/docs/[...slug]/page.tsx` | `/docs/*` |

폴더 이름 = 경로. `page.tsx`가 있어야 그 경로가 공개된다.

---

## 2. 동적 세그먼트

```tsx
// app/posts/[slug]/page.tsx
type Props = {params: Promise<{slug: string}>};

export default async function PostPage({params}: Props) {
  const {slug} = await params;
  return <h1>{slug}</h1>;
}
```

Next.js 15+에서는 **`params`가 Promise**일 수 있다. `await params`로 읽는다.  
정적 HTML을 만들 때는 `generateStaticParams`와 함께 쓴다 — SEO와 충돌하지 않는다.

```tsx
export function generateStaticParams() {
  return [{slug: 'hello'}, {slug: 'world'}];
}
```

---

## 3. 중첩 레이아웃

```tsx
// app/posts/layout.tsx
export default function PostsLayout({children}: {children: React.ReactNode}) {
  return (
    <div>
      <aside>카테고리</aside>
      <section>{children}</section>
    </div>
  );
}
```

레이아웃은 하위 이동 시 **리마운트되지 않는다**. 상태·스크롤 유지에 유리하다.

Route Group `(site)` / `(manager)`로 URL 없이 레이아웃만 나눌 수 있다.

```
app/(site)/page.tsx      → /
app/(manager)/manager/page.tsx → /manager
```

---

## 4. Link와 이동

```tsx
import Link from 'next/link';

<Link href="/posts/hello/">글 보기</Link>
```

`trailingSlash: true`면 링크도 `/posts/hello/`처럼 맞춘다.

소프트 내비: `useRouter().push('/posts/')` (Client Component).

---

## 5. 병렬·인터셉트 (필요할 때)

- `@folder` 병렬 슬롯: 대시보드 다중 패널
- `(.)photo` 인터셉트: 모달 오버레이 UX

입문 앱은 동적 세그먼트 + 레이아웃만으로 충분한 경우가 많다.

---

## 연습

1. `/posts/[slug]`와 `generateStaticParams` 2개를 만든다.
2. `(marketing)` / `(app)` 그룹으로 레이아웃을 나눈다.
3. 모든 내부 링크에 trailing slash 정책을 맞춘다.

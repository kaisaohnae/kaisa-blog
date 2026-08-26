---
slug: nextjs-04
order: 4
category: nextjs
categoryLabel: Next.js
title: "데이터 페칭과 캐시 전략"
summary: "Server Component에서 데이터를 가져오고, fetch 캐시·재검증·정적 데이터 소스를 상황에 맞게 고른다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# 데이터 페칭과 캐시 전략

> 요약: Server Component에서 데이터를 가져오고, fetch 캐시·재검증·정적 데이터 소스를 상황에 맞게 고른다.

---

## 1. 서버에서 가져오기

```tsx
async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: {revalidate: 60}, // 초 단위 ISR류 재검증
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default async function Page({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const post = await getPost(slug);
  return <article>{post.title}</article>;
}
```

버전·설정에 따라 `fetch` 기본 캐시 동작이 달라질 수 있다.  
**명시적 `cache` / `revalidate` / `tags`** 를 팀 표준으로 적는 편이 안전하다.

---

## 2. 옵션 치트시트

| 옵션 | 의미 |
|------|------|
| `cache: 'force-cache'` | 가능하면 캐시 |
| `cache: 'no-store'` | 매 요청 최신 |
| `next: {revalidate: N}` | N초 후 재검증 |
| `next: {tags: ['post']}` | 태그 단위 무효화 |

```ts
import {revalidateTag} from 'next/cache';
revalidateTag('post');
```

정적 export(`output: 'export'`)에서는 런타임 재검증·서버 API가 제한된다.  
**빌드 시점에 읽을 수 있는 데이터**(로컬 MD, 공개 API)가 맞다.

---

## 3. 로컬 파일·CMS

```ts
import fs from 'node:fs';
import path from 'node:path';

export function loadMarkdown(slug: string) {
  const file = path.join(process.cwd(), 'content', `${slug}.md`);
  return fs.readFileSync(file, 'utf8');
}
```

블로그·문서 사이트는 MD/MDX + `generateStaticParams` 조합이 SEO·운영에 유리하다.

---

## 4. 클라이언트 페칭은 언제

- 사용자별 실시간 데이터
- 무한 스크롤·검색 타이핑
- 브라우저 전용 API

이 경우 React Query 등과 함께 Client Component에서 처리하고,  
**초기 셸·SEO 본문**은 서버가 담당하는 편이 낫다.

---

## 5. 에러·로딩

```
app/posts/[slug]/loading.tsx
app/posts/[slug]/error.tsx
```

구간별로 스피너·에러 UI를 두면 체감 품질이 올라간다.

---

## 연습

1. `revalidate: 60` fetch와 `no-store` fetch를 비교한다.
2. `content/` MD를 읽어 목록 페이지를 만든다.
3. 정적 export 환경이면 “빌드 타임에만 읽기”로 데이터 소스를 정리한다.

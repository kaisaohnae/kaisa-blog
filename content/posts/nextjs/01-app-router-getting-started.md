---
slug: nextjs-01
order: 1
category: nextjs
categoryLabel: Next.js
title: "Next.js App Router로 프로젝트 시작하기"
summary: "App Router 기준으로 Next.js 프로젝트를 세팅하고, 디렉터리·렌더 모드·실무 기본선을 정리한다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# Next.js App Router로 프로젝트 시작하기

> 요약: App Router 기준으로 Next.js 프로젝트를 세팅하고, 디렉터리·렌더 모드·실무 기본선을 정리한다.

---

## 1. 왜 App Router인가

Pages Router도 동작하지만, 신규 프로젝트의 기본선은 **App Router**다.

| 항목 | Pages Router | App Router |
|------|--------------|------------|
| 라우팅 | `pages/` | `app/` |
| 레이아웃 | `_app` / `_document` | 중첩 `layout.tsx` |
| 데이터 | `getServerSideProps` 등 | async Server Component / fetch |
| 메타 | `next/head` | `metadata` / `generateMetadata` |

실무 기본 조합: **Next.js 15/16 + TypeScript + App Router**.

---

## 2. 생성

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

권장 옵션: TypeScript, ESLint, App Router, `src/` 디렉터리(팀 취향).

---

## 3. 핵심 디렉터리

```
src/app/
├── layout.tsx      # 루트 레이아웃
├── page.tsx        # /
├── posts/
│   ├── page.tsx    # /posts
│   └── [slug]/
│       └── page.tsx
└── globals.css
```

- `page.tsx` → 라우트 UI
- `layout.tsx` → 공통 셸 (네비, 푸터)
- `loading.tsx` / `error.tsx` → 구간별 UX
- `not-found.tsx` → 404

---

## 4. 렌더 모드를 먼저 고른다

| 모드 | 언제 |
|------|------|
| 정적(SSG/export) | 문서·마케팅·블로그 |
| 동적(SSR) | 요청마다 다른 개인화 |
| 혼합 | 목록은 정적, 일부만 동적 |

GitHub Pages처럼 순수 정적이면 `output: 'export'`를 검토한다.  
API Route·미들웨어·ISR 제약이 있으므로 **호스팅과 함께** 결정한다.

```ts
// next.config.ts
const nextConfig = {
  output: 'export', // 필요할 때만
  trailingSlash: true,
};
```

---

## 5. 첫 페이지

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Hello, Next.js</h1>
    </main>
  );
}
```

루트 레이아웃:

```tsx
// app/layout.tsx
export const metadata = {
  title: 'My App',
  description: 'Next.js app',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

---

## 6. 체크리스트

- [ ] App Router + TypeScript
- [ ] `layout` / `page` 역할 분리
- [ ] 정적 vs 동적 배포 전략 문서화
- [ ] `trailingSlash`·베이스 경로를 호스팅과 맞춤

---

## 연습

1. `create-next-app`으로 프로젝트를 만든다.
2. `/about` 라우트와 공통 헤더 레이아웃을 추가한다.
3. 정적 export가 필요한지 팀 기준으로 한 줄 결정한다.

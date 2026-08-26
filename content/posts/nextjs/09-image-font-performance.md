---
slug: nextjs-09
order: 9
category: nextjs
categoryLabel: Next.js
title: "이미지·폰트·성능 최적화"
summary: "next/image·next/font와 번들·스트리밍으로 Core Web Vitals에 가까운 기본기를 갖춘다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# 이미지·폰트·성능 최적화

> 요약: next/image·next/font와 번들·스트리밍으로 Core Web Vitals에 가까운 기본기를 갖춘다.

---

## 1. next/image

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority // LCP 후보만
/>
```

이점: 리사이즈·lazy·현대 포맷.  
`output: 'export'`면 `images.unoptimized: true` 또는 커스텀 로더가 필요할 수 있다.

```ts
images: {unoptimized: true}
```

원격 이미지는 `images.remotePatterns`에 도메인 허용.

---

## 2. next/font

```tsx
import {Geist, Geist_Mono} from 'next/font/google';

const sans = Geist({subsets: ['latin'], variable: '--font-sans'});

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

빌드 시 폰트를 받아 **레이아웃 시프트·외부 요청**을 줄인다.

---

## 3. 번들

- 큰 라이브러리는 쓰는 페이지/Client에만
- `dynamic(() => import(...), {ssr: false})` 는 정말 필요할 때만
- barrel `index.ts` 과다 re-export 주의

```bash
npm run build
# 라우트별 크기 확인
```

---

## 4. 스트리밍·로딩 UI

`loading.tsx`와 Suspense로 셸을 먼저 보내고 느린 구간을 채운다.  
체감 LCP·INP에 도움이 된다.

---

## 5. 측정

- Lighthouse / PageSpeed
- Web Vitals (LCP, CLS, INP)
- 실제 장치·3G 스로틀

최적화 전후를 **같은 URL**로 비교한다.

---

## 연습

1. 히어로에 `next/image` + `priority`를 적용한다.
2. `next/font`로 본문 폰트를 옮긴다.
3. export 모드면 `unoptimized` 필요 여부를 확인한다.

---
slug: nextjs-08
order: 8
category: nextjs
categoryLabel: Next.js
title: "미들웨어와 인증 경계"
summary: "middleware로 경로 보호·리다이렉트를 다루고, 세션·토큰을 어디에 둘지 실무 기준으로 정리한다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# 미들웨어와 인증 경계

> 요약: middleware로 경로 보호·리다이렉트를 다루고, 세션·토큰을 어디에 둘지 실무 기준으로 정리한다.

---

## 1. middleware.ts

```ts
// middleware.ts
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token && request.nextUrl.pathname.startsWith('/manager')) {
    return NextResponse.redirect(new URL('/login/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/manager/:path*'],
};
```

엣지에서 빠르게 경로를 가른다. **무거운 DB 조회**는 넣지 않는 편이 좋다.

---

## 2. 인증 정보 위치

| 저장 | 장점 | 주의 |
|------|------|------|
| HttpOnly 쿠키 | XSS에 상대적으로 안전 | CSRF·SameSite |
| 메모리/상태 | XSS 표면 | 새로고침 시 소실 → 보통 쿠키와 조합 |
| localStorage | 구현 쉬움 | XSS 위험 |

SPA+별도 API면 쿠키 또는 Bearer.  
Next 풀스택이면 쿠키 세션 + Server Component에서 검증이 흔하다.

---

## 3. 레이아웃에서 가드

```tsx
// app/manager/layout.tsx
import {redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';

export default async function ManagerLayout({children}: {children: React.ReactNode}) {
  const session = await getSession();
  if (!session) redirect('/login/');
  return <div>{children}</div>;
}
```

미들웨어(거친 차단) + 레이아웃/페이지(정확한 권한) **이중**이 안전하다.

---

## 4. 정적 export와의 관계

`output: 'export'`면 미들웨어·서버 세션이 제한될 수 있다.  
그 경우:

- 관리자 인증은 **클라이언트 + API**
- 또는 관리자만 별도 서버 호스팅

공개 Posts는 정적, Issues/Manager는 API — 역할 분리와 잘 맞는다.

---

## 5. 체크리스트

- [ ] matcher로 보호 경로 명시
- [ ] 관리자 API는 서버에서 토큰 재검증
- [ ] 로그인·회원가입 noindex
- [ ] 로그아웃아웃 시 쿠키·캐시 정리

---

## 연습

1. `/manager/*` 미들웨어 리다이렉트를 만든다 (Node 호스팅).
2. 레이아웃에서 세션 없는 사용자를 `redirect` 한다.
3. export 배포라면 클라이언트 가드 + API 401 처리 흐름을 문서화한다.

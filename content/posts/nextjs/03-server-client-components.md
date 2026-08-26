---
slug: nextjs-03
order: 3
category: nextjs
categoryLabel: Next.js
title: "Server Component와 Client Component"
summary: "기본은 서버 컴포넌트로 두고, 상호작용이 필요할 때만 Client Component로 경계를 나눈다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# Server Component와 Client Component

> 요약: 기본은 서버 컴포넌트로 두고, 상호작용이 필요할 때만 Client Component로 경계를 나눈다.

---

## 1. 기본값 = Server

`app/` 아래 컴포넌트는 기본적으로 **Server Component**다.

할 수 있는 것:

- DB·파일시스템·시크릿 접근
- `async/await`로 데이터 로드
- 번들에 안 실려 클라이언트 JS 감소

할 수 없는 것:

- `useState` / `useEffect`
- 브라우저 API
- 이벤트 핸들러 (`onClick` 등)

---

## 2. Client가 필요할 때

파일 상단:

```tsx
'use client';

import {useState} from 'react';

export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

규칙: **잎(leaf)에 가깝게** Client를 둔다.  
페이지 전체를 `'use client'`로 열면 서버의 이점이 사라진다.

---

## 3. 경계 패턴

```tsx
// app/posts/page.tsx (Server)
import {PostFilters} from './post-filters'; // client
import {getPosts} from '@/lib/posts';

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <>
      <PostFilters />
      <PostList posts={posts} />
    </>
  );
}
```

서버가 데이터를 가져와 직렬화 가능한 props로 Client에 넘긴다.  
함수·클래스 인스턴스는 props로 넘기지 말 것.

---

## 4. 흔한 실수

| 실수 | 대안 |
|------|------|
| 페이지 전체 client | 인터랙션만 분리 |
| Server에서 `window` | Client로 이동 |
| Client에서 `fs` | Server/lib에서 읽고 props |
| 큰 차트 라이브러리를 레이아웃에 | 동적 import / 해당 페이지만 |

---

## 5. 구성 팁

- 폼·테마 토글·검색창 → Client
- 본문·메타·목록 데이터 → Server
- 공유 훅이 client면 그걸 import한 트리도 client화됨에 주의

---

## 연습

1. 서버 페이지 + 클라이언트 검색 입력 조합을 만든다.
2. 불필요하게 `'use client'`인 파일을 찾아 서버로 되돌린다.
3. Client bundle에 큰 의존성이 들어가는지 빌드 분석으로 확인한다.

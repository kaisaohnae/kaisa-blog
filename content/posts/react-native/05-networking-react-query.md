---
slug: react-native-05
order: 5
category: react-native
categoryLabel: React Native
title: "네트워킹 — Fetch, React Query, 에러 처리"
summary: "API 클라이언트를 정리하고, TanStack Query로 캐시·로딩·에러·재시도를 표준화한다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 네트워킹 — Fetch, React Query, 에러 처리

> 요약: API 클라이언트를 정리하고, TanStack Query로 캐시·로딩·에러·재시도를 표준화한다.

---

---

## 1. 서버 상태 vs 클라이언트 상태

- **서버 상태**: 게시글 목록, 프로필, 설정(서버 원본) → React Query
- **클라이언트 상태**: 모달 open, 토글, 마법사 단계 → useState/Zustand

둘을 `useState` 하나로 섞으면 로딩/캐시/동기화 버그가 는다.

---

## 2. fetch 래퍼

```tsx
// lib/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, 'Request failed', body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

Expo 환경변수: `EXPO_PUBLIC_*` 만 클라이언트에 노출. 비밀키는 넣지 말 것.

```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

---

## 3. TanStack Query 세팅

```bash
npx expo install @tanstack/react-query
```

```tsx
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Stack / Slot */}
    </QueryClientProvider>
  );
}
```

---

## 4. useQuery / useMutation

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => api<Post[]>('/posts'),
  });
}

function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) =>
      api<Post>('/posts', { method: 'POST', body: JSON.stringify(input), token }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}
```

화면:

```tsx
const { data, isPending, isError, error, refetch } = usePosts();

if (isPending) return <ActivityIndicator />;
if (isError) return <ErrorView message={error.message} onRetry={refetch} />;
return <PostList data={data} />;
```

---

## 5. 무한 스크롤

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['posts', 'infinite'],
  initialPageParam: 1,
  queryFn: ({ pageParam }) => api<PostPage>(`/posts?page=${pageParam}`),
  getNextPageParam: (last) => last.nextPage ?? undefined,
});

const items = data?.pages.flatMap((p) => p.items) ?? [];
```

`FlatList`의 `onEndReached`와 연결.

---

## 6. 포커스·온라인 리패치

RN에서는 앱 포커스 이벤트를 Query에 알려주면 좋다.

```tsx
import { focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
  });
  return () => sub.remove();
});
```

---

## 7. 인증 토큰과 401

- 토큰은 `expo-secure-store`에 저장 (SecureStore)
- `api()`에서 401 → 토큰 갱신 또는 로그아웃 로그아웃
- Query `queryFn`이 토큰을 읽도록 훅에서 주입

```tsx
useQuery({
  queryKey: ['me'],
  queryFn: () => api('/me', { token }),
  enabled: !!token,
});
```

---

## 8. UX 상태 설계

| 상태 | UI |
|------|----|
| pending (최초) | 스켈레톤/스피너 |
| error | 메시지 + 재시도 |
| empty | 빈 화면 CTA |
| fetching (백그라운드) | 리스트 유지 + 약한 인디케이터 |
| mutation pending | 버튼 비활성 |

에러를 `alert()`만으로 처리하지 말고, 화면 수준 폴백을 둔다.

---

## 9. 개발 도구

- TanStack Query Devtools (웹 쪽에 가깝지만 로깅으로 대체 가능)
- 네트워크: Charles / Proxyman / Flipper 대안들
- API 타입: openapi-typescript로 클라이언트 타입 생성

---

## 연습

1. `api()` 헬퍼와 `ApiError`를 만든다.
2. 게시글 목록 `useQuery` + 에러/로딩 UI를 구현한다.
3. 생성 `useMutation` 후 목록 invalidate.
4. `useInfiniteQuery` + FlatList 무한 스크롤을 연결한다.

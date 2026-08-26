---
slug: react-native-08
order: 8
category: react-native
categoryLabel: React Native
title: "상태 관리·아키텍처·모듈화"
summary: "전역 상태를 최소화하고, Feature 단위 구조와 Zustand/Context 선택 기준을 익힌다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 상태 관리·아키텍처·모듈화

> 요약: 전역 상태를 최소화하고, Feature 단위 구조와 Zustand/Context 선택 기준을 익힌다.

---

---

## 1. 상태 배치 우선순위

1. 로컬 `useState`
2. URL/라우트 파라미터 (공유 가능·북마크 가능한 UI)
3. React Query (서버 상태)
4. Context (드문 저빈도 전역: theme, auth 세션)
5. Zustand/Jotai 등 (클라이언트 전역이 명확할 때)
6. Redux Toolkit (이미 팀 표준이거나 매우 복잡한 클라이언트 워크플로)

**모든 것을 Redux에 넣지 않는다.** RN 신입 프로젝트가 가장 많이 하는 실수다.

---

## 2. Context — 언제 OK

```tsx
const ThemeContext = createContext<{ mode: 'light' | 'dark'; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const value = useMemo(
    () => ({ mode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
    [mode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

주의: value가 자주 바뀌면 구독 컴포넌트가 전부 리렌더.  
고빈도 상태(스크롤 위치, 매 키입력)는 Context에 두지 말 것.

---

## 3. Zustand — 가벼운 전역

```bash
npx expo install zustand
```

```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CartState = {
  items: Record<string, number>;
  add: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      add: (id) =>
        set((s) => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) + 1 } })),
      clear: () => set({ items: {} }),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

민감 토큰은 AsyncStorage persist 금지 → SecureStore + Auth 흐름.

셀렉터로 리렌더 최소화:

```tsx
const count = useCart((s) => s.items[id] ?? 0);
```

---

## 4. 폴더 구조 제안 (Feature-first)

```
src/
├── app/                 # expo-router 엔트리 (또는 루트 app/)
├── features/
│   ├── auth/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── screens/
│   │   └── components/
│   ├── posts/
│   └── cart/
├── components/          # 디자인 시스템급 공용 UI
├── lib/                 # api client, storage
├── constants/
└── types/
```

화면 파일은 얇게, 비즈니스는 `features/*`로.

---

## 5. 컴포넌트 설계 원칙

- Presentational vs Container를 과도히 나누기보다 **훅으로 로직 분리**
- props drilling 3단 넘어가면 합성·훅·작은 store 검토
- 날짜/가격 포맷은 `lib/format.ts`로 일원화
- 매직 넘버·카피 문자열 상수화 (i18n 대비)

```tsx
// features/posts/hooks.ts
export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => api<Post>(`/posts/${id}`),
  });
}
```

---

## 6. 에러 경계

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ScreenError} onReset={resetApp}>
  <App />
</ErrorBoundary>
```

치명 렌더 크래시가 흰 화면으로 끝나지 않게.  
라우트 단위로 경계를 나누면 전체가 죽지 않는다.

---

## 7. 환경·설정

```ts
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyApp',
  slug: 'my-app',
  extra: {
    appEnv: process.env.APP_ENV ?? 'development',
    eas: { projectId: '...' },
  },
});
```

dev / staging / prod 번들 ID·API URL을 분리한다 (EAS profile).

---

## 8. 품질 도구

```bash
npx expo install eslint prettier
# 또는 expo lint
```

- TypeScript `strict`
- ESLint + import order
- absolute import (`@/`)
- Husky + lint-staged (팀)

---

## 연습

1. Feature 폴더로 `posts` 모듈을 재배치한다.
2. Zustand로 장바구니(또는 최근 검색어)를 persist한다.
3. Theme Context로 라이트/다크를 토글한다.
4. 라우트 단위 ErrorBoundary를 추가한다.

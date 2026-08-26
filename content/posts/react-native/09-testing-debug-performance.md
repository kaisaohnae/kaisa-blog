---
slug: react-native-09
order: 9
category: react-native
categoryLabel: React Native
title: "테스트·디버깅·성능"
summary: "컴포넌트/통합 테스트와 디버깅 도구를 쓰고, 리스트·렌더·번들 성능을 체계적으로 개선한다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 테스트·디버깅·성능

> 요약: 컴포넌트/통합 테스트와 디버깅 도구를 쓰고, 리스트·렌더·번들 성능을 체계적으로 개선한다.

---

---

## 1. 테스트 피라미드 (RN)

| 종류 | 도구 | 목적 |
|------|------|------|
| 단위 | Jest + Testing Library | 컴포넌트·훅·포맷터 |
| 컴포넌트 | `@testing-library/react-native` | 사용자 관점 UI |
| E2E | Maestro / Detox | 핵심 플로우 |

Expo는 Jest 프리셋 설정이 잘 문서화되어 있다.

```bash
npx expo install jest-expo @testing-library/react-native --dev
```

---

## 2. Testing Library 예

```tsx
import { render, screen, userEvent } from '@testing-library/react-native';
import { LoginForm } from '../LoginForm';

test('validates email', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByPlaceholderText('email'), 'not-an-email');
  await user.type(screen.getByPlaceholderText('password'), 'password123');
  await user.press(screen.getByText('로그인'));

  expect(screen.getByText(/이메일/i)).toBeTruthy();
  expect(onSubmit).not.toHaveBeenCalled();
});
```

쿼리 우선순위: **접근성 역할/라벨** → 텍스트 → testID(최후).

```tsx
<Pressable accessibilityRole="button" accessibilityLabel="장바구니 담기" />
```

---

## 3. 네비·Query 테스트

- `QueryClient`를 테스트용으로 감싸 `retry: false`
- Expo Router는 공식 테스트 가이드/`renderRouter` 유틸 참고
- SecureStore·fetch는 mock

```tsx
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
```

---

## 4. E2E — Maestro

YAML 플로우로 실기기/에뮬 조작:

```yaml
appId: com.example.myapp
---
- launchApp
- tapOn: '로그인'
- inputText: 'user@example.com'
- tapOn: '제출'
- assertVisible: '홈'
```

Detox는 더 강력하지만 설정 비용이 크다. 팀 규모에 맞게.

---

## 5. 디버깅

- React Native DevTools (최신 RN)
- `console.log` 남발 대신 구조화 로그
- 네트워크: API 로깅 미들웨어 (개발만)
- 에러: Log 박스 / LogRocket·Sentry

```bash
npx expo start
# shift+m 등 개발 메뉴 (환경별)
```

TypeError 스택이 minified면 source map이 있는 빌드 프로파일 사용.

---

## 6. 성능 — 측정이 먼저

의심 가는 것부터 최적화하지 말고:

1. JS FPS / UI FPS
2. 불필요 리렌더 (why-did-you-render, memo 검토)
3. 리스트 가상화
4. 이미지 크기·포맷
5. 번들 크기

### 리스트

- FlatList/FlashList
- 안정적 `keyExtractor`
- 행 `React.memo`
- 이미지 다운샘플

### 리렌더

```tsx
const selectCount = (s: CartState) => s.items[id] ?? 0;
const count = useCart(selectCount);
```

컨텍스트 value `useMemo`, 콜백 `useCallback`은 **측정 후** 필요한 곳에.

### 이미지·애니메이션

- `expo-image`
- Reanimated (UI 스레드)
- 무거운 blur/shadow 절제

---

## 7. 번들·기동

```bash
npx expo export --dump-sourcemap
# 또는 번들 분석 도구
```

- 과도한 barrel `index.ts` re-export 주의
- 큰 라이브러리 대체/지연 로딩
- Hermes 엔진 (Expo 기본에 가깝게)

기동 최적화: 스플래시 동안 필수 데이터만, 나머지는 화면 단위 fetch.

---

## 8. 모니터링

```bash
npx expo install @sentry/react-native
```

- 크래시·논크래시 예외
- 릴리즈 버전 매핑 (EAS build number)
- 브레드크럼: 화면 전환, API 실패
- 개인정보 스크러빙

---

## 연습

1. LoginForm 단위 테스트 2개(성공/실패)를 작성한다.
2. SecureStore·fetch를 mock한 Auth 훅 테스트를 만든다.
3. FlashList/FlatList 행을 memo로 최적화하고 스크롤을 비교한다.
4. (선택) Maestro로 로그인→홈 플로우를 자동화한다.

---
slug: react-native-03
order: 3
category: react-native
categoryLabel: React Native
title: "상태·훅·폼 — 사용자 입력과 데이터 흐름"
summary: "`useState`/`useEffect`/`useRef`와 폼 패턴, 파생 상태 함정을 이해하고 실무적인 입력 UX를 만든다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 상태·훅·폼 — 사용자 입력과 데이터 흐름

> 요약: `useState`/`useEffect`/`useRef`와 폼 패턴, 파생 상태 함정을 이해하고 실무적인 입력 UX를 만든다.

---

---

## 1. 상태는 어디에 두나

| 범위 | 수단 |
|------|------|
| 한 컴포넌트 UI | `useState` |
| 부모→자식 공유 | props 내리기 / 합성 |
| 화면 멀리 공유 | Context, Zustand 등 |
| 서버 데이터 | TanStack Query 등 |
| 폼 다수 필드 | `react-hook-form` |

서버에서 온 데이터를 `useState`+`useEffect`로 수동 동기화하는 패턴은 최신 실무에서 지양한다.

---

## 2. useState / 파생 값

```tsx
const [count, setCount] = useState(0);
const doubled = count * 2; // state로 두지 말 것
```

객체 업데이트:

```tsx
setUser((prev) => ({ ...prev, name }));
```

---

## 3. TextInput 패턴

```tsx
import { useState } from 'react';
import { TextInput, Text, View } from 'react-native';

export function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!email.includes('@')) {
      setError('이메일 형식을 확인하세요');
      return;
    }
    setError(null);
    onSubmit(email.trim(), password);
  };

  return (
    <View style={{ gap: 12 }}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={inputStyle}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="password"
        secureTextEntry
        textContentType="password"
        style={inputStyle}
      />
      {error ? <Text style={{ color: 'tomato' }}>{error}</Text> : null}
      <Pressable onPress={handleSubmit}>{/* ... */}</Pressable>
    </View>
  );
}
```

iOS/Android 자동완성·비밀번호 매니저 대응에 `textContentType` / `autoComplete`가 도움이 된다.

---

## 4. useRef — DOM 대신 인스턴스

```tsx
const inputRef = useRef<TextInput>(null);

<TextInput ref={inputRef} />
// 다음 필드로
inputRef.current?.focus();
```

렌더와 무관한 타임스탬프·이전 값 보관에도 사용.

---

## 5. useEffect — 구독과 정리

```tsx
useEffect(() => {
  const sub = AppState.addEventListener('change', onChange);
  return () => sub.remove();
}, []);
```

안티패턴:

```tsx
// 서버 fetch를 매번 이렇게만 구성하지 말 것
useEffect(() => {
  fetch('/api').then(...).then(setData);
}, []);
```

→ React Query / SWR이 캐시·재시도·포커스 리패치를 대신한다 .

---

## 6. react-hook-form + zod (권장)

```bash
npx expo install react-hook-form zod @hookform/resolvers
```

```tsx
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput value={value} onBlur={onBlur} onChangeText={onChange} />
        )}
      />
      {errors.email && <Text>{errors.email.message}</Text>}
      <Pressable onPress={handleSubmit((data) => console.log(data))} />
    </>
  );
}
```

검증 스키마를 서버와 공유하면 풀스택 계약이 단단해진다.

---

## 7. 키보드·UX

- `returnKeyType="next" | "done"`
- `onSubmitEditing`으로 다음 필드 focus
- `Keyboard.dismiss()`
- `keyboardShouldPersistTaps="handled"` on ScrollView
- 로딩 중 버튼 비활성 + 스피너

```tsx
import { ActivityIndicator } from 'react-native';

{loading ? <ActivityIndicator /> : <Text>로그인</Text>}
```

---

## 8. 커스텀 훅

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return { on, toggle, setOn };
}
```

UI 로직이 반복되면 훅으로 추출. 다만 성급한 추상화는 피한다.

---

## 연습

1. 로그인 폼(이메일·비밀번호·에러·로딩)을 만든다.
2. zod + react-hook-form으로 회원가입 검증을 붙인다.
3. `useRef`로 비밀번호 필드 자동 포커스를 구현한다.
4. `useToggle` 커스텀 훅으로 비밀번호 표시/숨김을 만든다.

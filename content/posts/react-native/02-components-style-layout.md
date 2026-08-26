---
slug: react-native-02
order: 2
category: react-native
categoryLabel: React Native
title: "컴포넌트·스타일·레이아웃 — Flex와 StyleSheet"
summary: "RN 핵심 컴포넌트와 Flexbox 레이아웃, StyleSheet 패턴, 안전한 스타일 작성법을 익힌다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 컴포넌트·스타일·레이아웃 — Flex와 StyleSheet

> 요약: RN 핵심 컴포넌트와 Flexbox 레이아웃, StyleSheet 패턴, 안전한 스타일 작성법을 익힌다.

---

---

## 1. 핵심 컴포넌트

| 컴포넌트 | 역할 | 웹 대응 |
|----------|------|---------|
| `View` | 컨테이너 | `div` |
| `Text` | 텍스트 (필수) | `span/p` |
| `Image` | 이미지 | `img` |
| `Pressable` | 터치 | `button` |
| `ScrollView` | 스크롤 영역 | 스크롤 div |
| `TextInput` | 입력 | `input` |
| `FlatList` | 긴 리스트 | 가상화 리스트 |

**텍스트는 반드시 `Text` 안**. `View` 직하 문자열은 에러다.

```tsx
import { View, Text, Pressable } from 'react-native';

export function CounterButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
```

`Button`은 스타일 제약이 커서 실무에선 `Pressable`/`TouchableOpacity`를 더 쓴다.

---

## 2. StyleSheet

```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});
```

특징:

- 단위는 **dp** (px 아님). 숫자만 쓰면 됨
- 상속이 CSS처럼 자유롭지 않음 — `Text`는 부모 `Text` 스타일을 일부 상속
- 배열로 병합: `style={[styles.card, compact && styles.compact, { marginTop: 8 }]}`

---

## 3. Flexbox — RN의 레이아웃 언어

기본: `flexDirection: 'column'` (웹과 다름!).

```tsx
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  grow: {
    flex: 1,
  },
});
```

자주 쓰는 속성:

- `justifyContent`: 주축 정렬
- `alignItems`: 교차축 정렬
- `flex`: 남은 공간 비율
- `gap` / `rowGap` / `columnGap`
- `position: 'absolute'` + `top/left/right/bottom`

화면 가득:

```tsx
{ flex: 1 }  // 부모가 높이를 가질 때
```

Safe Area:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>...</SafeAreaView>
```

노치·홈 인디케이터를 피하려면 `safe-area-context`가 사실상 필수다.

---

## 4. 이미지

```tsx
// 로컬
<Image source={require('../assets/logo.png')} style={{ width: 120, height: 40 }} />

// 원격
<Image
  source={{ uri: 'https://example.com/avatar.png' }}
  style={{ width: 64, height: 64, borderRadius: 32 }}
/>
```

원격 이미지는 **width/height**가 필요하다.  
성능·캐시: `expo-image` 권장.

```bash
npx expo install expo-image
```

```tsx
import { Image } from 'expo-image';

<Image
  source="https://example.com/pic.jpg"
  style={{ width: '100%', height: 200 }}
  contentFit="cover"
  transition={200}
/>
```

---

## 5. 스크롤과 키보드

짧은 폼:

```tsx
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
  <ScrollView contentContainerStyle={{ padding: 16 }}>
    {/* TextInput들 */}
  </ScrollView>
</KeyboardAvoidingView>
```

긴 리스트는 `ScrollView` + `map` 금지 → **FlatList**.

---

## 6. 플랫폼별 분기

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
    default: {},
  }),
});
```

파일 분기: `Button.ios.tsx` / `Button.android.tsx`.

---

## 7. 디자인 토큰

```tsx
// constants/theme.ts
export const colors = {
  bg: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  muted: '#94a3b8',
  primary: '#38bdf8',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
```

하드코딩 색/간격을 줄이면 다크모드·리브랜드가 쉬워진다.

### NativeWind (선택)

Tailwind 문법을 쓰고 싶다면 NativeWind. 팀 합의 후 도입.  
기본 학습은 StyleSheet을 먼저 탄탄히.

---

## 8. 접근성 기본

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="장바구니에 추가"
  onPress={onAdd}
>
  <Text>추가</Text>
</Pressable>
```

터치 영역 최소 ~44pt, 대비 충분한 색.

---

## 연습

1. 카드 UI(이미지·제목·가격·버튼)를 Flex로 만든다.
2. `SafeAreaView` + 헤더/본문/하단 CTA 레이아웃을 구성한다.
3. iOS/Android 그림자를 `Platform.select`로 맞춘다.
4. `expo-image`로 원격 이미지를 표시한다.

---
slug: react-native-07
order: 7
category: react-native
categoryLabel: React Native
title: "애니메이션·제스처·사용자 경험"
summary: "Reanimated와 Gesture Handler로 부드러운 60fps 인터랙션을 만들고, 접근성·햅틱까지 챙긴다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 애니메이션·제스처·사용자 경험

> 요약: Reanimated와 Gesture Handler로 부드러운 60fps 인터랙션을 만들고, 접근성·햅틱까지 챙긴다.

---

---

## 1. 왜 RN Animated만으로 부족한가

구 `Animated` API도 쓸 수 있지만, 복잡한 제스처·UI 스레드는 **react-native-reanimated** + **react-native-gesture-handler**가 사실상 표준이다.  
Expo 템플릿에 이미 포함되는 경우가 많다.

```bash
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context
```

Babel 플러그인(`reanimated/plugin`은 **마지막**)과 루트에서 GestureHandlerRootView가 필요하다.

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Root() {
  return <GestureHandlerRootView style={{ flex: 1 }}>{/* app */}</GestureHandlerRootView>;
}
```

---

## 2. Reanimated 기본

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

export function BounceButton({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View style={style}>{children}</Animated.View>
    </Pressable>
  );
}
```

핵심 개념:

- `useSharedValue`: UI 스레드에서 읽히는 값
- `useAnimatedStyle`: 공유 값 → 스타일
- `withTiming` / `withSpring` / `withSequence`
- worklet: `'worklet';` 지시로 UI 스레드 실행

JS 스레드 `setState`로 매 프레임 애니메이션 하면 버벅인다.

---

## 3. 제스처

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

export function Draggable() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const pan = Gesture.Pan().onChange((e) => {
    x.value += e.changeX;
    y.value += e.changeY;
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width: 80, height: 80, backgroundColor: '#38bdf8' }, style]} />
    </GestureDetector>
  );
}
```

실무 패턴: 하단 시트, 스와이프 삭제, 핀치 줌, 카드 스택.

```tsx
Gesture.Simultaneous(pan, pinch);
Gesture.Exclusive(native, swipe);
```

---

## 4. 레이아웃 애니메이션

리스트 추가/삭제 시:

```tsx
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn}
  exiting={FadeOut}
  layout={LinearTransition}
>
  ...
</Animated.View>
```

과도한 진입 애니메이션은 피로감을 준다. **의미 있는 피드백**에만.

---

## 5. 내비 전환

Expo Router / React Navigation의 native stack은 플랫폼 전환이 기본으로 좋다.  
커스텀이 필요하면 shared element / 커스텀 트랜지션을 제한적으로.

모달:

```tsx
<Stack.Screen
  name="compose"
  options={{ presentation: 'modal' }}
/>
```

---

## 6. 햅틱·사운드

```bash
npx expo install expo-haptics
```

```tsx
import * as Haptics from 'expo-haptics';

await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

성공/삭제/토글에 약하게. 남발 금지.

---

## 7. 스켈레톤·낙관적 UI

- 로딩: 스피너보다 **스켈레톤**이 체감이 좋음
- mutation: 낙관적 업데이트 + 실패 롤백 (React Query)
- 버튼: pressed 스케일·opacity

```tsx
style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
```

---

## 8. 접근성 & 모션 감소

```tsx
import { AccessibilityInfo } from 'react-native';
import { reduceMotion } from 'react-native-reanimated'; // 버전별 API 확인
```

OS “동작 줄이기”가 켜져 있으면 큰 애니메이션을 스킵하는 것이 좋다.  
스크린 리더용 `accessibilityLabel`, 포커스 순서도 함께.

---

## 9. 성능 주의

- 애니메이션 중 무거운 JS 금지
- `console.log` 남발 금지 (특히 worklet)
- 이미지·섀도우 과다 주의
- `memo`로 리스트 행 보호

---

## 연습

1. Pressable 스프링 스케일 버튼을 만든다.
2. 스와이프로 삭제할 수 있는 리스트 행을 구현한다.
3. 모달 화면 `presentation: 'modal'`을 추가한다.
4. 주요 CTA에 햅틱 피드백을 붙인다.

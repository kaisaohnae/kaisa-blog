---
slug: react-native-01
order: 1
category: react-native
categoryLabel: React Native
title: "React Native와 Expo로 시작하기"
summary: "최신 React Native(New Architecture) + Expo 기준으로 프로젝트를 세팅하고, 네이티브 앱 개발의 기본 지도를 잡는다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# React Native와 Expo로 시작하기

> 요약: 최신 React Native(New Architecture) + Expo 기준으로 프로젝트를 세팅하고, 네이티브 앱 개발의 기본 지도를 잡는다.

---

---

## 1. React Native란

JavaScript/TypeScript로 **iOS·Android(그리고 웹)** UI를 만드는 프레임워크다.  
웹의 DOM 대신 **네이티브 뷰**를 그리며, React의 컴포넌트·훅·상태 모델을 그대로 쓴다.

| 구분 | React (Web) | React Native |
|------|-------------|--------------|
| 렌더 대상 | HTML/CSS | Native Views |
| 스타일 | CSS | StyleSheet (Yoga 레이아웃) |
| 네비게이션 | react-router 등 | Expo Router / React Navigation |
| 빌드 | Vite/Webpack | Metro + 네이티브 빌드 |

---

## 2. Expo vs Bare RN — 2020년대 후반 기준

실무·학습 모두 **Expo(managed / CNG)** 가 기본 추천이다.

| 항목 | Expo | Bare CLI |
|------|------|----------|
| 시작 속도 | 매우 빠름 | 느림 |
| OTA 업데이트 | EAS Update | 직접 구성 |
| 네이티브 모듈 | config plugin / prebuild | 수동 연동 |
| 스토어 빌드 | EAS Build | Xcode/Gradle 직접 |

지금은 “Expo는 토이”가 아니다. **Expo = 프로덕션 RN 툴체인**에 가깝다.

---

## 3. 환경 준비

- Node.js LTS (20+)
- Git
- Android Studio (에뮬레이터) / Xcode (macOS, iOS)
- 실기기: Expo Go 앱

```bash
npx create-expo-app@latest my-app
cd my-app
npx expo start
```

템플릿 선택 시 **TypeScript + Expo Router** 를 고르는 것을 권장한다.

```bash
npx create-expo-app@latest my-app -t expo-template-blank-typescript
# 또는 공식 라우터 템플릿
npx create-expo-app@latest my-app --template tabs
```

---

## 4. 프로젝트 구조 (Expo Router)

```
app/                 # 파일 기반 라우팅 (페이지)
├── _layout.tsx
├── index.tsx
├── (tabs)/
└── +not-found.tsx
components/
hooks/
constants/
assets/
app.json | app.config.ts
package.json
```

`app.json` 핵심:

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app",
    "scheme": "myapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "plugins": []
  }
}
```

---

## 5. New Architecture (간단 이해)

React Native의 신 아키텍처:

- **Fabric**: 새 렌더러
- **TurboModules**: 빠른 네이티브 모듈
- **JSI**: JS↔Native 저수준 인터페이스

Expo SDK 최근 버전은 New Architecture가 기본/권장이다.  
우선은 “켠다” 정도만 알고, 브릿지 병목이 줄었다는 점만 기억하면 충분하다.

---

## 6. 첫 화면

```tsx
// app/index.tsx
import { Text, View, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, React Native</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
});
```

웹처럼 `className`이 기본은 아니다. (NativeWind를 쓰면 Tailwind류 가능 — 스타일·폼 문서 참고)

---

## 7. 개발 루프

```bash
npx expo start          # Dev server
# a: Android / i: iOS / w: web
# r: reload / j: debugger
```

- Fast Refresh로 저장 즉시 반영
- 실기기는 같은 Wi‑Fi 또는 tunnel 모드
- 로그: 터미널 + React Native DevTools

---

## 8. TypeScript를 기본으로

```tsx
type User = {
  id: string;
  name: string;
};

function greet(user: User): string {
  return `Hi, ${user.name}`;
}
```

props·API 응답·네비게이션 파라미터에 타입을 걸면 앱 규모가 커져도 안전하다.

---

## 9. 최신 기법 체크리스트

- [ ] Expo + TypeScript로 시작
- [ ] Expo Router(파일 기반 라우팅) 사용
- [ ] `app.config.ts`로 환경별 설정 분리 검토
- [ ] EAS(빌드/업데이트)를 배포 경로로 염두
- [ ] 웹 CSS 감각을 StyleSheet/Flex로 재학습

---

## 연습

1. Expo 프로젝트를 만들고 에뮬레이터/실기기에서 실행한다.
2. 홈 화면에 이름·버전 텍스트를 표시한다.
3. `app.json`의 `name`, `scheme`을 바꿔 반영을 확인한다.
4. TypeScript로 `User` 타입과 표시 컴포넌트를 만든다.

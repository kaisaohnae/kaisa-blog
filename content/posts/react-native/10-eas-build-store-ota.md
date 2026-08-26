---
slug: react-native-10
order: 10
category: react-native
categoryLabel: React Native
title: "EAS 빌드·스토어 배포·OTA"
summary: "EAS Build/Submit/Update로 스토어 출시와 OTA 핫픽스 파이프라인을 구성하고, 프로덕션 체크리스트를 점검한다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# EAS 빌드·스토어 배포·OTA

> 요약: EAS Build/Submit/Update로 스토어 출시와 OTA 핫픽스 파이프라인을 구성하고, 프로덕션 체크리스트를 점검한다.

---

---

## 1. 로컬 빌드 vs EAS

| 방식 | 설명 |
|------|------|
| Expo Go | 프로토타입 — 커스텀 네이티브 제한 |
| Development Build | 실기기에서 네이티브 모듈 포함 개발 |
| EAS Build | 클라우드에서 IPA/AAB 생성 (**실무 기본**) |
| 로컬 prebuild | `npx expo prebuild` 후 Xcode/Gradle |

```bash
npm i -g eas-cli
eas login
eas build:configure
```

---

## 2. Development Build

Expo Go로 부족하면:

```bash
npx expo install expo-dev-client
eas build --profile development --platform android
```

팀원에게 같은 네이티브 바이너리를 배포하고, JS는 Metro로 개발.

---

## 3. eas.json 프로파일

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

환경변수:

```bash
eas secret:create
# 또는 EAS env
```

`EXPO_PUBLIC_API_URL`을 프로파일별로 다르게.

---

## 4. 스토어 제출

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
eas submit --platform android
```

준비물:

- Apple Developer / App Store Connect
- Google Play Console
- 아이콘·스플래시·스크린샷·개인정보 고지
- 번들 ID / applicationId 확정 (나중에 바꾸기 어려움)

`app.json`:

```json
{
  "expo": {
    "ios": { "bundleIdentifier": "com.example.myapp" },
    "android": { "package": "com.example.myapp", "versionCode": 1 },
    "version": "1.0.0"
  }
}
```

버전: 사용자 보이는 `version` + 스토어 빌드 번호(autoIncrement 추천).

---

## 5. OTA — EAS Update

네이티브 코드 변경이 없으면 JS/에셋만 OTA로 배포 가능.

```bash
npx expo install expo-updates
eas update --branch production --message "Fix checkout crash"
```

주의:

- 네이티브 모듈 추가/권한/SDK 업은 **스토어 빌드** 필요
- runtimeVersion 정책으로 호환 바이너리에만 업데이트
- 강제 업데이트 UX(너무 오래된 바이너리) 설계

```json
{
  "expo": {
    "runtimeVersion": { "policy": "appVersion" },
    "updates": { "url": "https://u.expo.dev/..." }
  }
}
```

---

## 6. CI (GitHub Actions 개념)

1. PR: lint + test typecheck
2. `main`: preview build (internal)
3. 태그/릴리즈: production build + submit
4. 핫픽스: `eas update`

시크릿: `EXPO_TOKEN`, 스토어 키.

---

## 7. 딥링크·유니버설 링크

- Custom scheme: `myapp://`
- HTTPS App Links / Universal Links: 도메인 association 파일
- 알림·마케팅 링크 → `router.push`

스토어 심사·이메일 매직링크에서 중요.

---

## 8. 앱 크기·정책

- Play: AAB 업로드
- 불필요 권한 제거 (심사 리스크)
- 개인정보 안전 라벨 / Privacy Manifest (iOS)
- 계정 삭제 기능 (스토어 요구인 경우)
- 암호화/수출 규정 질문 응답

---

## 9. 프로덕션 체크리스트

### 제품

- [ ] 빈/로딩/에러/오프라인 UI
- [ ] 인증 만료·토큰 갱신
- [ ] 딥링크·푸시 진입점
- [ ] 접근성 라벨 주요 CTA

### 기술

- [ ] `APP`/API 환경 분리
- [ ] SecureStore 토큰
- [ ] Sentry(또는 동급) + 소스맵
- [ ] 프로덕션 로그에 시크릿 없음
- [ ] New Architecture / Hermes 확인

### 배포

- [ ] EAS production 빌드 성공
- [ ] 내부 테스트 트랙
- [ ] OTA 브랜치 전략 문서화
- [ ] 롤백 방법 (이전 update / 스토어 이전 빌드)

---

## 문서 목록

| 주제 | 한 줄 |
|------|------|
| Expo 시작 | RN + Expo + TS |
| UI | Flex, StyleSheet, Image |
| 상태·폼 | hooks, RHF, zod |
| 리스트·라우팅 | FlatList, Expo Router |
| 네트워크 | fetch, React Query |
| 인증·권한 | SecureStore, permissions |
| 모션 | Reanimated, Gesture |
| 아키텍처 | Zustand, feature 구조 |
| 품질 | Test, perf, Sentry |
| 출시 | EAS Build/Submit/Update |

---

## 종합 연습

1. EAS project를 연결하고 `preview` APK/내부 배포를 만든다.
2. production 프로파일로 빌드 번호 autoIncrement를 확인한다.
3. `eas update`로 카피 수정 OTA를 배포한다.
4. 프로덕션 체크리스트를 통과/미통과로 표시한다.
5. (선택) GitHub Actions에서 typecheck + test를 PR에 건다.

---

## 정리

현대 React Native는 **Expo + TypeScript + Expo Router + React Query + EAS** 조합이 기본축이다.

- UI는 Flex와 명확한 컴포넌트
- 서버 상태는 Query, 클라이언트 전역은 최소
- 토큰은 SecureStore, 권한은 필요 시점에
- 애니메이션은 UI 스레드
- 출시는 EAS, 핫픽스는 OTA(단, 네이티브 변경은 스토어)

이 문서들을 바탕으로, 도메인에 맞게 결제·지도·오프라인(SQLite/WatermelonDB)·실시간(웹소켓)을 얹으면 실무 앱으로 확장할 수 있다.

추가로 파고들 주제: Expo Modules API(커스텀 네이티브), Skia, React Native Web, Brownfield(기존 네이티브에 RN 삽입), Detox CI.

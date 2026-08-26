---
slug: flutter-01
order: 1
category: flutter
categoryLabel: Flutter
title: "Flutter SDK와 프로젝트 시작하기"
summary: "Flutter SDK 설치, 디바이스/에뮬레이터, 프로젝트 구조와 첫 실행까지 실무 기본선을 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# Flutter SDK와 프로젝트 시작하기

> 요약: Flutter SDK 설치, 디바이스/에뮬레이터, 프로젝트 구조와 첫 실행까지 실무 기본선을 정리한다.

---

## 1. 왜 Flutter인가

한 코드베이스로 **iOS·Android·웹·데스크톱**을 겨냥할 수 있다. UI는 위젯 트리, 언어는 Dart다.

실무 기본 조합: **안정 채널 SDK + VS Code 또는 Android Studio + 실제 기기 한 대**.

---

## 2. 설치 확인

```bash
flutter doctor
flutter devices
```

- Android: cmdline-tools, 라이선스, 에뮬레이터 또는 USB 디버깅
- iOS: Xcode (macOS)
- `doctor`의 빨간 항목은 배포 전에 없앤다

---

## 3. 생성·실행

```bash
flutter create my_app
cd my_app
flutter run
```

`lib/main.dart`가 진입점이다.

---

## 4. 디렉터리

```
lib/
├── main.dart
├── app.dart
└── features/
android/   ios/   web/
pubspec.yaml
test/
```

- 기능 단위 폴더를 일찍 나눈다
- 에셋은 `pubspec.yaml`에 등록해야 번들에 포함된다

---

## 정리

Flutter 시작은 위젯 암기가 아니라 **doctor가 통과하는 환경 + 재현 가능한 `flutter create`** 다.

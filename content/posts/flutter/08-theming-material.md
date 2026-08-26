---
slug: flutter-08
order: 8
category: flutter
categoryLabel: Flutter
title: "ThemeData로 머티리얼 디자인 토큰"
summary: "ColorScheme, TextTheme, 다크모드, 컴포넌트 테마로 앱 전체 시각 언어를 일관되게 만드는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# ThemeData로 머티리얼 디자인 토큰

> 요약: ColorScheme, TextTheme, 다크모드, 컴포넌트 테마로 앱 전체 시각 언어를 일관되게 만드는 방법을 정리한다.

---

## 1. 테마를 한곳

```dart
MaterialApp(
  theme: ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0B6E4F)),
    useMaterial3: true,
  ),
  darkTheme: ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF0B6E4F),
      brightness: Brightness.dark,
    ),
    useMaterial3: true,
  ),
);
```

위젯마다 하드코딩 hex를 뿌리지 않는다. `Theme.of(context).colorScheme`을 쓴다.

---

## 2. 타이포

`textTheme`으로 제목/본문 단계를 고정한다.  
접근성: 시스템 글자 크기 확대에 깨지지 않게 overflow를 설계한다.

---

## 3. 컴포넌트 테마

`AppBarTheme`, `FilledButtonTheme` 등으로 버튼·입력 모양을 통일한다.  
예외 스타일은 해당 화면만 덮는다.

---

## 4. 플랫폼

Cupertino는 iOS 느낌을 낼 때. 한 앱에서 Material/Cupertino를 무작정 섞으면 내비게이션 패턴이 흔들린다. **주 디자인 언어를 하나** 고른다.

---

## 정리

디자인은 화면 장식이 아니라 **ColorScheme + TextTheme 계약**이다.

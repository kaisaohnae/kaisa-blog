---
slug: flutter-04
order: 4
category: flutter
categoryLabel: Flutter
title: "Navigator와 라우트로 화면 전환"
summary: "Navigator 2.0 감각, go_router, 인자 전달, 딥링크까지 Flutter 화면 전환의 실무 기본을 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# Navigator와 라우트로 화면 전환

> 요약: Navigator 2.0 감각, go_router, 인자 전달, 딥링크까지 Flutter 화면 전환의 실무 기본을 정리한다.

---

## 1. 기본 스택

```dart
Navigator.of(context).push(
  MaterialPageRoute(builder: (_) => const DetailPage()),
);
```

작은 앱은 이것으로 충분하다. 웹 URL·딥링크가 필요하면 선언형 라우터를 검토한다.

---

## 2. go_router (권장 방향)

```dart
final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (_, __) => const HomePage()),
    GoRoute(
      path: '/posts/:id',
      builder: (_, state) => PostPage(id: state.pathParameters['id']!),
    ),
  ],
);
```

- 경로가 곧 상태
- 리다이렉트로 인증 게이트
- 웹·모바일 URL을 맞추기 쉽다

---

## 3. 전달·복귀

- path/query 파라미터
- `extra` 객체 (웹 새로고침에 약할 수 있음)
- `pop`으로 결과 반환

---

## 4. 주의

- `BuildContext`가 unmounted인 뒤 `push` 하지 않기
- 모달은 라우트와 역할을 섞지 않기
- 탭 앱은 `StatefulShellRoute` 등 중첩 내비 검토

---

## 정리

화면 전환은 함수 호출이 아니라 **스택(또는 URL)의 상태**다. 앱이 커지면 라우터를 한곳으로 모은다.

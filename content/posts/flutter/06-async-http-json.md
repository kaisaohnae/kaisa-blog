---
slug: flutter-06
order: 6
category: flutter
categoryLabel: Flutter
title: "비동기·HTTP·JSON으로 서버 연동"
summary: "Future/async, http 클라이언트, JSON 디코딩, 로딩·에러 UI까지 Flutter 네트워킹 기본을 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# 비동기·HTTP·JSON으로 서버 연동

> 요약: Future/async, http 클라이언트, JSON 디코딩, 로딩·에러 UI까지 Flutter 네트워킹 기본을 정리한다.

---

## 1. async 기본

```dart
Future<User> fetchUser(String id) async {
  final res = await http.get(Uri.parse('$base/users/$id'));
  if (res.statusCode != 200) {
    throw HttpException('status ${res.statusCode}');
  }
  return User.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
}
```

UI 스레드를 막지 않는다. 파싱이 크면 `compute`로 Isolate를 검토한다.

---

## 2. UI 연결

- `FutureBuilder` / `StreamBuilder`는 간단한 화면에 적합
- 복잡한 화면은 상태 계층에서 로딩/데이터/에러를 모델링

세 상태(로딩·성공·실패)를 항상 그린다.

---

## 3. 클라이언트

- 타임아웃·재시도 정책을 정한다
- 인증 헤더는 인터셉터/래퍼로 일관
- 인증 토큰을 소스에 하드코딩하지 않는다

---

## 4. 모델

- `fromJson` 계약을 명확히
- 코드젠(`json_serializable`, freezed)은 팀 합의 후
- null·타입 오류는 서버 계약 문제로 다룬다

---

## 정리

네트워킹은 호출 성공이 아니라 **실패·로딩·파싱 계약을 UI가 흡수하는가**다.

---
slug: flutter-09
order: 9
category: flutter
categoryLabel: Flutter
title: "로컬 저장·설정 영속화"
summary: "shared_preferences, 파일, SQLite까지 앱 데이터를 기기에 남기는 선택지와 보안 주의를 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# 로컬 저장·설정 영속화

> 요약: shared_preferences, 파일, SQLite까지 앱 데이터를 기기에 남기는 선택지와 보안 주의를 정리한다.

---

## 1. 무엇을 어디에

| 데이터 | 후보 |
|--------|------|
| 플래그·테마 | `shared_preferences` |
| 비밀(토큰) | secure storage (키체인/키스토어) |
| 구조화 목록 | SQLite / drift / isar |
| 캐시 파일 | 캐시 디렉터리 + 만료 |

일반 prefs에 액세스 토큰을 두지 않는다.

---

## 2. prefs 예

```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setBool('onboarding.done', true);
final done = prefs.getBool('onboarding.done') ?? false;
```

키 이름을 도메인처럼 짓는다. 마이그레이션 계획이 없으면 키 폭증이 난다.

---

## 3. SQLite

오프라인 큐, 검색, 관계가 있으면 SQL 쪽이 낫다.  
스키마 버전·마이그레이션을 앱 릴리스와 함께 관리한다.

---

## 4. 백업·멀티 기기

로컬은 유실될 수 있다. 서버가 소스 오브 트루스인지, 기기 전용인지 제품에서 합의한다.

---

## 정리

영속화는 패키지 선택이 아니라 **민감도·수명·오프라인 요구**를 표로 먼저 나누는 일이다.

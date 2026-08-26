---
slug: flutter-05
order: 5
category: flutter
categoryLabel: Flutter
title: "setState부터 Provider·Riverpod까지 상태 관리"
summary: "로컬 setState와 앱 전역 상태의 경계를 나누고, Provider/Riverpod를 고르는 기준을 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# setState부터 Provider·Riverpod까지 상태 관리

> 요약: 로컬 setState와 앱 전역 상태의 경계를 나누고, Provider/Riverpod를 고르는 기준을 정리한다.

---

## 1. 먼저 로컬

폼 입력, 토글, 애니메이션 진행도는 **위젯 근처 `setState`** 가 가장 싸다.

전역 스토어에 모든 키 입력을 넣으면 리빌드와 복잡도가 는다.

---

## 2. 언제 전역인가

| 상태 | 위치 |
|------|------|
| 로그인 세션 | 앱 스코프 |
| 장바구니·설정 | 공유 레이어 |
| 서버 목록 캐시 | 저장소/쿼리 계층 검토 |
| 버튼 로딩 | 화면 로컬 |

---

## 3. 패키지 감각

- **Provider**: 이해하기 쉽고 생태계가 큼
- **Riverpod**: 컴파일 안전·테스트·스코프에 강점
- **Bloc**: 이벤트/상태 파이프라인을 팀이 원할 때

하나를 팀 표준으로 고정한다. 한 앱에 세 종류를 섞지 않는다.

```dart
// 개념: 읽기
final user = context.watch<Auth>();
```

---

## 4. 리빌드

- `watch` 범위를 좁힌다
- 큰 트리는 위젯 분리
- `const` 생성자로 불필요 리빌드 감소

---

## 정리

상태 관리 프레임워크보다 **“이 값이 누구의 기억인가”** 를 먼저 정한다.

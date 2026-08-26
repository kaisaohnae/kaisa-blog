---
slug: flutter-03
order: 3
category: flutter
categoryLabel: Flutter
title: "Row·Column·제약으로 레이아웃 잡기"
summary: "부모 제약(constraints), Flex, Expanded, padding으로 Flutter 레이아웃이 깨지지 않게 짜는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# Row·Column·제약으로 레이아웃 잡기

> 요약: 부모 제약(constraints), Flex, Expanded, padding으로 Flutter 레이아웃이 깨지지 않게 짜는 방법을 정리한다.

---

## 1. 제약 박스

Flutter 레이아웃은 **부모가 제약을 주고, 자식이 크기를 정한다**.  
웹의 흐름 레이아웃과 달라, overflow는 보통 제약을 무시한 결과다.

---

## 2. 기본 축

| 위젯 | 축 |
|------|-----|
| `Column` | 세로 |
| `Row` | 가로 |
| `Stack` | 겹침 |
| `Wrap` | 줄바꿈 |

```dart
Row(
  children: [
    const Icon(Icons.star),
    const SizedBox(width: 8),
    Expanded(child: Text(title, overflow: TextOverflow.ellipsis)),
  ],
)
```

텍스트를 `Row`에 넣을 때는 **`Expanded` / `Flexible`** 가 거의 필수다.

---

## 3. 자주 쓰는 패턴

- `Padding` / `SafeArea`
- `Center` / `Align`
- `SizedBox`로 간격 (임의 margin 남발 지양)
- `ListView`는 스크롤 제약을 가짐 — `Column` 안에 무방비로 넣지 말 것

무한 높이 안에 `ListView`를 두면 예외가 난다. `Expanded` 또는 `shrinkWrap`(신중)을 검토한다.

---

## 4. 디버그

```dart
debugPaintSizeEnabled = true;
```

노란/검은 줄(overflow)이 보이면 제약부터 고친다.

---

## 정리

레이아웃 버그는 위젯 이름이 아니라 **누가 얼마의 폭·높이를 허용했는가**에서 시작한다.

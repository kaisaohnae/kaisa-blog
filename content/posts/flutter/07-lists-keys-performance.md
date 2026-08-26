---
slug: flutter-07
order: 7
category: flutter
categoryLabel: Flutter
title: "리스트·키·성능의 기본"
summary: "ListView.builder, key, 이미지 캐시, 불필요 리빌드를 줄여 스크롤 성능을 지키는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# 리스트·키·성능의 기본

> 요약: ListView.builder, key, 이미지 캐시, 불필요 리빌드를 줄여 스크롤 성능을 지키는 방법을 정리한다.

---

## 1. 빌더 리스트

아이템이 많으면 `Column` + map이 아니라 **`ListView.builder`**.

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return ListTile(
      key: ValueKey(item.id),
      title: Text(item.title),
    );
  },
)
```

화면에 보이는 만큼만 빌드한다.

---

## 2. Key

같은 타입 위젯이 재배열되면 Flutter는 key로 정체성을 맞춘다.  
폼·애니메이션·리스트 아이템에 **안정적 id 키**를 준다.

---

## 3. 스크롤 성능

- 무거운 위젯을 타일 안에 중첩하지 않기
- 네트워크 이미지는 캐시 패키지·사이즈 지정
- `RepaintBoundary`는 측정 후
- DevTools Performance / rebuild 하이라이트

---

## 4. const와 분리

변하지 않는 서브트리는 `const` 위젯으로 분리한다.  
상위 `setState`가 리스트 전체를 흔들지 않게 타일을 Stateless로 둔다.

---

## 정리

리스트 성능은 마법이 아니라 **빌더 + 키 + 작은 타일**의 합이다.

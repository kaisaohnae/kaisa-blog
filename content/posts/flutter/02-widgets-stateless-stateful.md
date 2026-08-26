---
slug: flutter-02
order: 2
category: flutter
categoryLabel: Flutter
title: "Stateless와 Stateful 위젯"
summary: "위젯이 화면의 구성 단위임을 기준으로 StatelessWidget과 StatefulWidget의 역할·생명주기를 정리한다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# Stateless와 Stateful 위젯

> 요약: 위젯이 화면의 구성 단위임을 기준으로 StatelessWidget과 StatefulWidget의 역할·생명주기를 정리한다.

---

## 1. 모든 것이 위젯

버튼, 패딩, 테마, 앱 전체까지 **위젯 트리**로 조합한다. 새 UI는 보통 기존 위젯을 조합해 만든다.

---

## 2. StatelessWidget

입력이 바뀌면 다시 그려질 뿐, **내부 가변 상태가 없다**.

```dart
class TitleText extends StatelessWidget {
  const TitleText({super.key, required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text);
  }
}
```

---

## 3. StatefulWidget

탭, 입력, 애니메이션처럼 **시간이 지나며 변하는 값**이 있을 때.

```dart
class Counter extends StatefulWidget {
  const Counter({super.key});
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => setState(() => count++),
      child: Text('$count'),
    );
  }
}
```

`setState`는 해당 `State`의 `build`를 다시 돌린다. 범위를 작게 유지한다.

---

## 4. 생명주기 포인트

- `initState`: 한 번 초기화
- `dispose`: 컨트롤러·구독 해제
- `didUpdateWidget`: 부모 파라미터가 바뀔 때

---

## 정리

상태가 없으면 Stateless, **이 위젯이 기억할 값이 있으면 Stateful**. 전역 상태는 별도 계층으로 뺀다.

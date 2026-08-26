---
slug: html-css-03
order: 3
category: html-css
categoryLabel: HTML/CSS
title: "Flexbox로 1차원 레이아웃 잡기"
summary: "주축·교차축, justify/align, gap, flex 단축 속성으로 실무에서 가장 많이 쓰는 Flex 패턴을 정리한다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# Flexbox로 1차원 레이아웃 잡기

> 요약: 주축·교차축, justify/align, gap, flex 단축 속성으로 실무에서 가장 많이 쓰는 Flex 패턴을 정리한다.

---

## 1. Flex가 맞는 경우

한 방향으로 나열·정렬할 때: 내비, 툴바, 카드 액션, 폼 한 줄.

```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
```

---

## 2. 축을 먼저 정한다

| 속성 | 의미 |
|------|------|
| `flex-direction` | 주축 방향 (`row` / `column`) |
| `justify-content` | 주축 정렬 |
| `align-items` | 교차축 정렬 |
| `flex-wrap` | 줄바꿈 |
| `gap` | 아이템 간격 |

`margin: auto`로 한쪽을 밀어내는 트릭도 여전히 유용하다.

---

## 3. 아이템 성장

```css
.grow { flex: 1 1 auto; }
.fixed { flex: 0 0 240px; }
```

- `flex-grow`: 남는 공간 분배
- `flex-shrink`: 부족할 때 축소
- `flex-basis`: 기본 크기

텍스트 잘림이 필요하면 자식에 `min-width: 0`을 주는 경우가 많다.

---

## 4. 자주 쓰는 패턴

**가운데 정렬**

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**왼쪽 묶음 + 오른쪽 액션**

```css
.bar { display: flex; gap: 8px; }
.bar__spacer { margin-left: auto; }
```

---

## 정리

Flex는 “만능 그리드”가 아니라 **한 줄(또는 한 열) 정렬 도구**다. 2차원이면 Grid를 본다.

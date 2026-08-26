---
slug: html-css-04
order: 4
category: html-css
categoryLabel: HTML/CSS
title: "CSS Grid로 2차원 레이아웃 잡기"
summary: "행·열 트랙, fr, auto-fit, 영역 이름까지 Grid로 페이지·카드 그리드를 설계하는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# CSS Grid로 2차원 레이아웃 잡기

> 요약: 행·열 트랙, fr, auto-fit, 영역 이름까지 Grid로 페이지·카드 그리드를 설계하는 방법을 정리한다.

---

## 1. Grid가 맞는 경우

행과 열을 **동시에** 제어할 때: 대시보드, 갤러리, 전체 페이지 골격.

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}
```

---

## 2. 트랙 단위

| 단위 | 용도 |
|------|------|
| `fr` | 남는 공간 비율 |
| `minmax(0, 1fr)` | 넘침 방지에 자주 사용 |
| `auto` / `max-content` | 내용 기반 |
| `repeat(auto-fit, minmax(16rem, 1fr))` | 반응형 카드 |

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
```

---

## 3. 영역으로 배치

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
  grid-template-columns: 12rem 1fr;
}
.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

이름 있는 영역은 미디어쿼리에서 재배치하기 쉽다.

---

## 4. Flex vs Grid

| | Flex | Grid |
|--|------|------|
| 차원 | 1D | 2D |
| 강점 | 정렬·분배 | 행열·영역 |
| 함께 | 카드 안 헤더 | 카드 바깥 그리드 |

---

## 정리

페이지 골격은 Grid, 컴포넌트 내부 정렬은 Flex — 이 역할 분담만 지켜도 레이아웃이 단순해진다.

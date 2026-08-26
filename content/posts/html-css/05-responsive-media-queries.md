---
slug: html-css-05
order: 5
category: html-css
categoryLabel: HTML/CSS
title: "반응형 디자인과 미디어 쿼리"
summary: "모바일 우선, 브레이크포인트, fluid 단위·clamp로 화면 폭에 대응하는 반응형 기본 전략을 정리한다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# 반응형 디자인과 미디어 쿼리

> 요약: 모바일 우선, 브레이크포인트, fluid 단위·clamp로 화면 폭에 대응하는 반응형 기본 전략을 정리한다.

---

## 1. 모바일 우선

작은 화면 스타일을 기본으로 두고, 넓어질 때 강화한다.

```css
.nav { display: none; }
@media (min-width: 768px) {
  .nav { display: flex; }
}
```

`max-width`만으로 데스크톱을 먼저 짜면 예외가 쌓이기 쉽다.

---

## 2. 브레이크포인트

팀에서 **소수만** 합의한다. 예:

| 이름 | 예 |
|------|-----|
| sm | 640px |
| md | 768px |
| lg | 1024px |

기기 목록을 쫓지 말고 **레이아웃이 깨지는 지점**에 둔다.

---

## 3. Fluid 기법

```css
.container {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
}
.title {
  font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem);
}
```

- `%` / `vw` / `rem` / `clamp`
- 고정 px 남발보다 **한계(min/max)가 있는 유동**

---

## 4. 이미지·터치

- `srcset` / `sizes`로 해상도 대응
- 터치 타깃 충분히 (대략 44px 전후)
- hover 전용 정보는 터치에서도 도달 가능하게

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
}
```

---

## 정리

반응형은 미디어쿼리 개수가 아니라 **기본(좁은 화면) + 필요한 지점만 확장**하는 설계다.

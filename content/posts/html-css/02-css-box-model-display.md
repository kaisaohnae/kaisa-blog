---
slug: html-css-02
order: 2
category: html-css
categoryLabel: HTML/CSS
title: "CSS 박스 모델과 display 기초"
summary: "content·padding·border·margin과 box-sizing, display 값의 차이를 정리해 레이아웃 사고의 기본을 잡는다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# CSS 박스 모델과 display 기초

> 요약: content·padding·border·margin과 box-sizing, display 값의 차이를 정리해 레이아웃 사고의 기본을 잡는다.

---

## 1. 박스 모델

모든 요소는 박스로 그려진다.

```
margin
  border
    padding
      content
```

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

`border-box`면 **width에 padding·border가 포함**되어 계산이 직관적이다. 프로젝트 기본값으로 두는 편이 좋다.

---

## 2. display 핵심

| 값 | 동작 |
|----|------|
| `block` | 가로 한 줄 차지, 위아래 쌓임 |
| `inline` | 글자처럼 흐름, width/height 제한적 |
| `inline-block` | 흐름 + 박스 크기 지정 |
| `none` | 렌더·레이아웃에서 제거 |
| `flex` / `grid` | 자식 배치 컨텍스트 |

`visibility: hidden`은 자리는 남기고, `display: none`은 자리를 없앤다.

---

## 3. margin 함정

- 세로 margin collapse: 인접 block끼리 마진이 합쳐질 수 있다
- 부모에 padding/border/overflow로 막는 패턴이 흔하다
- 컴포넌트 간격은 **gap( flex/grid )** 또는 유틸 클래스로 통일

---

## 4. 실무 기본 리셋(최소)

```css
html { line-height: 1.5; }
body { margin: 0; }
img, svg { max-width: 100%; height: auto; display: block; }
```

과도한 전체 리셋보다 **팀 합의된 최소 세트**가 유지보수에 유리하다.

---

## 정리

레이아웃 버그의 절반은 박스 모델·`display` 오해에서 온다. 먼저 **어떤 박스가 어떻게 흐르는지**를 본다.

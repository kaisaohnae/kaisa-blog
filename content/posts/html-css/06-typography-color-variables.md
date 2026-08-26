---
slug: html-css-06
order: 6
category: html-css
categoryLabel: HTML/CSS
title: "타이포·색·CSS 변수로 디자인 토큰"
summary: "글꼴·행간·색 대비와 CSS 커스텀 프로퍼티로 일관된 디자인 토큰을 만드는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# 타이포·색·CSS 변수로 디자인 토큰

> 요약: 글꼴·행간·색 대비와 CSS 커스텀 프로퍼티로 일관된 디자인 토큰을 만드는 방법을 정리한다.

---

## 1. 타이포 기본

| 항목 | 권장 |
|------|------|
| 본문 | 16px 전후 (`1rem`) |
| 행간 | 1.5 전후 |
| 제목 | 단계적으로, 과도한 단계 수 금지 |
| 줄길이 | 대략 45–75자 |

```css
:root {
  --font-sans: "Pretendard", system-ui, sans-serif;
  --text-body: 1rem;
  --leading: 1.6;
}
body {
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: var(--leading);
}
```

---

## 2. 색과 대비

- 본문/배경 대비를 확보한다 (대략 WCAG AA 목표)
- “브랜드 색 = 본문 색”으로 쓰지 않는다
- 상태색(성공/위험)은 색만으로 전달하지 말고 아이콘·텍스트 병행

---

## 3. CSS 변수(토큰)

```css
:root {
  --color-bg: #f7f7f5;
  --color-text: #1a1a1a;
  --color-accent: #0b6e4f;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius: 8px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #121212;
    --color-text: #f2f2f2;
  }
}
```

컴포넌트는 raw hex 대신 **토큰만** 참조하게 하면 테마 전환이 쉽다.

---

## 4. 간격 스케일

`4 / 8 / 12 / 16 / 24 / 32`처럼 제한된 스케일을 쓰면 화면이 정돈된다.  
임의 `13px` 간격이 늘수록 디자인이 흔들린다.

---

## 정리

예쁜 한 페이지보다 **토큰이 있는 시스템**이 다음 페이지를 싸게 만든다.

---
slug: html-css-08
order: 8
category: html-css
categoryLabel: HTML/CSS
title: "모던 HTML/CSS 실무 체크리스트"
summary: "시맨틱·레이아웃·반응형·토큰·접근성까지, 페이지를 내보내기 전에 볼 HTML/CSS 실무 체크리스트를 모은다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# 모던 HTML/CSS 실무 체크리스트

> 요약: 시맨틱·레이아웃·반응형·토큰·접근성까지, 페이지를 내보내기 전에 볼 HTML/CSS 실무 체크리스트를 모은다.

---

## 1. HTML

- [ ] `lang`, charset, viewport
- [ ] `h1` 하나 + 제목 계층
- [ ] `main` / `nav` / `button`·`a` 구분
- [ ] 이미지 `alt`, 가능하면 크기 지정
- [ ] 폼 `label` 연결

---

## 2. 레이아웃

- [ ] `box-sizing: border-box`
- [ ] 1D → Flex, 2D → Grid
- [ ] `gap`으로 간격 통일
- [ ] 넘침: `minmax(0, 1fr)` / `min-width: 0`
- [ ] 컨테이너 폭 `min(100% - gutter, max)`

---

## 3. 반응형·시각

- [ ] 모바일 우선 미디어쿼리
- [ ] `clamp` 등 fluid 타이포 검토
- [ ] 다크모드/테마는 변수로
- [ ] 색 대비 확인

---

## 4. 접근성·품질

- [ ] `:focus-visible` 스타일
- [ ] 키보드만으로 주요 흐름 가능
- [ ] `prefers-reduced-motion`
- [ ] 불필요한 `!important` / 과도한 특이도 정리

---

## 5. 모던 기능(필요 시)

| 기능 | 언제 |
|------|------|
| Container Queries | 컴포넌트 폭 기준 반응 |
| `:has()` | 부모 상태 스타일 |
| cascade layers | 라이브러리·앱 스타일 경계 |
| `color-mix()` | 토큰 기반 파생색 |

새 문법은 **지원 범위와 팀 합의** 후 도입한다.

---

## 정리

HTML/CSS 실력은 트릭 개수가 아니라 **체크리스트를 통과하는 페이지를 반복해서 만드는 힘**이다.

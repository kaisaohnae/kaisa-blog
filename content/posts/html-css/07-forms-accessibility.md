---
slug: html-css-07
order: 7
category: html-css
categoryLabel: HTML/CSS
title: "폼·포커스·접근성 기본"
summary: "label 연결, 키보드 포커스, aria·시맨틱으로 쓸 수 있는 폼과 UI 접근성 최소 기준을 정리한다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# 폼·포커스·접근성 기본

> 요약: label 연결, 키보드 포커스, aria·시맨틱으로 쓸 수 있는 폼과 UI 접근성 최소 기준을 정리한다.

---

## 1. 폼의 최소 규칙

```html
<label for="email">이메일</label>
<input id="email" name="email" type="email" autocomplete="email" required />
```

- `label` ↔ `id` 연결
- `button`에 빈 아이콘만 두지 말고 접근 가능한 이름(`aria-label` 등)
- 에러는 입력 근처에 텍스트로

`div`로 만든 “가짜 체크박스”는 키보드·스크린 리더 비용이 크다. 네이티브 컨트롤을 우선한다.

---

## 2. 포커스

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

`outline: none`만 남기는 것은 금지에 가깝다. **보이는 포커스**를 디자인한다.

---

## 3. 의미·상태

| 상황 | 접근 |
|------|------|
| 펼침 메뉴 | `aria-expanded` |
| 모달 | 포커스 트랩 + `Esc` |
| 필수 | `required` + 시각 표시 |
| 로딩 버튼 | `disabled` + 상태 텍스트 |

장식 아이콘은 `aria-hidden="true"`.

---

## 4. 운동·대비

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

색 대비·텍스트 크기 확대를 실제 기기에서 한 번이라도 확인한다.

---

## 정리

접근성은 나중에 덧칠하는 옵션이 아니라 **HTML을 올바르게 쓰는 습관**이다.

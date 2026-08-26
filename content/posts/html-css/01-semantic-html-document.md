---
slug: html-css-01
order: 1
category: html-css
categoryLabel: HTML/CSS
title: "시맨틱 HTML로 문서 뼈대 잡기"
summary: "header·main·nav·section 등 시맨틱 태그로 문서 구조를 잡고, 접근성·SEO에 유리한 HTML 기본선을 정리한다."
publishedAt: 2026-08-26
tags: ["html-css"]
---

# 시맨틱 HTML로 문서 뼈대 잡기

> 요약: header·main·nav·section 등 시맨틱 태그로 문서 구조를 잡고, 접근성·SEO에 유리한 HTML 기본선을 정리한다.

---

## 1. 왜 시맨틱인가

`div`만으로도 화면은 만들 수 있다. 다만 **의미 있는 태그**를 쓰면:

- 스크린 리더·검색엔진이 구조를 읽기 쉽다
- CSS·JS 선택자가 의도에 맞게 유지된다
- 팀원에게 HTML만으로도 레이아웃 의도가 전달된다

---

## 2. 기본 뼈대

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>페이지 제목</title>
  </head>
  <body>
    <header>…</header>
    <nav aria-label="주요">…</nav>
    <main>
      <article>
        <h1>…</h1>
        <section>…</section>
      </article>
    </main>
    <aside>…</aside>
    <footer>…</footer>
  </body>
</html>
```

- `lang`은 실제 언어에 맞춘다
- `main`은 문서당 하나
- 제목은 `h1`~`h6` 계층을 건너뛰지 않는다

---

## 3. 태그 선택 가이드

| 의도 | 태그 |
|------|------|
| 사이트 헤더/푸터 | `header` / `footer` |
| 주요 내비 | `nav` |
| 독립 글 | `article` |
| 주제 구역 | `section` |
| 보조 정보 | `aside` |
| 버튼이 아닌 링크 | `a` |
| 동작 트리거 | `button` |

클릭 가능한 `div` + `onclick`은 피하고, **`button`/`a`** 를 쓴다.

---

## 4. 이미지·대체 텍스트

```html
<img src="/hero.webp" alt="강아지 산책 사진" width="800" height="450" />
```

- 의미 있는 이미지 → 구체적 `alt`
- 장식 이미지 → `alt=""`
- 가능하면 `width`/`height`로 CLS 완화

---

## 정리

HTML의 첫 목표는 예쁘게 그리는 것이 아니라 **문서의 뼈대를 올바르게 선언**하는 것이다.

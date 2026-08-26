# Posts 작성법 (kaisa-blog)

`content/posts/` 아래 마크다운은 **공개 블로그 포스트**다.  
DB 기반 **이슈**(`/issues/`)와 분리한다. 이슈는 Cafe24 API·관리자 운영을 그대로 쓴다.

| 영역 | 소스 | URL |
|------|------|-----|
| Posts | 이 폴더의 `.md` | `/posts/`, `/posts/[slug]/` |
| Issues | DB API | `/issues/`, `/issues/view/?slug=` |

---

## 1. 폴더 = 카테고리

| 폴더 | 표시명 | slug 접두사 |
|------|--------|-------------|
| `spring-boot/` | Spring Boot | `spring-boot-` |
| `laravel/` | Laravel | `laravel-` |
| `react-native/` | React Native | `react-native-` |
| `nextjs/` | Next.js | `nextjs-` |
| `aws/` | AWS | `aws-` |
| `html-css/` | HTML/CSS | `html-css-` |
| `nginx/` | Nginx | `nginx-` |
| `db/` | DB | `db-` |
| `vue/` | Vue | `vue-` |
| `angular/` | Angular | `angular-` |
| `flutter/` | Flutter | `flutter-` |
| `wpf/` | WPF | `wpf-` |

- 새 카테고리는 폴더를 만들고 이 표·`src/lib/md-posts.ts`의 라벨 맵을 갱신한다.
- `study` 등 임시 워크스페이스 이름은 쓰지 않는다.

---

## 2. 파일명 · slug · 번호 체계

### 파일명

```
{nn}-{kebab-en}.md
```

예: `01-spring-boot-3-java-21.md`, `07-queue-job-events.md`

- `nn`: 카테고리 안 순서 `01`부터 (`02`, `03` …). **카테고리마다 독립 채번.**
- `kebab-en`: ASCII 소문자·하이픈만 (경로·도구 호환).

### slug (URL · 유일키)

```
{category}-{nn}
```

예: `spring-boot-01`, `laravel-07`, `react-native-10`  
공개 URL: `/posts/spring-boot-01/`

- slug는 frontmatter `slug`와 일치해야 한다.
- 한 번 공개한 slug는 바꾸지 않는다. 제목만 수정한다.
- 새 글은 해당 폴더에서 **다음 번호**를 쓴다 (빈 번호 재사용 금지가 기본).

### frontmatter (필수)

```yaml
---
slug: spring-boot-01
order: 1
category: spring-boot
categoryLabel: Spring Boot
title: "Spring Boot 3와 Java 21 시작하기"
summary: "한두 문장 요약"
publishedAt: 2026-08-26
tags: ["spring-boot"]
---
```

---

## 3. 본문 뼈대

```markdown
# 제목

> 요약: …

---

## 1. …

## 연습   ← 선택
```

- H1 하나. 제목에 `01.` / `N강` 금지.
- `> 요약:` 은 목록·SEO description에 사용.
- 강좌 톤 금지 (1강, 다음 강의, 실습 과제 등). 하단은 `## 연습` / `## 정리`.

---

## 4. 발행

1. `content/posts/<category>/`에 파일 추가·수정
2. `npm run build` (또는 배포 워크플로) — 정적 HTML·sitemap 반영
3. 이슈(DB 글)는 관리자 `/manager/`에서 기존처럼 작성

`manifest.json`은 마이그레이션/점검용이며, 런타임은 폴더의 `.md`를 직접 읽는다.

---

## 5. 체크리스트

- [ ] 폴더·`nn`·`slug`·frontmatter `slug`가 일치하는가
- [ ] slug가 카테고리 내·전체에서 유일한가
- [ ] H1 + `> 요약:` 이 있는가
- [ ] 강좌/study 표현이 없는가
- [ ] Issues(DB) 글을 Posts MD와 섞지 않았는가

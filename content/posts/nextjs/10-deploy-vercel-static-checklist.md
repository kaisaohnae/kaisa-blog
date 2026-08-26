---
slug: nextjs-10
order: 10
category: nextjs
categoryLabel: Next.js
title: "배포 — Vercel·정적 호스팅·체크리스트"
summary: "Vercel·GitHub Pages 등 배포 선택과 환경변수·캐시·도메인·롤백을 점검 목록으로 정리한다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# 배포 — Vercel·정적 호스팅·체크리스트

> 요약: Vercel·GitHub Pages 등 배포 선택과 환경변수·캐시·도메인·롤백을 점검 목록으로 정리한다.

---

## 1. 호스팅 선택

| 대상 | 적합 |
|------|------|
| Vercel / 유사 PaaS | SSR·Action·ISR·미들웨어 풀활용 |
| GitHub Pages / S3+CDN | `output: 'export'` 정적 사이트 |
| Node 서버 / Docker | 커스텀 런타임·사내 인프라 |

기능이 필요하면 호스팅을 먼저 고치고,  
정적만 필요하면 export로 단순화한다.

---

## 2. 환경변수

```env
NEXT_PUBLIC_SITE_URL=https://blog.example.com
NEXT_PUBLIC_API_URL=https://api.example.com
```

- `NEXT_PUBLIC_*` → 클라이언트 노출
- 시크릿 → 서버 전용, 저장소 커밋 금지
- 프리뷰/프로덕션 URL 분리

---

## 3. 정적 export 배포 흐름

```bash
npm run build
# out/ 업로드
```

- `trailingSlash`와 서버/CDN 설정 일치
- SPA 폴백보다 **실제 경로별 HTML**이 SEO에 유리
- 커스텀 도메인 + HTTPS

---

## 4. 프로덕션 체크리스트

### SEO

- [ ] 글 URL이 정적 HTML
- [ ] sitemap / robots
- [ ] canonical·OG
- [ ] 관리자·로그인 noindex

### 신뢰성

- [ ] 환경변수 누락 시 빌드 실패 또는 명확한 에러
- [ ] 404/500 페이지
- [ ] 롤백 방법 (이전 배포 재활성화)

### 성능

- [ ] 이미지·폰트 전략
- [ ] 번들 이상치 없음
- [ ] 캐시 헤더/CDN

---

## 5. CI 스케치

1. lint / typecheck / test
2. `next build`
3. artifact 배포 또는 Vercel 연동
4. 스모크: `/`, `/posts/`, 대표 글 URL

---

## 정리

Next.js 배포는 “어디서 돌릴지”가 아키텍처다.  
공개 문서·블로그는 정적 HTML, 동적 이슈·관리자는 API — 역할을 나누면 SEO와 운영을 동시에 가져가기 쉽다.

---

## 연습

1. 현재 프로젝트가 Vercel형인지 export형인지 한 줄로 적는다.
2. `NEXT_PUBLIC_SITE_URL`이 sitemap·OG에 쓰이는지 확인한다.
3. 위 체크리스트를 통과/미통과로 표시한다.

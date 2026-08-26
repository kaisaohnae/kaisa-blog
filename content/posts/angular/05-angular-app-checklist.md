---
slug: angular-05
order: 5
category: angular
categoryLabel: Angular
title: "Angular 앱 실무 체크리스트"
summary: "구조, 성능, 테스트, 빌드·배포까지 Angular 앱을 내보내기 전에 볼 실무 체크리스트를 모은다."
publishedAt: 2026-08-26
tags: ["angular"]
---

# Angular 앱 실무 체크리스트

> 요약: 구조, 성능, 테스트, 빌드·배포까지 Angular 앱을 내보내기 전에 볼 실무 체크리스트를 모은다.

---

## 1. 구조·품질

- [ ] standalone + TypeScript strict
- [ ] 기능 폴더 단위, 순환 의존 없음
- [ ] ESLint (`angular-eslint`)
- [ ] 환경 설정(`fileReplacements` 또는 빌드 타임 env)에 시크릿 금지

---

## 2. 성능

- [ ] 라우트 `loadComponent` / `loadChildren`
- [ ] `track` / `trackBy`로 리스트 안정화
- [ ] OnPush 또는 시그널로 불필요 CD 감소
- [ ] `ng build` 번들 예산(budgets) 확인
- [ ] 이미지: NgOptimizedImage 검토

---

## 3. 데이터·보안

- [ ] HttpClient 에러·재시도 정책
- [ ] interceptor로 인증 헤더 일관 처리
- [ ] XSS: DomSanitizer 오남용 금지
- [ ] CSRF/쿠키 정책은 백엔드와 합의

---

## 4. 테스트·품질

- [ ] 핵심 서비스 단위 테스트
- [ ] 주요 화면 컴포넌트 테스트 또는 e2e 소수
- [ ] `ng test` / CI에서 깨지면 머지 금지

---

## 5. 배포

- [ ] `ng build --configuration production`
- [ ] 베이스 href / 자산 경로
- [ ] SPA 폴백 (Nginx `try_files` → `index.html`)
- [ ] 소스맵 공개 범위

---

## 정리

Angular는 기능이 많아서가 아니라 **체크리스트를 통과하는 기본선**을 지키면 팀 규모에서 이득이 난다.

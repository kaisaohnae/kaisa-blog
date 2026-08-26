---
slug: vue-05
order: 5
category: vue
categoryLabel: Vue
title: "Vue 앱 실무 체크리스트"
summary: "프로젝트 구조, 성능, 접근성, 빌드·배포까지 Vue 앱을 내보내기 전에 볼 실무 체크리스트를 모은다."
publishedAt: 2026-08-26
tags: ["vue"]
---

# Vue 앱 실무 체크리스트

> 요약: 프로젝트 구조, 성능, 접근성, 빌드·배포까지 Vue 앱을 내보내기 전에 볼 실무 체크리스트를 모은다.

---

## 1. 구조·품질

- [ ] Vue 3 + `script setup` + TypeScript 기본선
- [ ] 컴포넌트 단일 책임, props/emits 계약 명확
- [ ] ESLint + (가능하면) oxlint/vitest 등 팀 표준
- [ ] 환경 변수 `VITE_` 접두사·시크릿 프론트 금지

---

## 2. 성능

- [ ] 라우트·모달 등 무거운 화면 lazy import
- [ ] `v-for`에 안정적 `key`
- [ ] 큰 리스트는 가상 스크롤 검토
- [ ] 불필요한 deep `watch` / 과도한 `reactive` 지양
- [ ] 프로덕션 빌드·번들 분석

---

## 3. UX·접근성

- [ ] 버튼/링크 시맨틱, 포커스 스타일
- [ ] 비동기 UI에 로딩·에러·빈 상태
- [ ] 폼 validation 메시지
- [ ] 라우트 전환 후 스크롤·포커스 정책

---

## 4. 데이터·보안

- [ ] API 에러·타임아웃 처리
- [ ] XSS: `v-html` 최소화·살균
- [ ] 인증 토큰 저장 위치 합의 (메모리/쿠키)
- [ ] CSRF/쿠키 SameSite 정책 (백엔드와)

---

## 5. 배포

- [ ] `vite build` 산출물·베이스 경로
- [ ] SPA 폴백(Nginx `try_files` 등)
- [ ] 소스맵·콘솔 노출 정책
- [ ] 버전/헬스 엔드포인트(필요 시)

---

## 정리

Vue 실력은 API 암기가 아니라 **체크리스트를 통과하는 앱을 반복해서 만드는 힘**이다.

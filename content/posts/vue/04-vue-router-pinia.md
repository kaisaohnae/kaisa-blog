---
slug: vue-04
order: 4
category: vue
categoryLabel: Vue
title: "Vue Router와 Pinia로 화면·상태 구성"
summary: "라우트 맵핑, 네비게이션 가드, Pinia 스토어로 SPA의 화면 전환과 공유 상태를 구성하는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["vue"]
---

# Vue Router와 Pinia로 화면·상태 구성

> 요약: 라우트 맵핑, 네비게이션 가드, Pinia 스토어로 SPA의 화면 전환과 공유 상태를 구성하는 방법을 정리한다.

---

## 1. Vue Router

```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/HomeView.vue') },
    { path: '/posts/:id', name: 'post', component: () => import('./pages/PostView.vue'), props: true },
  ],
})
```

- 라우트 단위 **lazy import**로 초기 번들 축소
- `params`/`query`는 컴포넌트에서 소비
- 인증은 `beforeEach` 가드로

---

## 2. 네비게이션 가드

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})
```

가드에서 무거운 API를 남발하면 전환이 느려진다. 최소 정보만.

---

## 3. Pinia

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function inc() {
    count.value++
  }
  return { count, double, inc }
})
```

- Vuex 대신 **Pinia**가 Vue 3 기본 권장
- setup 스토어가 Composition과 잘 맞음
- 서버 상태는 TanStack Query 등과 역할을 나누기도 한다

---

## 4. 경계

| 상태 | 어디에 |
|------|--------|
| 폼 입력 | 컴포넌트 로컬 |
| 로그인 세션 | Pinia (+ 쿠키/토큰) |
| 서버 목록 캐시 | 데이터 페칭 라이브러리 검토 |

모든 것을 스토어에 넣지 않는다.

---

## 정리

Router는 **URL ↔ 화면**, Pinia는 **공유 클라이언트 상태** — 둘의 경계를 지키면 SPA가 단순해진다.

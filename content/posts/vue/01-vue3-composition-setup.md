---
slug: vue-01
order: 1
category: vue
categoryLabel: Vue
title: "Vue 3 Composition API로 시작하기"
summary: "createApp·SFC·setup·script setup 기준으로 Vue 3 프로젝트의 기본 구조와 Composition API 진입점을 정리한다."
publishedAt: 2026-08-26
tags: ["vue"]
---

# Vue 3 Composition API로 시작하기

> 요약: createApp·SFC·setup·script setup 기준으로 Vue 3 프로젝트의 기본 구조와 Composition API 진입점을 정리한다.

---

## 1. 왜 Vue 3인가

| 항목 | Vue 2 감각 | Vue 3 |
|------|------------|-------|
| API | Options 중심 | Composition + Options |
| 반응형 | `Object.defineProperty` | Proxy |
| 트리쉐이킹 | 제한적 | 개선 |
| TypeScript | 보조 | 1급 시민에 가깝게 |

신규는 **Vue 3 + `<script setup>`** 을 기본선으로 둔다.

---

## 2. 최소 앱

```bash
npm create vue@latest
cd my-app
npm install
npm run dev
```

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button type="button" @click="count++">{{ count }}</button>
</template>
```

`script setup`은 setup 문법 설탕으로, export 없이 최상위 바인딩이 템플릿에 노출된다.

---

## 3. SFC 구조

```
Component.vue
├── <script setup>
├── <template>
└── <style scoped>
```

- 로직은 script, 마크업은 template, 스타일은 scoped가 기본
- 컴포넌트 파일명은 PascalCase 권장

---

## 4. Options vs Composition

Options(`data`/`methods`)도 동작하지만, 로직 재사용·TS·대형 컴포넌트에서는 Composition이 유리하다.  
기존 Options 코드는 점진 이관하면 된다.

---

## 정리

Vue 3 시작은 버전 논쟁보다 **`script setup` + Composition + SFC** 기본선을 고정하는 것이다.

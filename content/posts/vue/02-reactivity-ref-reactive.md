---
slug: vue-02
order: 2
category: vue
categoryLabel: Vue
title: "ref·reactive로 반응형 상태 다루기"
summary: "ref와 reactive의 차이, 언래핑, computed·watch까지 Vue 반응형 핵심 API 사용법을 정리한다."
publishedAt: 2026-08-26
tags: ["vue"]
---

# ref·reactive로 반응형 상태 다루기

> 요약: ref와 reactive의 차이, 언래핑, computed·watch까지 Vue 반응형 핵심 API 사용법을 정리한다.

---

## 1. ref

```ts
import { ref } from 'vue'

const count = ref(0)
count.value++ // script에서는 .value
```

템플릿에서는 자동 언래핑되어 `{{ count }}`로 쓴다.  
**원시값·단일 값은 ref**가 기본 선택이다.

---

## 2. reactive

```ts
import { reactive } from 'vue'

const state = reactive({ user: null as null | { name: string }, loading: false })
state.loading = true
```

객체 전체에 Proxy를 씌운다. 구조 분해하면 반응형이 끊길 수 있어 `toRefs`를 검토한다.

| | ref | reactive |
|--|-----|----------|
| 값 | `.value` | 직접 프로퍼티 |
| 교체 | `count.value = 1` | 객체 통째 교체 어려움 |
| 추천 | 원시·단일 | 관련 필드 묶음 |

---

## 3. computed · watch

```ts
import { computed, watch } from 'vue'

const double = computed(() => count.value * 2)

watch(count, (n, o) => {
  console.log(o, '→', n)
})
```

- `computed`: 파생 값 (캐시)
- `watch` / `watchEffect`: 부수 효과 (API 호출 등)

---

## 4. 실수 포인트

- script에서 `ref`의 `.value` 누락
- `reactive` 객체를 재할당
- deep watch 남용으로 성능 저하

---

## 정리

상태를 만들 때 **“값인가, 필드 묶음인가”** 만 먼저 정하면 ref/reactive 선택이 단순해진다.

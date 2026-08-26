---
slug: vue-03
order: 3
category: vue
categoryLabel: Vue
title: "컴포넌트 props·emits·슬롯"
summary: "부모-자식 데이터 흐름, 타입 안전한 props/emits, 슬롯으로 UI를 조합하는 패턴을 정리한다."
publishedAt: 2026-08-26
tags: ["vue"]
---

# 컴포넌트 props·emits·슬롯

> 요약: 부모-자식 데이터 흐름, 타입 안전한 props/emits, 슬롯으로 UI를 조합하는 패턴을 정리한다.

---

## 1. 단방향 흐름

부모 → 자식: **props**  
자식 → 부모: **emits**  
UI 구멍: **slots**

```vue
<!-- Parent -->
<UserCard :user="user" @select="onSelect">
  <template #actions>
    <button type="button">편집</button>
  </template>
</UserCard>
```

---

## 2. props · emits (script setup)

```ts
const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  select: [id: string]
  close: []
}>()

function onClick() {
  emit('select', '42')
}
```

- props를 자식에서 직접 mutate하지 않는다
- 이벤트 이름은 의트를 명확히 (`update:modelValue` 등)

---

## 3. v-model

```vue
<SearchInput v-model="query" />
```

자식은 `modelValue` + `update:modelValue` 관례를 따르면 양방향처럼 쓸 수 있다.  
Vue 3.4+ `defineModel`도 팀 합의 후 사용.

---

## 4. 슬롯

| 종류 | 용도 |
|------|------|
| default | 기본 삽입 |
| named | 여러 구역 |
| scoped | 자식 데이터를 부모 템플릿에 노출 |

레이아웃·디자인 시스템에서 슬롯이 재사용의 핵심이다.

---

## 정리

컴포넌트 API는 화려함보다 **props/emits/slots 계약을 좁고 명확하게** 가져가는 것이 유지보수에 이득이다.

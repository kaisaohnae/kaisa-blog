---
slug: angular-02
order: 2
category: angular
categoryLabel: Angular
title: "컴포넌트·템플릿·데이터 바인딩"
summary: "인터폴레이션, property/event 바인딩, @if/@for, input/output으로 템플릿과 컴포넌트를 연결하는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["angular"]
---

# 컴포넌트·템플릿·데이터 바인딩

> 요약: 인터폴레이션, property/event 바인딩, @if/@for, input/output으로 템플릿과 컴포넌트를 연결하는 방법을 정리한다.

---

## 1. 바인딩 네 가지

| 문법 | 방향 | 예 |
|------|------|-----|
| `{{ }}` | 컴포넌트 → 뷰 | 텍스트 |
| `[prop]` | → | DOM/컴포넌트 입력 |
| `(event)` | ← | 클릭·커스텀 이벤트 |
| `[(ngModel)]` | 양방향 | 폼 (FormsModule 필요) |

```html
<button type="button" [disabled]="loading" (click)="save()">
  {{ label }}
</button>
```

---

## 2. 제어 흐름 (신규 문법)

```html
@if (user) {
  <p>{{ user.name }}</p>
} @else {
  <p>로그인 필요</p>
}

@for (item of items; track item.id) {
  <li>{{ item.title }}</li>
}
```

`*ngIf` / `*ngFor`도 동작하지만, 신규는 **내장 제어 흐름**을 우선한다. `track`은 리스트 성능에 중요하다.

---

## 3. input / output

```ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <p>{{ name() }}</p>
    <button type="button" (click)="select.emit(name())">선택</button>
  `,
})
export class UserCardComponent {
  name = input.required<string>();
  select = output<string>();
}
```

시그널 기반 `input()`/`output()`이 최신 기본선이다. 데코레이터 `@Input`도 혼재할 수 있다.

---

## 4. 주의

- 템플릿에 무거운 로직·구독 남발 금지
- XSS: `[innerHTML]`는 살균 후에만
- `ChangeDetectionStrategy.OnPush`는 시그널/불변 업데이트와 잘 맞는다

---

## 정리

템플릿은 뷰의 계약이다. **표시는 바인딩, 분기는 @if/@for, 소통은 input/output**으로 좁힌다.

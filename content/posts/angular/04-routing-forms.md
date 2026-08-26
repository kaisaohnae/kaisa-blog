---
slug: angular-04
order: 4
category: angular
categoryLabel: Angular
title: "라우팅과 리액티브 폼"
summary: "provideRouter, lazy 로드, 가드와 FormBuilder·validators로 화면 전환과 입력 검증을 구성하는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["angular"]
---

# 라우팅과 리액티브 폼

> 요약: provideRouter, lazy 로드, 가드와 FormBuilder·validators로 화면 전환과 입력 검증을 구성하는 방법을 정리한다.

---

## 1. 라우트

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.HomeComponent) },
  {
    path: 'posts/:id',
    loadComponent: () => import('./post/post').then((m) => m.PostComponent),
  },
  { path: '**', redirectTo: '' },
];
```

- `loadComponent`로 코드 스플리팅
- `RouterLink` / `routerLinkActive`
- 파라미터는 `inputBinding` 또는 `ActivatedRoute`

---

## 2. 가드

```ts
export const authGuard = () => {
  const auth = inject(AuthService);
  return auth.user() ? true : createUrlTreeFromSnapshot(/* … */);
};
```

`CanActivateFn`으로 로그인·권한을 막는다. 가드에서 무거운 API는 피한다.

---

## 3. 리액티브 폼

```ts
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

readonly form = inject(FormBuilder).nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  agree: [false, Validators.requiredTrue],
});
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input type="email" formControlName="email" />
</form>
```

템플릿 주도 폼(`ngModel`)은 작은 폼에, **복잡한 검증·동적 필드는 Reactive Forms**.

---

## 4. 접근성

- `label` + `id`
- 에러 메시지를 `aria-describedby`로 연결
- 제출 버튼 disabled와 메시지 병행

---

## 정리

URL은 라우터가, 입력은 폼 모델이 책임진다. **lazy 라우트 + 가드 + reactive form**이 SPA 실무 기본 세트다.

---
slug: angular-01
order: 1
category: angular
categoryLabel: Angular
title: "Angular 스탠드얼론으로 프로젝트 시작하기"
summary: "NgModule 없이 standalone 컴포넌트·라우팅 기준으로 Angular 프로젝트를 세팅하고 기본 구조를 정리한다."
publishedAt: 2026-08-26
tags: ["angular"]
---

# Angular 스탠드얼론으로 프로젝트 시작하기

> 요약: NgModule 없이 standalone 컴포넌트·라우팅 기준으로 Angular 프로젝트를 세팅하고 기본 구조를 정리한다.

---

## 1. 왜 지금 Angular인가

Angular는 **프레임워크가 라우팅·DI·폼·빌드를 한 세트로** 제공하는 쪽에 가깝다.

신규 기본선은 **standalone API**다. NgModule은 레거시·라이브러리 경계에서 만날 수 있다.

| 항목 | 예전 | 지금 |
|------|------|------|
| 부트스트랩 | `NgModule` | `bootstrapApplication` |
| 컴포넌트 | `declarations` | `standalone: true` |
| 의존성 | `imports` in module | 컴포넌트 `imports` |

---

## 2. 생성

```bash
npm install -g @angular/cli
ng new my-app --standalone
cd my-app
ng serve
```

권장: TypeScript strict, 라우팅 포함.

---

## 3. 최소 컴포넌트

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<h1>{{ title }}</h1>`,
})
export class HomeComponent {
  title = 'Home';
}
```

`ng new` 최신 템플릿은 이미 standalone가 기본인 경우가 많다. 버전 노트를 확인한다.

---

## 4. 디렉터리 감각

```
src/app/
├── app.config.ts
├── app.routes.ts
├── app.ts          # 루트
└── home/
    └── home.ts
```

기능별로 폴더를 나누고, 공유 UI는 `shared/`로 모은다.

---

## 정리

Angular 시작은 모듈 미로가 아니라 **standalone 컴포넌트 + `app.config.ts`** 한 줄로 고정한다.

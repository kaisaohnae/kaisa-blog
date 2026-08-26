---
slug: angular-03
order: 3
category: angular
categoryLabel: Angular
title: "시그널·서비스·의존성 주입"
summary: "signal/computed/effect와 providedIn 서비스로 상태와 의존성을 다루는 Angular의 핵심 패턴을 정리한다."
publishedAt: 2026-08-26
tags: ["angular"]
---

# 시그널·서비스·의존성 주입

> 요약: signal/computed/effect와 providedIn 서비스로 상태와 의존성을 다루는 Angular의 핵심 패턴을 정리한다.

---

## 1. 시그널

```ts
import { signal, computed, effect } from '@angular/core';

const count = signal(0);
const double = computed(() => count() * 2);

effect(() => {
  console.log('count', count());
});

count.update((n) => n + 1);
```

- `signal`: 쓰기 가능한 상태
- `computed`: 파생 값
- `effect`: 구독 기반 부수 효과 (남용 주의)

Zone 기반 변경 감지와 함께 쓰이며, 점진적으로 시그널 중심 UI가 늘고 있다.

---

## 2. 서비스 + DI

```ts
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<string | null>(null);

  login(name: string) {
    this.user.set(name);
  }
}
```

컴포넌트에서:

```ts
private readonly auth = inject(AuthService);
```

생성자 주입도 가능하지만 `inject()`가 짧다.

---

## 3. 제공 범위

| 범위 | 언제 |
|------|------|
| `providedIn: 'root'` | 앱 전역 싱글톤 |
| 컴포넌트 `providers` | 해당 트리만 |
| 라우트 `providers` | 기능 모듈 대체 |

테스트에서는 구현을 mock으로 갈아끼우기 쉽다.

---

## 4. HTTP

`provideHttpClient()`를 `app.config.ts`에 넣고, 서비스에서 `HttpClient`를 주입한다.  
구독은 `async` 파이프 또는 시그널로 모아 누수를 줄인다.

---

## 정리

상태는 **시그널**, 공유 로직은 **서비스**, 연결은 **DI** — 이 세 층이 Angular의 뼈대다.

---
slug: nextjs-07
order: 7
category: nextjs
categoryLabel: Next.js
title: "Route Handler와 Server Actions"
summary: "앱 내 API(Route Handler)와 폼용 Server Actions의 역할·제약·정적 export와의 관계를 정리한다."
publishedAt: 2026-08-26
tags: ["nextjs"]
---

# Route Handler와 Server Actions

> 요약: 앱 내 API(Route Handler)와 폼용 Server Actions의 역할·제약·정적 export와의 관계를 정리한다.

---

## 1. Route Handler

```ts
// app/api/hello/route.ts
import {NextResponse} from 'next/server';

export async function GET() {
  return NextResponse.json({ok: true});
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({received: body});
}
```

용도: 웹훅, 외부 클라이언트 API, 서버 전용 프록시.

`output: 'export'`에서는 **지원이 제한**된다. 정적 호스팅이면 백엔드를 별도(Cafe24 API 등)로 두는 편이 흔하다.

---

## 2. Server Actions

```tsx
// app/contact/actions.ts
'use server';

export async function sendMessage(formData: FormData) {
  const email = String(formData.get('email') || '');
  // DB / 메일 발송
  return {ok: true};
}
```

```tsx
import {sendMessage} from './actions';

export default function ContactForm() {
  return (
    <form action={sendMessage}>
      <input name="email" type="email" required />
      <button type="submit">보내기</button>
    </form>
  );
}
```

폼·뮤테이션에 적합. 네트워크 왕복을 줄이고 progressive enhancement에 가깝다.

---

## 3. 언제 무엇을

| 상황 | 선택 |
|------|------|
| 외부 앱이 호출 | Route Handler / 별도 API |
| 같은 Next 앱 폼 | Server Action |
| 순수 정적 사이트 | 외부 API + 클라이언트 또는 빌드 타임만 |

---

## 4. 보안

- Action·Handler 모두 **입력 검증**
- 쿠키·세션 확인
- CSRF: Server Actions는 프레임워크 보호가 있으나 팀 정책 확인
- 시크릿은 서버에만

```ts
import {z} from 'zod';
const schema = z.object({email: z.string().email()});
```

---

## 5. 재검증

```ts
'use server';
import {revalidatePath} from 'next/cache';

export async function updatePost(id: string) {
  // ...
  revalidatePath(`/posts/${id}`);
}
```

정적 export 환경에서는 런타임 재검증이 어렵다. 배포 파이프라인으로 다시 빌드한다.

---

## 연습

1. `POST /api/echo` Route Handler를 만든다 (Node 런타임 호스팅에서).
2. 간단한 Server Action 폼을 만든다.
3. 현재 배포가 export면 “Next API 없이” 설계도를 그린다.

---
slug: laravel-09
order: 9
category: laravel
categoryLabel: Laravel
title: "Blade·Livewire·Inertia와 API 프론트 전략"
summary: "서버 렌더(Blade/Livewire) vs Inertia vs 순수 API+SPA를 상황별로 선택하고, 각각의 Laravel다운 패턴을 익힌다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# Blade·Livewire·Inertia와 API 프론트 전략

> 요약: 서버 렌더(Blade/Livewire) vs Inertia vs 순수 API+SPA를 상황별로 선택하고, 각각의 Laravel다운 패턴을 익힌다.

---

---

## 1. 선택 가이드

| 상황 | 추천 |
|------|------|
| 관리자·내부툴·폼 많음 | **Filament** 또는 Blade/Livewire |
| 전통 멀티페이지, SEO 중요 | Blade (+ 점진적 JS) |
| SPA UX + Laravel 라우팅/검증 유지 | **Inertia** (Vue/React/Svelte) |
| 모바일 앱 + 웹 분리 | **API (Sanctum) + 별도 프론트** |
| 실시간 위젯·부분 갱신 | Livewire / Echo+Broadcast |

“전부 React”가 기본값은 아니다. 팀과 제품 성격이 먼저다.

---

## 2. Blade 핵심

```blade
{{-- resources/views/posts/show.blade.php --}}
<x-app-layout>
    <x-slot:title>{{ $post->title }}</x-slot:title>

    <article>
        <h1>{{ $post->title }}</h1>
        <p class="meta">{{ $post->user->name }} · {{ $post->published_at?->diffForHumans() }}</p>
        <div>{!! $post->rendered_body !!}</div>
    </article>

    @can('update', $post)
        <a href="{{ route('posts.edit', $post) }}">수정</a>
    @endcan
</x-app-layout>
```

### 컴포넌트

```bash
php artisan make:component Alert
```

```blade
<x-alert type="success" :message="session('status')" />
```

### 레이아웃 / 슬롯 / `@csrf` / `@method('PUT')`

XSS: `{{ $var }}`는 이스케이프, `{!! !!}`는 신뢰된 HTML만.

---

## 3. Vite 자산 파이프라인

```blade
@vite(['resources/css/app.css', 'resources/js/app.js'])
```

```bash
npm install
npm run dev
npm run build
```

Laravel 모던 프론트의 기본은 **Vite**. Mix는 레거시.

---

## 4. Livewire (서버 중심 반응형)

```bash
composer require livewire/livewire
php artisan make:livewire PostSearch
```

```php
class PostSearch extends Component
{
    public string $q = '';

    public function render()
    {
        return view('livewire.post-search', [
            'posts' => Post::query()
                ->when($this->q, fn ($q) => $q->where('title', 'like', "%{$this->q}%"))
                ->latest()
                ->paginate(10),
        ]);
    }
}
```

```blade
<div>
    <input wire:model.live.debounce.300ms="q" />
    @foreach ($posts as $post)
        <div wire:key="post-{{ $post->id }}">{{ $post->title }}</div>
    @endforeach
    {{ $posts->links() }}
</div>
```

적합: CRUD 관리 화면, 필터, 위자드.  
부적합: 오프라인 앱, 극단적 클라이언트 인터랙션.

Livewire 3의 `wire:model.live`, islands, Volt 문법도 팀 스타일에 맞게 검토.

---

## 5. Inertia

```bash
php artisan breeze:install vue   # 또는 react
```

컨트롤러는 JSON이 아니라 **Inertia 응답**:

```php
return Inertia::render('Posts/Show', [
    'post' => new PostResource($post),
]);
```

프론트 페이지 컴포넌트가 props를 받아 렌더.  
라우팅·인증·검증은 Laravel이 담당 → “백엔드 분리 비용” 없이 SPA UX.

폼:

```js
import { useForm } from '@inertiajs/vue3'

const form = useForm({ title: '', body: '' })
form.post('/posts')
```

검증 에러가 자동으로 공유 props로 전달된다.

---

## 6. 순수 API + SPA/모바일

Validation·Resource·Sanctum 패턴:

- Form Request
- API Resource
- Sanctum
- OpenAPI (scribe / scramble 패키지)

프론트는 Next.js, Nuxt 등 무엇이든.  
CORS·쿠키 도메인·버전닝(`/api/v1`)을 계약으로 문서화.

---

## 7. 실시간 — Broadcasting / Echo / Reverb

```bash
composer require laravel/reverb
php artisan reverb:install
```

```php
broadcast(new OrderStatusUpdated($order))->toOthers();
```

프론트: Laravel Echo + Pusher 프로토콜.  
알림 벨, 채팅, 대시보드 라이브 갱신에 사용.

---

## 8. Filament (관리자)

빠른 어드민:

```bash
composer require filament/filament
php artisan filament:install --panels
```

리소스 기반으로 CRUD·필터·권한을 빠르게.  
고객용 UI와 관리자 UI를 분리할 때 생산성이 크다.

---

## 9. 실무 조합 예시

1. **마케팅 사이트**: Blade + Vite
2. **SaaS 앱**: Inertia + Breeze/Fortify + Policy
3. **내부 어드민**: Filament
4. **모바일**: Sanctum API
5. **일부 위젯**: Livewire 또는 Echo

한 제품 안에 여러 전략이 공존해도 된다. 경계를 명확히.

---

## 연습

1. Blade 컴포넌트로 flash alert를 만든다.
2. Livewire 검색 리스트를 구현한다 **또는** Inertia 페이지 하나를 연결한다.
3. API Resource와 Inertia props 중 하나로 게시글 상세를 내려준다.
4. (선택) Reverb로 간단 알림 이벤트를 방송한다.

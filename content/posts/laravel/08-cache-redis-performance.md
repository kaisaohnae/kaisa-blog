---
slug: laravel-08
order: 8
category: laravel
categoryLabel: Laravel
title: "캐시·Redis·성능 최적화"
summary: "캐시 전략, Redis, 쿼리/응답 최적화를 측정 기반으로 적용한다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# 캐시·Redis·성능 최적화

> 요약: 캐시 전략, Redis, 쿼리/응답 최적화를 측정 기반으로 적용한다.

---

---

## 1. 최적화 순서

1. 느린 쿼리 / N+1 제거
2. 불필요 작업 큐로 이동
3. 캐시
4. HTTP 캐시·CDN
5. Octane / 스케일 아웃

감으로 `Cache::remember`를 Everywhere 하면 무효화 지옥이 된다.

---

## 2. 캐시 드라이버

```env
CACHE_STORE=redis
REDIS_CLIENT=phpredis
```

| 드라이버 | 용도 |
|----------|------|
| `array` | 요청 단위(테스트) |
| `database` | 소규모·단일 서버 |
| `file` | 간단 로컬 |
| `redis` | **실무 기본 추천** |
| `memcached` | 대안 |

---

## 3. 기본 API

```php
$value = Cache::remember("posts.{$id}", now()->addMinutes(10), function () use ($id) {
    return Post::with('user')->findOrFail($id);
});

Cache::put('key', $value, 600);
Cache::forever('key', $value);
Cache::forget('posts.'.$id);
Cache::flush(); // 위험 — 운영에서 신중
```

태그 (Redis/Memcached):

```php
Cache::tags(['posts', 'user:'.$userId])->put($key, $value, 600);
Cache::tags(['posts'])->flush();
```

---

## 4. 모델 / 라우트 캐시

```php
$posts = Cache::remember('posts.published.page.'.$page, 60, fn () =>
    Post::published()->with('user')->paginate(20, page: $page)
);
```

갱신 시:

```php
public function updated(Post $post): void
{
    Cache::forget('posts.'.$post->id);
    Cache::tags(['posts'])->flush();
}
```

Observer와 함께 무효화 지점을 한곳으로.

### 프레임워크 캐시 (운영)

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

배포 파이프라인에 포함. 로컬에서 route cache 켜 둔 채 개발하면 혼란.

---

## 5. HTTP 조건부 캐시

```php
return response($content)
    ->header('Cache-Control', 'public, max-age=60')
    ->setEtag(md5($content));
```

CDN 앞단과 조합. **개인화 응답**에 `public` 캐시 금지.

---

## 6. Redis 활용 범위

- Cache
- Session
- Queue
- Rate limiting
- Atomic lock
- Pub/Sub (브로드캐스트)

```php
$lock = Cache::lock('order:'.$orderId, 10);

if ($lock->get()) {
    try {
        // 임계 구역
    } finally {
        $lock->release();
    }
}
```

재고 차감 등 경쟁 조건에 사용. 분산 락도 만능은 아니니 DB 제약과 함께.

---

## 7. 쿼리 성능

- `preventLazyLoading`으로 N+1 차단
- `select` 최소화
- 인덱스 + `EXPLAIN`
- `withCount` / 서브쿼리 남용 주의
- 대량: `chunkById`, `lazyById`, `upsert`
- `toBase()` / 커서

Debugbar, Telescope(로컬), `clockwork` 등으로 요청당 쿼리 수 감시.

---

## 8. Eager loading 한계 극복

```php
Post::with([
    'user:id,name',
    'tags:id,name',
])->get();
```

조건부:

```php
Post::with(['comments' => fn ($q) => $q->latest()->limit(5)])->get();
```

---

## 9. Octane (선택)

```bash
composer require laravel/octane
php artisan octane:install
php artisan octane:start
```

Swoole/RoadRunner로 앱을 메모리에 상주 → 기동 비용 제거.

주의:

- 요청 간 상태 오염 (static, 싱글톤에 요청 데이터)
- `Octane::tick`, 리스너로 정리
- 배포/리로드 전략 필요

트래픽이 크고 CPU가 요청 부트에 쓰일 때 이득.

---

## 10. 측정

- Telescope (local/staging)
- Debugbar (local)
- APM: New Relic, Datadog, OpenTelemetry
- `php artisan about`

p95 지연, 쿼리 수, Redis hit ratio, 큐 wait time을 같이 본다.

---

## 연습

1. 게시글 상세를 `Cache::remember` + 수정 시 `forget`으로 구성한다.
2. Redis lock으로 중복 결제 요청을 막는다.
3. `route:cache` / `config:cache`를 스테이징에서 검증한다.
4. 목록 API 쿼리 수를 `with` 전후로 비교한다.

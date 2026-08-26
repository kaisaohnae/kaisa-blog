---
slug: laravel-02
order: 2
category: laravel
categoryLabel: Laravel
title: "라우팅·미들웨어·컨트롤러 — 요청 생명주기"
summary: "요청이 라우트 → 미들웨어 → 컨트롤러로 흐르는 구조를 이해하고, 리소스·단일 액션·미들웨어 그룹을 실무처럼 쓴다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# 라우팅·미들웨어·컨트롤러 — 요청 생명주기

> 요약: 요청이 라우트 → 미들웨어 → 컨트롤러로 흐르는 구조를 이해하고, 리소스·단일 액션·미들웨어 그룹을 실무처럼 쓴다.

---

---

## 1. 요청 생명주기 (요약)

1. `public/index.php`
2. 컨테이너 / HTTP 커널(부트스트랩)
3. 글로벌·라우트 미들웨어
4. 라우트 매칭
5. 컨트롤러 / Closure
6. 응답 (View, JSON, Redirect, Stream…)

컨트롤러는 **얇게**, 비즈니스는 Action/Service로 빼는 편이 유지보수에 유리하다.

---

## 2. 라우트 기본

```php
Route::get('/posts', [PostController::class, 'index']);
Route::post('/posts', [PostController::class, 'store']);
Route::get('/posts/{post}', [PostController::class, 'show']);
```

### 라우트 파라미터 & 바인딩

```php
Route::get('/posts/{post:slug}', [PostController::class, 'show']);
```

Eloquent 모델이면 기본적으로 `{post}` → `Post::findOrFail($id)`.  
커스텀 키는 `getRouteKeyName()` 또는 `{post:slug}`.

### 리소스 라우트

```php
Route::resource('posts', PostController::class);
Route::apiResource('posts', PostController::class); // create/edit 뷰 제외
```

```bash
php artisan route:list --path=posts
```

---

## 3. 라우트 그룹

```php
Route::middleware(['auth', 'verified'])
    ->prefix('dashboard')
    ->name('dashboard.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('home');
        Route::resource('posts', PostController::class);
    });
```

API:

```php
Route::middleware('auth:sanctum')
    ->prefix('api/v1')
    ->group(base_path('routes/api.php'));
```

버전은 URL(`/api/v1`)로 시작하는 팀이 많다.

---

## 4. 컨트롤러 스타일

### 리소스 컨트롤러

```php
class PostController extends Controller
{
    public function index() { ... }
    public function store(StorePostRequest $request) { ... }
    public function show(Post $post) { ... }
    public function update(UpdatePostRequest $request, Post $post) { ... }
    public function destroy(Post $post) { ... }
}
```

### Invokable (단일 액션) — 추천 패턴

```php
// php artisan make:controller PublishPostController --invokable
class PublishPostController extends Controller
{
    public function __invoke(Post $post)
    {
        $post->publish();
        return redirect()->route('posts.show', $post);
    }
}

Route::post('/posts/{post}/publish', PublishPostController::class);
```

유스케이스가 분명한 엔드포인트는 invokable이 가독성이 좋다.

### 생성자 주입

```php
class PostController extends Controller
{
    public function __construct(
        private readonly PostService $posts,
    ) {}
}
```

---

## 5. 미들웨어

Laravel 내장 예: `auth`, `guest`, `throttle`, `verified`, `can`.

커스텀:

```bash
php artisan make:middleware EnsureUserIsAdmin
```

```php
public function handle(Request $request, Closure $next): Response
{
    if (! $request->user()?->isAdmin()) {
        abort(403);
    }
    return $next($request);
}
```

등록 (Laravel 11+):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
    ]);
})
```

```php
Route::middleware('admin')->group(...);
```

### throttle (Rate limit)

```php
Route::middleware('throttle:60,1')->group(...);
// 또는
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});
```

로그인·결제 API는 더 빡세게.

---

## 6. 응답 유형

```php
return view('posts.show', compact('post'));
return response()->json(['data' => $post], 201);
return redirect()->route('posts.index')->with('status', 'created');
return back()->withErrors([...]);
return to_route('posts.show', $post);
return response()->streamDownload(...);
```

API는 상태코드와 본문 계약을 명확히 (API Resource 문서와 함께).

---

## 7. CSRF (web)

Blade 폼:

```html
<form method="POST" action="/posts">
    @csrf
    ...
</form>
```

SPA/API는 Sanctum SPA cookie 또는 토큰 방식을 사용하고, `web` 미들웨어 그룹의 CSRF 규칙을 이해해야 한다.

---

## 8. 예외·abort

```php
abort(404);
abort(403, '권한 없음');
throw ValidationException::withMessages(['email' => '이미 사용 중']);
```

`bootstrap/app.php`의 `withExceptions`에서 JSON/API 에러 포맷을 통일할 수 있다.

```php
$exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
    return $request->is('api/*') || $request->expectsJson();
});
```

---

## 9. 실무 팁

- `route:list`로 충돌·중복 확인
- 이름 있는 라우트(`->name()`)만 링크에 사용 — URL 하드코딩 금지
- 컨트롤러에 쿼리·트랜잭션 장문 금지 → Service/Action
- `Route::fallback`으로 SPA/404 처리

---

## 연습

1. `apiResource('posts')`와 `route:list`를 확인한다.
2. `PublishPostController` invokable을 만든다.
3. `admin` 미들웨어로 삭제 API를 보호한다.
4. `throttle:10,1`을 로그인 시도 라우트에 건다.

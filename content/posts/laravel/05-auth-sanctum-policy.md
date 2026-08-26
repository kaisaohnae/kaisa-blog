---
slug: laravel-05
order: 5
category: laravel
categoryLabel: Laravel
title: "인증·인가 — Sanctum, Policy, Gate"
summary: "세션/토큰 인증을 상황에 맞게 고르고, Policy 기반 인가로 리소스 권한을 명확히 한다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# 인증·인가 — Sanctum, Policy, Gate

> 요약: 세션/토큰 인증을 상황에 맞게 고르고, Policy 기반 인가로 리소스 권한을 명확히 한다.

---

---

## 1. 인증 vs 인가

- **인증(Authentication)**: 누구인가
- **인가(Authorization)**: 무엇을 할 수 있는가

Laravel은 인증 스캐폴딩 + Gate/Policy 인가가 강점이다.

---

## 2. 무엇을 설치할까

| 상황 | 추천 |
|------|------|
| Blade 모노리스 | Breeze (Blade) / Fortify |
| SPA (Vue/React) + 같은 도메인 | Breeze + Sanctum (쿠키) |
| 모바일/외부 API | Sanctum Personal Access Token |
| 풀옵션 팀 기능 | Jetstream |
| 관리자 패널 | Filament (별도 가드) |

일반적인 API: **Sanctum**이 가장 무난하다. Passport는 OAuth2 풀스펙이 필요할 때.

```bash
composer require laravel/sanctum
php artisan install:api   # Laravel 버전에 따라
# 또는 breeze
composer require laravel/breeze --dev
php artisan breeze:install
```

---

## 3. 세션 기반 (웹)

```php
public function store(LoginRequest $request)
{
    if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
        throw ValidationException::withMessages([
            'email' => '자격 증명이 올바르지 않습니다.',
        ]);
    }
    $request->session()->regenerate();
    return redirect()->intended('/dashboard');
}
```

로그아웃 시 `invalidate` + `regenerateToken`으로 세션 고정 공격 완화.

비밀번호:

```php
'password' => ['required', 'confirmed', Password::defaults()],
```

`AppServiceProvider`에서 `Password::defaults()` 정책을 강화한다.

---

## 4. Sanctum 토큰 API

```php
// 로그인
$user = User::where('email', $request->email)->first();

if (! $user || ! Hash::check($request->password, $user->password)) {
    throw ValidationException::withMessages(['email' => 'Invalid credentials']);
}

$token = $user->createToken('mobile', ['posts:read', 'posts:write'])->plainTextToken;

return ['token' => $token];
```

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('posts', PostController::class);
    Route::get('/me', fn (Request $r) => new UserResource($r->user()));
});
```

클라이언트: `Authorization: Bearer {token}`

토큰 abilities:

```php
if ($request->user()->tokenCan('posts:write')) { ... }
```

로그아웃/철회:

```php
$request->user()->currentAccessToken()->delete();
```

---

## 5. SPA 인증 (쿠키 + CSRF)

Sanctum SPA 방식:

1. 프론트와 API가 공유 가능한 도메인/서브도메인
2. `/sanctum/csrf-cookie` 선호출
3. 로그인 후 쿠키 세션으로 `auth:sanctum`

CORS·`SANCTUM_STATEFUL_DOMAINS`·`SESSION_DOMAIN` 설정이 핵심이다.  
토큰을 localStorage에 두는 방식보다 **HttpOnly 쿠키 세션**이 XSS에 유리한 경우가 많다.

---

## 6. Gate와 Policy

```bash
php artisan make:policy PostPolicy --model=Post
```

```php
class PostPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(?User $user, Post $post): bool
    {
        return $post->isPublished() || $user?->id === $post->user_id;
    }

    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->isAdmin();
    }

    public function delete(User $user, Post $post): bool
    {
        return $this->update($user, $post);
    }
}
```

컨트롤러:

```php
$this->authorize('update', $post);
// 또는
Gate::authorize('update', $post);
```

라우트:

```php
Route::put('/posts/{post}', ...)->middleware('can:update,post');
```

Blade:

```blade
@can('update', $post)
    <a href="...">수정</a>
@endcan
```

Form Request `authorize()`와 Policy를 맞춰 두면 구멍이 줄어든다.

---

## 7. 역할·권한 패키지

복잡하면 Spatie Laravel Permission:

- `role`: admin, editor
- `permission`: posts.publish
- 팀/가드 단위 분리 가능

처음부터 역할만 문자열로 `if ($user->role === 'admin')` 난립하면 나중에 고통스럽다.  
Policy 안에서 role/permission을 읽게 중앙화하자.

---

## 8. 보안 체크리스트

- [ ] `APP_DEBUG=false` (운영)
- [ ] HTTPS, Secure/HttpOnly/SameSite 쿠키
- [ ] 로그인 throttle
- [ ] 비밀번호 해시(bcrypt/argon2) — 직접 해시 금지, `Hash` 파사드
- [ ] Mass assignment / IDOR: Policy로 소유권 검사
- [ ] 이메일 인증·비밀번호 재설정 토큰 만료
- [ ] 관리자 경로 추가 보호

---

## 연습

1. Sanctum으로 로그인/토큰 발급/보호 API를 만든다.
2. `PostPolicy`로 본인 글만 수정·삭제 가능하게 한다.
3. 로그인 라우트에 `throttle`을 건다.
4. `/me` Resource 응답을 구현한다.

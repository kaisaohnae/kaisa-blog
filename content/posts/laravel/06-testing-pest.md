---
slug: laravel-06
order: 6
category: laravel
categoryLabel: Laravel
title: "테스트 — PHPUnit, Pest, Feature 테스트"
summary: "Feature/Unit 테스트로 API·인가·DB 동작을 고정하고, Pest 스타일의 가독성 있는 테스트를 익힌다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# 테스트 — PHPUnit, Pest, Feature 테스트

> 요약: Feature/Unit 테스트로 API·인가·DB 동작을 고정하고, Pest 스타일의 가독성 있는 테스트를 익힌다.

---

---

## 1. Laravel 테스트 종류

| 종류 | 용도 |
|------|------|
| Unit | 순수 로직, 컨테이너 최소 |
| Feature | HTTP + DB + 인증 등 통합에 가깝게 |
| Browser (Dusk) | 실제 브라우저 E2E — 핵심만 |

기본은 **Feature 테스트로 유스케이스를 잠그고**, 복잡한 도메인만 Unit으로 뺀다.

```bash
php artisan make:test PostApiTest
php artisan make:test PostServiceTest --unit
php artisan test
# Pest
./vendor/bin/pest
```

---

## 2. Pest — 사실상 현대 Laravel 기본 감성

```bash
composer require pestphp/pest --dev
composer require pestphp/pest-plugin-laravel --dev
php artisan pest:install
```

```php
use App\Models\User;
use App\Models\Post;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

it('lists published posts', function () {
    Post::factory()->published()->count(3)->create();
    Post::factory()->count(2)->create(); // draft

    getJson('/api/posts')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

it('forbids updating others posts', function () {
    $author = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->for($author)->create();

    actingAs($other)
        ->putJson("/api/posts/{$post->id}", ['title' => 'Hack'])
        ->assertForbidden();
});
```

PHPUnit 스타일도 여전히 완벽히 지원된다. 팀 합의만 맞으면 된다.

---

## 3. HTTP 断言 핵심

```php
$response->assertOk();
$response->assertCreated();
$response->assertNoContent();
$response->assertUnauthorized();
$response->assertForbidden();
$response->assertUnprocessable();
$response->assertJsonPath('data.email', 'a@b.com');
$response->assertJsonStructure(['data' => [['id', 'title']]]);
$response->assertJsonValidationErrors(['email']);
```

---

## 4. DB와 RefreshDatabase

```php
uses(RefreshDatabase::class);
```

매 테스트 후 마이그레이션 기반으로 깔끔한 DB.  
느리면 `DatabaseTransactions` 또는 parallel testing 검토.

```bash
php artisan test --parallel
```

Factory를 테스트의 기본 데이터 소스로 쓴다. 손으로 `insert` 나열하지 않기.

---

## 5. 인증 헬퍼

```php
actingAs($user);
actingAs($user, 'sanctum');
```

Sanctum 토큰:

```php
$token = $user->createToken('test')->plainTextToken;

$this->withToken($token)->getJson('/api/me')->assertOk();
```

---

## 6. 가짜 시간·이벤트·큐·알림

```php
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Carbon;

it('publishes with timestamp', function () {
    Carbon::setTestNow('2026-01-01 12:00:00');
    // ...
});

Event::fake([PostPublished::class]);
Queue::fake();
Notification::fake();

// 실행 후
Event::assertDispatched(PostPublished::class);
Queue::assertPushed(SendWelcomeEmail::class);
Notification::assertSentTo($user, WelcomeNotification::class);
```

외부 HTTP: `Http::fake()`.

```php
Http::fake([
    'pay.example.com/*' => Http::response(['ok' => true], 200),
]);
```

---

## 7. 정책·미들웨어 테스트

인가를 Feature로 고정:

- guest → 401
- 다른 유저 → 403
- 소유자 → 200
- admin → 200

한 번씩만 있어도 보안 회귀를 막는다.

---

## 8. 테스트용 환경

`phpunit.xml` / `Pest.php`:

- `APP_ENV=testing`
- SQLite `:memory:` 또는 테스트 DB
- `MAIL_MAILER=array`
- `QUEUE_CONNECTION=sync` (또는 fake)

`.env.testing`를 두는 팀도 있다.

---

## 9. 좋은 테스트 습관

- 테스트 이름 = 행동/비즈니스 문장
- Arrange–Act–Assert
- 한 테스트에 과도한 시나리오 금지
- 구현 세부(private 메서드)보다 **관찰 가능한 행동** 검증
- flaky(순서 의존, 시간 의존) 제거

---

## 연습

1. 게시글 생성 성공/검증 실패 Feature 테스트를 작성한다.
2. Policy 403 시나리오를 고정한다.
3. `Http::fake`로 외부 결제 클라이언트를 테스트한다.
4. `Queue::fake`로 환영 메일 Job이 쌓이는지 확인한다.

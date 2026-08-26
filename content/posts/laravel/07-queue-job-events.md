---
slug: laravel-07
order: 7
category: laravel
categoryLabel: Laravel
title: "큐·Job·이벤트·스케줄링"
summary: "무거운 작업을 큐로 분리하고, 이벤트/리스너·스케줄러·실패 처리까지 운영 가능하게 구성한다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# 큐·Job·이벤트·스케줄링

> 요약: 무거운 작업을 큐로 분리하고, 이벤트/리스너·스케줄러·실패 처리까지 운영 가능하게 구성한다.

---

---

## 1. 왜 큐인가

요청 안에서 하지 말 것:

- 메일/SMS
- 이미지 리사이즈
- 외부 API 연쇄 호출
- 대량 CSV 내보내기

요청은 빠르게 끝내고, **Job으로 비동기** 처리한다.

```env
QUEUE_CONNECTION=database
# 운영 권장: redis
```

```bash
php artisan queue:table
php artisan queue:failed-table
php artisan migrate
php artisan queue:work
```

---

## 2. Job 만들기

```bash
php artisan make:job SendWelcomeEmail
```

```php
class SendWelcomeEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public User $user,
    ) {}

    public int $tries = 3;
    public int $backoff = 10; // seconds

    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->user)->send(new WelcomeMail($this->user));
    }

    public function failed(?Throwable $e): void
    {
        logger()->error('welcome mail failed', [
            'user_id' => $this->user->id,
            'error' => $e?->getMessage(),
        ]);
    }
}
```

```php
SendWelcomeEmail::dispatch($user);
SendWelcomeEmail::dispatch($user)->delay(now()->addMinutes(5));
SendWelcomeEmail::dispatch($user)->onQueue('mail');
```

모델은 `SerializesModels`로 id만 큐에 저장된다. 처리 시점에 다시 조회.

---

## 3. ShouldBeUnique / 멱등성

같은 사용자 환영 메일 중복 방지:

```php
class SendWelcomeEmail implements ShouldQueue, ShouldBeUnique
{
    public function uniqueId(): string
    {
        return (string) $this->user->id;
    }
}
```

결제·웹훅 처리는 **idempotency key** 테이블과 함께 설계한다.  
큐 재시도 = 최소 두 번 실행될 수 있다고 가정.

---

## 4. 이벤트 & 리스너

```bash
php artisan make:event OrderPlaced
php artisan make:listener SendOrderConfirmation --event=OrderPlaced
```

```php
event(new OrderPlaced($order));
// 또는
OrderPlaced::dispatch($order);
```

리스너를 `ShouldQueue`로 구현하면 이벤트 발행은 가볍고 후처리는 비동기.

도메인 사건 이름(`OrderPlaced`)으로 결합도를 낮추면 서비스가 비대해지는 것을 막을 수 있다.

---

## 5. 트랜잭션 이후 디스패치

```php
DB::transaction(function () use ($data) {
    $order = Order::create(...);
    DB::afterCommit(fn () => OrderPlaced::dispatch($order));
});
```

또는 Job/이벤트에 `AfterCommit` 구현:

```php
class SendWelcomeEmail implements ShouldQueue, ShouldDispatchAfterCommit
```

커밋 전 디스패치 → 워커가 아직 없는 row를 읽는 레이스가 난다.

---

## 6. Horizon (Redis 큐 운영)

```bash
composer require laravel/horizon
php artisan horizon:install
php artisan horizon
```

- 큐별 프로세스 수
- 대기 시간 모니터링
- 실패 Job UI
- 밸런싱 전략

운영에서 `queue:work`를 직접 감독하기보다 Supervisor + Horizon 조합이 흔하다.

---

## 7. 실패 처리

```bash
php artisan queue:failed
php artisan queue:retry all
php artisan queue:flush
```

```php
public function retryUntil(): DateTime
{
    return now()->addHour();
}
```

알림: 실패 시 Slack/이메일. Horizon 알림 또는 `failed()` 훅.

---

## 8. 스케줄링

`routes/console.php` (Laravel 11+):

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('reports:daily')->dailyAt('01:00');
Schedule::job(new PruneOldTokens)->hourly();
Schedule::call(fn () => Cache::forget('homepage'))->everyFiveMinutes();
```

서버 cron은 한 줄만:

```cron
* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1
```

`withoutOverlapping()`, `onOneServer()`, `runInBackground()`를 상황에 맞게.

---

## 9. 메일·알림

```bash
php artisan make:mail WelcomeMail --markdown=mail.welcome
php artisan make:notification InvoicePaid
```

```php
$user->notify(new InvoicePaid($invoice));
```

채널: mail, database, broadcast, slack.  
로컬은 Mailpit/Log 드라이버.

---

## 10. 실무 팁

- 큐 payload에 큰 파일/HTML 넣지 않기
- 타임아웃(`$timeout`) 명시
- 우선순위 큐 분리 (`mail`, `default`, `high`)
- 로컬: `queue:listen` / Sail
- 테스트: `Queue::fake()` + 핵심 경로 1~2개는 실제 sync로도

---

## 연습

1. 회원가입 후 `SendWelcomeEmail` Job을 afterCommit으로 보낸다.
2. `OrderPlaced` 이벤트 + 큐 리스너를 만든다.
3. 실패를 강제하고 `queue:failed`를 확인한다.
4. 매일 자정에 임시 파일 정리 스케줄을 등록한다.

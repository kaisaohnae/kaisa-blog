---
slug: laravel-01
order: 1
category: laravel
categoryLabel: Laravel
title: "Laravel 11+와 PHP 시작하기"
summary: "Laravel 11/12 + PHP 8.2/8.3 기준으로 프로젝트를 세팅하고, 슬림해진 구조와 최신 관례를 이해한다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# Laravel 11+와 PHP 시작하기

> 요약: Laravel 11/12 + PHP 8.2/8.3 기준으로 프로젝트를 세팅하고, 슬림해진 구조와 최신 관례를 이해한다.

---

---

## 1. 왜 지금 Laravel인가

Laravel은 PHP 웹 앱의 사실상 표준에 가깝다. 최근 버전은 **골격은 얇게, 기능은 패키지로** 가는 방향이다.

| 항목 | Laravel 8~9 | Laravel 11+ |
|------|-------------|-------------|
| 기본 구조 | `Http/Kernel`, 다수 설정 파일 | **슬림 스켈레톤**, `bootstrap/app.php` 중심 |
| PHP | 8.0+ | **8.2+** (8.3 권장) |
| 라우트 | `RouteServiceProvider` | `bootstrap/app.php`에서 설정 |
| 미들웨어 | Kernel 등록 | `bootstrap/app.php` / 자동 발견 |
| 테스트 | PHPUnit 기본 | **Pest** 옵션이 매우 흔함 |

실무 기본선: **PHP 8.3 + Laravel 11/12 + Composer 2**.

---

## 2. 설치

```bash
composer create-project laravel/laravel demo
# 또는
laravel new demo

cd demo
cp .env.example .env
php artisan key:generate
php artisan serve
```

요구 사항: PHP, Composer, DB(SQLite/MySQL/PostgreSQL), Node(프론트 빌드 시).

로컬 올인원:

```bash
# Laravel Sail (Docker)
php artisan sail:install
./vendor/bin/sail up -d
```

---

## 3. Laravel 11+ 디렉터리 감각

```
app/
├── Http/Controllers/
├── Models/
├── Providers/          # 거의 AppServiceProvider만
└── ...
bootstrap/
├── app.php             # ★ 앱 구성의 중심
└── providers.php
config/                 # 필요한 것만 publish
database/
├── migrations/
├── seeders/
└── factories/
routes/
├── web.php
├── console.php
└── api.php             # 설치 방식에 따라 추가
resources/
├── views/
├── css/
└── js/
tests/
├── Feature/
└── Unit/
```

`bootstrap/app.php` 예시 개념:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

---

## 4. `.env`와 설정

```env
APP_NAME=Demo
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
# 또는 mysql/pgsql

CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
```

규칙:

- 시크릿은 `.env`만, **커밋 금지**
- 코드에서는 `config('app.name')` / `env()`는 **config 파일 안에서만**
- 환경별: `APP_ENV=production`이면 `APP_DEBUG=false` 필수

```bash
php artisan config:cache   # 운영
php artisan config:clear   # 로컬 변경 후
```

---

## 5. PHP 8.2+에서 특히 쓸 만한 문법

### readonly / constructor property promotion

```php
class CreateUserData
{
    public function __construct(
        public readonly string $email,
        public readonly string $name,
    ) {}
}
```

### Enum

```php
enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Cancelled = 'cancelled';
}
```

### Named arguments, match, nullsafe

```php
$statusLabel = match ($order->status) {
    OrderStatus::Pending => '대기',
    OrderStatus::Paid => '결제완료',
    OrderStatus::Cancelled => '취소',
};
```

Laravel의 **Form Request, DTO, Enum cast**와 잘 맞는다.

---

## 6. Artisan — 매일 쓰는 명령

```bash
php artisan list
php artisan make:model Post -mfs   # model + migration + factory + seeder
php artisan make:controller PostController --resource
php artisan migrate
php artisan route:list
php artisan tinker
```

`tinker`로 Eloquent/컨테이너를 바로 실험하는 습관이 학습 속도를 올린다.

---

## 7. 첫 라우트

```php
// routes/web.php
use Illuminate\Support\Facades\Route;

Route::get('/api/hello', function () {
    return response()->json(['message' => 'Hello, Laravel']);
});
```

```bash
curl http://127.0.0.1:8000/api/hello
```

---

## 8. 패키지 생태계

| 목적 | 대표 |
|------|------|
| 인증 UI | Breeze / Fortify / Jetstream |
| API 토큰 | Sanctum |
| 권한 | Policy / Gate (내장), Spatie Permission |
| 관리자 | Filament |
| 프론트 | Blade, Livewire, Inertia |
| 큐 모니터링 | Horizon |
| 고성능 | Octane |

처음부터 다 깔지 말고, API면 Sanctum, SPA면 Breeze+Inertia 식으로 고른다.

---

## 9. 최신 기법 체크리스트

- [ ] PHP 8.3 + Laravel 11/12
- [ ] `.env` / `config()` 규약 준수
- [ ] `bootstrap/app.php` 구조 이해
- [ ] Enum·readonly로 도메인 명확화
- [ ] Sail 또는 통일된 로컬 환경
- [ ] `/up` 헬스 엔드포인트 인지

---

## 연습

1. Laravel 프로젝트를 만들고 `/up`과 커스텀 JSON 라우트를 확인한다.
2. `.env`에서 SQLite ↔ MySQL/Postgres 중 하나로 DB를 연결한다.
3. `OrderStatus` Enum을 만들어 `tinker`에서 출력해 본다.
4. `php artisan route:list`로 등록된 라우트를 확인한다.

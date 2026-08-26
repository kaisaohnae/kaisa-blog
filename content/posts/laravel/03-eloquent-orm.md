---
slug: laravel-03
order: 3
category: laravel
categoryLabel: Laravel
title: "Eloquent ORM과 데이터베이스"
summary: "마이그레이션·Eloquent 관계·쿼리·트랜잭션을 올바르게 쓰고, N+1과 스키마 관리 함정을 피한다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# Eloquent ORM과 데이터베이스

> 요약: 마이그레이션·Eloquent 관계·쿼리·트랜잭션을 올바르게 쓰고, N+1과 스키마 관리 함정을 피한다.

---

---

## 1. 마이그레이션이 진실의 원천

```bash
php artisan make:model Post -m
```

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('body');
    $table->string('status')->default('draft'); // 또는 enum 컬럼
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
    $table->softDeletes();

    $table->index(['status', 'published_at']);
});
```

```bash
php artisan migrate
php artisan migrate:rollback
php artisan migrate:fresh --seed   # 로컬만
```

운영에서 `migrate:fresh` 금지. 팀과 CI는 **마이그레이션 파일 리뷰**를 필수화한다.

---

## 2. 모델 기본

```php
class Post extends Model
{
    use SoftDeletes;

    protected $fillable = ['title', 'slug', 'body', 'status', 'published_at'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'status' => OrderStatus::class, // 예: PostStatus Enum
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
```

주의:

- `$guarded = []` 전면 허용은 위험 — mass assignment 신중히
- 비즈니스 변경은 모델 메서드로 (`publish()`, `archive()`)
- Accessor/Mutator는 `Attribute::make` 사용

```php
protected function title(): Attribute
{
    return Attribute::make(
        set: fn (string $value) => trim($value),
    );
}
```

---

## 3. 관계 치트시트

| 관계 | 메서드 |
|------|--------|
| 1:1 | `hasOne` / `belongsTo` |
| 1:N | `hasMany` / `belongsTo` |
| N:N | `belongsToMany` |
| 다형 | `morphMany` / `morphTo` |
| hasManyThrough | 중간 테이블 경유 |

```php
$post->user;
$user->posts()->latest()->paginate(20);
$post->tags()->sync([1, 2, 3]);
```

---

## 4. 쿼리 빌더 / Eloquent 쿼리

```php
Post::query()
    ->where('status', PostStatus::Published)
    ->where('published_at', '<=', now())
    ->latest('published_at')
    ->paginate(20);

Post::query()
    ->when($search, fn ($q, $search) => $q->where('title', 'like', "%{$search}%"))
    ->get();
```

집계:

```php
User::withCount('posts')->get();
Post::where('user_id', $id)->sum('views');
```

---

## 5. N+1 문제

나쁜 예:

```php
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->user->name; // 매 루프 쿼리
}
```

좋은 예:

```php
$posts = Post::with('user', 'tags')->paginate(20);
```

지연 로드가 필요할 때:

```php
$posts->load('user');
```

디버그:

```bash
composer require barryvdh/laravel-debugbar --dev
# 또는
DB::listen(fn ($q) => logger($q->sql, $q->bindings));
```

`Model::preventLazyLoading(! app()->isProduction());`  
→ 로컬/테스트에서 N+1을 예외로 터뜨리는 현대적 기법.

---

## 6. 스코프

```php
public function scopePublished(Builder $query): void
{
    $query->where('status', PostStatus::Published)
          ->where('published_at', '<=', now());
}

Post::published()->latest()->get();
```

글로벌 스코프는 남용하지 않기 (잊고 `withoutGlobalScopes` 하다가 사고).

---

## 7. 트랜잭션

```php
DB::transaction(function () use ($data) {
    $order = Order::create([...]);
    $order->items()->createMany($data['items']);
    $order->user->decrement('credits', $data['cost']);
});
```

여러 쓰기 + 일관성 필요하면 반드시 트랜잭션.  
긴 트랜잭션 안에 HTTP/메일 호출 넣지 말 것.

---

## 8. Factory & Seeder

```php
// database/factories/PostFactory.php
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'title' => fake()->sentence(),
        'slug' => fake()->unique()->slug(),
        'body' => fake()->paragraphs(3, true),
        'status' => PostStatus::Draft,
    ];
}

public function published(): static
{
    return $this->state(fn () => [
        'status' => PostStatus::Published,
        'published_at' => now()->subDay(),
    ]);
}
```

```php
Post::factory()->count(50)->published()->create();
```

테스트와 데모 데이터에 필수.

---

## 9. 성능·인덱스

- `where`/`orderBy`/`foreignId`에 인덱스
- `select`로 필요 컬럼만
- 대량 insert: `insert`, `upsert`, chunk
- `chunkById` / `lazy`로 메모리 보호

```php
Post::query()->where('status', 'draft')->chunkById(200, function ($posts) {
    //
});
```

---

## 10. Soft delete & 관찰자

```php
$post->delete();      // soft
$post->forceDelete();
Post::withTrashed()->find($id);
```

```bash
php artisan make:observer PostObserver --model=Post
```

생성 시 slug 자동 생성 등은 Observer/Model boot에서.

---

## 연습

1. `User` 1:N `Post`, N:N `Tag`를 마이그레이션으로 만든다.
2. `published` 스코프와 factory state를 구현한다.
3. `preventLazyLoading`을 켜고 N+1을 `with`로 고친다.
4. 주문 생성 시 트랜잭션으로 order + items를 저장한다.

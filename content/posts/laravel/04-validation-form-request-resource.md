---
slug: laravel-04
order: 4
category: laravel
categoryLabel: Laravel
title: "Validation, Form Request, API Resource"
summary: "입력 검증을 Form Request로 분리하고, API Resource로 응답 계약을 안정적으로 만든다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# Validation, Form Request, API Resource

> 요약: 입력 검증을 Form Request로 분리하고, API Resource로 응답 계약을 안정적으로 만든다.

---

---

## 1. 검증은 컨트롤러에 두지 않기

컨트롤러에 `Validator::make`가 길어지면 읽기 어렵다.  
**Form Request**가 Laravel다운 기본 해법이다.

```bash
php artisan make:request StorePostRequest
```

```php
class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Post::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'alpha_dash', 'max:140', 'unique:posts,slug'],
            'body' => ['required', 'string'],
            'tag_ids' => ['array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '제목을 입력하세요.',
        ];
    }
}
```

```php
public function store(StorePostRequest $request)
{
    $data = $request->validated();
    // ...
}
```

`authorize()`에서 false면 403. Policy와 연결하면 일관된다.

---

## 2. 자주 쓰는 룰

| 룰 | 의미 |
|----|------|
| `required`, `nullable` | 필수/선택 |
| `string`, `integer`, `boolean`, `array` | 타입 |
| `email`, `url`, `uuid` | 형식 |
| `max`, `min`, `between` | 범위 |
| `unique:table,column` | 유일 |
| `exists:table,id` | FK 존재 |
| `confirmed` | password_confirmation |
| `Rule::enum(PostStatus::class)` | Enum |
| `Rule::unique(...)->ignore($id)` | 수정 시 유일 |

```php
use Illuminate\Validation\Rule;

'title' => ['required', Rule::unique('posts')->ignore($this->post)],
'status' => ['required', Rule::enum(PostStatus::class)],
```

---

## 3. 준비(prepare) / after 훅

```php
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => $this->slug ?: Str::slug($this->title ?? ''),
    ]);
}

public function after(): array
{
    return [
        function (Validator $validator) {
            if ($this->somethingDangerous()) {
                $validator->errors()->add('body', '허용되지 않는 내용');
            }
        },
    ];
}
```

---

## 4. API 검증 실패 응답

JSON 요청 시 기본은 422 + `message` + `errors`.

커스텀이 필요하면 `failedValidation` 또는 전역 Exception 렌더링에서 RFC 7807 비슷하게 맞출 수 있다.

```php
// bootstrap/app.php withExceptions
$exceptions->render(function (ValidationException $e, Request $request) {
    if ($request->is('api/*')) {
        return response()->json([
            'title' => 'Validation Failed',
            'status' => 422,
            'errors' => $e->errors(),
        ], 422);
    }
});
```

---

## 5. API Resource — 엔티티 직접 노출 금지

```bash
php artisan make:resource PostResource
php artisan make:resource PostCollection
```

```php
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'status' => $this->status->value,
            'author' => new UserResource($this->whenLoaded('user')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
```

```php
return new PostResource($post->load('user', 'tags'));
return PostResource::collection(Post::with('user')->paginate());
return (new PostResource($post))
    ->response()
    ->setStatusCode(201);
```

`whenLoaded`로 N+1과 불필요 노출을 동시에 줄인다.

---

## 6. 페이지네이션 응답

```php
return PostResource::collection(
    Post::published()->with('user')->latest()->paginate(20)
);
```

기본 구조에 `data`, `links`, `meta`가 포함된다.  
프론트와 페이지 계약(`meta.current_page` 등)을 문서화해 두자.

커서 페이지네이션:

```php
Post::published()->orderBy('id')->cursorPaginate(20);
```

피드형 API에 유리하다.

---

## 7. DTO / Data 객체 (선택)

검증된 배열 대신 타입 있는 객체:

```php
readonly class StorePostData
{
    public function __construct(
        public string $title,
        public string $body,
        public array $tagIds = [],
    ) {}

    public static function fromRequest(StorePostRequest $request): self
    {
        $v = $request->validated();
        return new self($v['title'], $v['body'], $v['tag_ids'] ?? []);
    }
}
```

또는 Spatie Laravel Data 패키지. 팀 규모가 커질수록 도움이 된다.

---

## 8. 파일 업로드 검증

```php
'cover' => ['nullable', 'image', 'max:2048', 'dimensions:max_width=2000'],
```

```php
$path = $request->file('cover')->store('covers', 's3');
```

공개 디스크 vs 사설 디스크, 바이러스 스캔·MIME 위조 대응은 운영에서 추가 검토.

---

## 9. 실무 체크리스트

- [ ] 모든 쓰기 API에 Form Request
- [ ] `validated()`만 사용 (`$request->all()` 금지에 가깝게)
- [ ] 응답은 Resource
- [ ] 비밀번호·토큰·내부 ID 미노출
- [ ] 생성 201 + Location/본문, 삭제는 204 또는 메시지 통일

---

## 연습

1. `StorePostRequest` / `UpdatePostRequest`를 만든다.
2. `PostResource`로 show/index 응답을 통일한다.
3. 검증 실패 JSON 포맷을 커스터마이즈한다.
4. 이미지 업로드 필드 검증 + `storage` 저장을 구현한다.

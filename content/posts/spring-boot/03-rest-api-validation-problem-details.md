---
slug: spring-boot-03
order: 3
category: spring-boot
categoryLabel: Spring Boot
title: "REST API 설계 — Validation, Problem Details, RestClient"
summary: "Spring MVC 기반 REST API를 명확한 계약·검증·에러 응답·HTTP 클라이언트로 설계한다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# REST API 설계 — Validation, Problem Details, RestClient

> 요약: Spring MVC 기반 REST API를 명확한 계약·검증·에러 응답·HTTP 클라이언트로 설계한다.

---

---

## 1. 컨트롤러의 역할

컨트롤러는 **HTTP 어댑터**다.

- 요청 파싱 / 검증
- 애플리케이션 서비스 호출
- 응답 상태코드·본문 매핑

비즈니스 규칙을 컨트롤러에 넣지 않는다.

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.get(id);
    }
}
```

---

## 2. DTO는 record로

```java
public record CreateUserRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 50) String name
) {}

public record UserResponse(Long id, String email, String name) {}
```

엔티티를 그대로 노출하지 말 것. 영속성 모델과 API 계약은 분리한다.

---

## 3. Validation

의존성: `spring-boot-starter-validation`

| 어노테이션 | 용도 |
|-----------|------|
| `@NotNull` / `@NotBlank` | 필수 |
| `@Email` | 이메일 |
| `@Size` / `@Min` / `@Max` | 길이·범위 |
| `@Pattern` | 정규식 |
| `@Valid` | 중첩 객체 검증 |
| `@Validated` | 그룹/메서드 검증 |

쿼리 파라미터 검증:

```java
@GetMapping
public Page<UserResponse> search(
        @RequestParam @Min(0) int page,
        @RequestParam @Min(1) @Max(100) int size
) { ... }
```

클래스에 `@Validated`를 붙여야 메서드 파라미터 검증이 동작한다.

---

## 4. 상태 코드 가이드

| 상황 | 코드 |
|------|------|
| 조회 성공 | 200 |
| 생성 성공 | 201 + `Location` 헤더 |
| 삭제/수정 성공(본문 없음) | 204 |
| 검증 실패 | 400 |
| 인증 필요 | 401 |
| 권한 없음 | 403 |
| 없음 | 404 |
| 충돌(중복 등) | 409 |
| 서버 오류 | 500 |

```java
@PostMapping
public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
    UserResponse created = userService.create(request);
    URI location = URI.create("/api/users/" + created.id());
    return ResponseEntity.created(location).body(created);
}
```

---

## 5. Problem Details (RFC 7807) — 현대 에러 응답

Spring Boot 3 / Spring Framework 6는 `ProblemDetail`을 지원한다.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    ResponseEntity<ProblemDetail> handleNotFound(UserNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("User Not Found");
        problem.setProperty("userId", ex.getUserId());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation Failed");
        problem.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of("field", fe.getField(), "message", fe.getDefaultMessage()))
                .toList());
        return ResponseEntity.badRequest().body(problem);
    }
}
```

응답 예시:

```json
{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 400,
  "detail": null,
  "errors": [
    { "field": "email", "message": "must be a well-formed email address" }
  ]
}
```

클라이언트와 에러 계약을 통일하면 프론트/모바일 대응이 쉬워진다.

---

## 6. API 버전 전략

실무에서 많이 쓰는 방식:

1. **URL 버전**: `/api/v1/users`
2. **헤더 버전**: `Accept: application/vnd.example.v1+json`
3. **하위 호환 진화**: 필드 추가만 하고 breaking change는 새 버전

중소규모에서는 URL 버전이 운영하기 쉽다.

---

## 7. 페이지네이션·정렬

Spring Data의 `Pageable` 활용:

```java
@GetMapping
public Page<UserResponse> list(Pageable pageable) {
    return userService.list(pageable);
}
```

```
GET /api/users?page=0&size=20&sort=createdAt,desc
```

응답에 `content`, `totalElements`, `totalPages`가 포함된다.  
외부 공개 API라면 커스텀 envelope(`items`, `page`, `size`, `total`)로 감싸는 팀도 많다.

---

## 8. RestClient (Boot 3.2+) — RestTemplate 대체

`RestTemplate`은 유지보수 모드에 가깝고, 동기 HTTP는 **`RestClient`** 가 권장된다.  
리액티브면 `WebClient`.

```java
@Configuration
public class HttpClientConfig {

    @Bean
    RestClient paymentRestClient(RestClient.Builder builder, PaymentProperties props) {
        return builder
                .baseUrl(props.baseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .requestFactory(new JdkClientHttpRequestFactory())
                .build();
    }
}
```

```java
public PaymentResponse charge(ChargeRequest request) {
    return paymentRestClient.post()
            .uri("/charges")
            .body(request)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                throw new PaymentRejectedException("payment rejected");
            })
            .body(PaymentResponse.class);
}
```

타임아웃·재시도는 HTTP 클라이언트 설정 + Resilience4j와 함께 설계한다.

---

## 9. 콘텐츠 협상·JSON 설정

```yaml
spring:
  jackson:
    default-property-inclusion: non_null
    serialization:
      write-dates-as-timestamps: false
    time-zone: Asia/Seoul
```

날짜는 ISO-8601 문자열(`OffsetDateTime`)을 권장한다.

---

## 10. OpenAPI 문서화

`springdoc-openapi` 사용 예:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.7.0</version>
</dependency>
```

- Swagger UI: `/swagger-ui.html`
- OpenAPI JSON: `/v3/api-docs`

DTO/컨트롤러에 `@Operation`, `@Schema`로 계약을 보강하면 협업 비용이 줄어든다.

---

## 11. 보안·설계 팁

- 민감 필드는 응답에서 제외 (password, token 등)
- IDOR 방지를 위해 리소스 접근 권한 검사
- idempotency-key (결제/생성 API)
- rate limiting은 게이트웨이 또는 필터에서

---

## 연습

1. `POST /api/products` + Bean Validation + 201 Created를 구현한다.
2. 존재하지 않는 상품 조회 시 `ProblemDetail` 404를 반환한다.
3. `RestClient`로 공개 API(예: JSONPlaceholder)를 호출하는 서비스를 만든다.
4. springdoc으로 Swagger UI에서 API를 확인한다.

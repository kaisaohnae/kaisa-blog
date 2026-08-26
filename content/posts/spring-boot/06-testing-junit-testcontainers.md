---
slug: spring-boot-06
order: 6
category: spring-boot
categoryLabel: Spring Boot
title: "테스트 — JUnit 5, MockMvc, Testcontainers"
summary: "단위·슬라이스·통합 테스트를 균형 있게 구성하고, Testcontainers로 실제에 가까운 DB/미들웨어 검증을 한다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# 테스트 — JUnit 5, MockMvc, Testcontainers

> 요약: 단위·슬라이스·통합 테스트를 균형 있게 구성하고, Testcontainers로 실제에 가까운 DB/미들웨어 검증을 한다.

---

---

## 1. 테스트 피라미드 (Spring 관점)

| 종류 | 도구 | 속도 | 목적 |
|------|------|------|------|
| 단위 | JUnit + Mockito | 매우 빠름 | 도메인/서비스 로직 |
| 슬라이스 | `@WebMvcTest`, `@DataJpaTest` | 빠름 | 계층 경계 |
| 통합 | `@SpringBootTest` + Testcontainers | 느림 | 실제 조립 검증 |
| E2E | RestAssured / 브라우저 | 가장 느림 | 핵심 시나리오만 |

모든 것을 `@SpringBootTest`로 올리면 CI가 느려지고 실패 원인 추적이 어렵다.

---

## 2. 단위 테스트

```java
class OrderServiceTest {

    @Test
    void rejectsEmptyItems() {
        OrderRepository repo = mock(OrderRepository.class);
        OrderService service = new OrderService(repo);

        assertThatThrownBy(() -> service.create(new CreateOrderRequest(List.of())))
                .isInstanceOf(InvalidOrderException.class);
    }
}
```

순수 도메인/서비스는 Spring 컨텍스트 없이 테스트하는 것이 최선이다.

---

## 3. `@WebMvcTest` — 컨트롤러 슬라이스

```java
@WebMvcTest(UserController.class)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean UserService userService; // Boot 3.4+ (이전: @MockBean)

    @Test
    void createUser() throws Exception {
        given(userService.create(any()))
                .willReturn(new UserResponse(1L, "a@b.com", "Ann"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"a@b.com","name":"Ann"}
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("a@b.com"));
    }
}
```

Security가 켜져 있으면 `@AutoConfigureMockMvc(addFilters = false)` 또는 `@WithMockUser`를 사용한다.

---

## 4. `@DataJpaTest` — 영속성 슬라이스

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfig.class)
class UserRepositoryTest {

    @Autowired UserRepository userRepository;

    @Test
    void findByEmail() {
        userRepository.save(User.create("a@b.com", "Ann"));

        assertThat(userRepository.findByEmail("a@b.com")).isPresent();
    }
}
```

H2로 대체하면 운영 DB(PostgreSQL)와 方言 차이가 난다. **중요한 쿼리는 Testcontainers + 실제 DB**가 안전하다.

---

## 5. Testcontainers (최신 표준)

의존성:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-testcontainers</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>postgresql</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
```

```java
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgres() {
        return new PostgreSQLContainer<>("postgres:16-alpine");
    }
}
```

```java
@SpringBootTest
@Import(TestcontainersConfig.class)
class UserServiceIT {

    @Autowired UserService userService;

    @Test
    void createAndGet() {
        UserResponse created = userService.create(new CreateUserRequest("a@b.com", "Ann"));
        assertThat(userService.get(created.id()).email()).isEqualTo("a@b.com");
    }
}
```

`@ServiceConnection`(Boot 3.1+)이 datasource URL을 자동 연결한다. 수동 `@DynamicPropertySource`보다 간결하다.

Kafka, Redis, LocalStack도 동일 패턴으로 붙일 수 있다.

---

## 6. `@SpringBootTest` + MockMvc / TestRestTemplate / RestTestClient

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiIT {

    @Autowired MockMvc mockMvc; // @AutoConfigureMockMvc 필요
    // 또는
    @Autowired TestRestTemplate restTemplate;
}
```

Boot 3.4+에서는 `RestTestClient`도 선택지로 떠올랐다. 팀 표준에 맞춘다.

---

## 7. 테스트 데이터

- 테스트마다 독립: `@Transactional` 롤백 또는 컨테이너 재사용 + 클리닝
- Fixture 빌더 / 팩토리 메서드
- `@Sql("/test-data.sql")`는 간단할 때만

```java
static User user(String email) {
    return User.create(email, email.split("@")[0]);
}
```

---

## 8. AssertJ & 가독성

```java
assertThat(result)
    .extracting(UserResponse::email, UserResponse::name)
    .containsExactly("a@b.com", "Ann");
```

JUnit `assertEquals`보다 AssertJ 체인이 실패 메시지가 좋다.

---

## 9. 비동기·시간·외부 API

| 대상 | 기법 |
|------|------|
| 시간 | `Clock` Bean 주입 후 고정 |
| 외부 HTTP | WireMock / MockWebServer |
| 메시지 | Testcontainers Kafka / Embedded |
| 파일 | `@TempDir` |

```java
@Bean
@Primary
Clock fixedClock() {
    return Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
}
```

---

## 10. CI에서 안정적으로

- Docker 사용 가능 러너 필요 (Testcontainers)
- 컨테이너 재사용: `testcontainers.reuse.enable=true` (로컬)
- 병렬 테스트 시 포트/리소스 충돌 주의
- flaky 테스트는 재시도로 숨기지 말고 원인 제거

---

## 연습

1. 서비스 단위 테스트 2개 작성 (성공/실패).
2. `@WebMvcTest`로 validation 400 응답을 검증한다.
3. Testcontainers PostgreSQL로 리포지토리/서비스 IT를 작성한다.
4. `@ServiceConnection`으로 datasource 자동 연결을 확인해 본다.

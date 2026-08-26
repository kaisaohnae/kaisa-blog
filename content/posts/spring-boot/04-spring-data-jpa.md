---
slug: spring-boot-04
order: 4
category: spring-boot
categoryLabel: Spring Boot
title: "Spring Data JPA와 영속성 계층"
summary: "JPA 엔티티·리포지토리·트랜잭션을 올바르게 다루고, N+1·마이그레이션·성능 함정을 피한다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# Spring Data JPA와 영속성 계층

> 요약: JPA 엔티티·리포지토리·트랜잭션을 올바르게 다루고, N+1·마이그레이션·성능 함정을 피한다.

---

---

## 1. 계층 역할

| 계층 | 책임 |
|------|------|
| Entity | 비즈니스 상태와 불변식 |
| Repository | 영속성 추상화 |
| Service (`@Transactional`) | 유스케이스 단위 트랜잭션 |
| Controller | HTTP만 |

---

## 2. 엔티티 기본 패턴

```java
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String name;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public static User create(String email, String name) {
        User user = new User();
        user.email = email;
        user.name = name;
        return user;
    }

    public void rename(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name required");
        }
        this.name = name;
    }
}
```

핵심:

- 기본 생성자는 `protected`
- setter 남발 금지 — 의미 있는 도메인 메서드 제공
- equals/hashCode는 **식별자 기준**으로 신중히 ( Lombok `@EqualsAndHashCode` 무분별 사용 주의)

Auditing 활성화:

```java
@Configuration
@EnableJpaAuditing
public class JpaConfig {}
```

---

## 3. Spring Data Repository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("select u from User u where u.name like %:keyword%")
    List<User> searchByName(@Param("keyword") String keyword);
}
```

파생 쿼리 메서드 → JPQL `@Query` → `Specification` / QueryDSL 순으로 복잡도를 올린다.

### 수정·삭제 쿼리

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("update User u set u.name = :name where u.id = :id")
int rename(@Param("id") Long id, @Param("name") String name);
```

벌크 업데이트 후 영속성 컨텍스트와 DB 불일치에 주의.

---

## 4. 트랜잭션

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserResponse get(Long id) {
        return userRepository.findById(id)
                .map(UserMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException(request.email());
        }
        User saved = userRepository.save(User.create(request.email(), request.name()));
        return UserMapper.toResponse(saved);
    }
}
```

권장:

- 클래스 기본: `readOnly = true`
- 쓰기 메서드만 `@Transactional`
- 트랜잭션 경계는 **애플리케이션 서비스**
- 컨트롤러/`@Repository` 기본 메서드에 비즈니스 트랜잭션을 두지 않기

전파(Propagation)·격리 수준은 기본값으로 대부분 충분하다. 특별한 동시성 이슈가 있을 때만 조정.

---

## 5. 연관관계와 지연 로딩

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "user_id")
private User user;

@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderLine> lines = new ArrayList<>();
```

규칙:

- 모든 연관은 **LAZY**가 기본 전략
- `EAGER`는 성능 사고의 주범
- 양방향은 편의 메서드로 양쪽을 맞춘다

```java
public void addLine(OrderLine line) {
    lines.add(line);
    line.setOrder(this);
}
```

---

## 6. N+1 문제와 해결

증상: 목록 조회 후 연관 엔티티 접근 시 쿼리가 N번 추가.

해결:

### fetch join

```java
@Query("select o from Order o join fetch o.user where o.id = :id")
Optional<Order> findWithUser(@Param("id") Long id);
```

### EntityGraph

```java
@EntityGraph(attributePaths = {"lines"})
Optional<Order> findWithLinesById(Long id);
```

### DTO 프로젝션 (읽기 전용에 최적)

```java
@Query("""
    select new com.example.demo.order.OrderSummary(o.id, u.email, o.totalAmount)
    from Order o join o.user u
    where o.status = :status
    """)
List<OrderSummary> findSummaries(OrderStatus status);
```

Open Session In View(`spring.jpa.open-in-view`)는 Boot 기본이 true인데, **운영에서는 false 권장**.

```yaml
spring:
  jpa:
    open-in-view: false
```

뷰/컨트롤러에서 지연 로딩이 터지면 설계를 고치는 편이 맞다.

---

## 7. 스키마 관리 — Flyway / Liquibase

`ddl-auto: update`는 로컬 장난감용. 운영은 **마이그레이션 도구**가 정답.

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
```

```
db/migration/
  V1__create_users.sql
  V2__create_orders.sql
```

```sql
-- V1__create_users.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ
);
```

---

## 8. 낙관적 락

동시 수정 충돌 방지:

```java
@Version
private Long version;
```

충돌 시 `OptimisticLockException` → 409 또는 재시도 정책.

---

## 9. 성능·운영 설정

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 3000
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50
        order_inserts: true
        order_updates: true
```

로컬에서 SQL 확인:

```yaml
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE  # Boot 3 / Hibernate 6
```

`spring.jpa.show-sql=true`만으로는 바인딩 파라미터가 안 보인다.

---

## 10. Soft delete / 공통 베이스

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @CreatedDate private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;
}
```

소프트 삭제는 `@SQLRestriction` / `@SoftDelete`(Hibernate 6.4+) 또는 명시적 `deletedAt` 필드로 처리.

---

## 연습

1. `User`, `Post` (User 1:N Post) 엔티티와 리포지토리를 만든다.
2. 게시글 목록 + 작성자 이메일을 **fetch join 또는 DTO 쿼리**로 N+1 없이 조회한다.
3. Flyway로 테이블을 생성하고 `ddl-auto: validate`로 맞춘다.
4. `open-in-view: false`에서 지연 로딩 예외가 안 나는지 확인한다.

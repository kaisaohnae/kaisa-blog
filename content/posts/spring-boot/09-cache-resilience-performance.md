---
slug: spring-boot-09
order: 9
category: spring-boot
categoryLabel: Spring Boot
title: "캐시·Resilience·성능 최적화"
summary: "캐시, 재시도, 서킷브레이커, 타임아웃으로 장애를 격리하고, 병목을 체계적으로 줄인다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# 캐시·Resilience·성능 최적화

> 요약: 캐시, 재시도, 서킷브레이커, 타임아웃으로 장애를 격리하고, 병목을 체계적으로 줄인다.

---

---

## 1. 성능 작업의 순서

1. **측정** (메트릭/트레이스/프로파일) — 감으로 최적화하지 않기
2. 알고리즘/쿼리/N+1 제거
3. 커넥션 풀·스레드·타임아웃 조정
4. 캐시
5. 스케일 아웃

가장 싼 최적화는 “안 하는 일”을 줄이는 것이다 (불필요 호출, 과다 로그, 큰 페이로드).

---

## 2. Spring Cache

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("products", "users");
    }
}
```

```java
@Cacheable(cacheNames = "products", key = "#id")
public ProductResponse get(Long id) { ... }

@CacheEvict(cacheNames = "products", key = "#id")
public void update(Long id, UpdateProductRequest request) { ... }
```

로컬 캐시(`ConcurrentMap`)는 단일 인스턴스용.  
다중 인스턴스는 **Redis** 등 분산 캐시:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

주의:

- 캐시 키 설계 (사용자별 데이터 섞임 금지)
- TTL / 무효화 전략
- stampede (캐시 만료 순간 동시 재계산) — lock/singleflight 또는 soft expire
- 개인정보·권한 데이터 캐시 시 보안

---

## 3. Resilience4j — 실패에 대비

의존성 예:

```xml
<dependency>
  <groupId>io.github.resilience4j</groupId>
  <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
```

### 타임아웃

외부 호출에는 **반드시** 타임아웃.

### Retry

```java
@Retry(name = "payment", fallbackMethod = "payFallback")
public PaymentResult pay(PaymentRequest request) {
    return paymentClient.charge(request);
}
```

멱등하지 않은 POST에 무분별한 재시도는 위험.  
Idempotency-Key 또는 “안전한 재시도 조건(네트워크/408/429/5xx)”만 재시도.

### Circuit Breaker

```yaml
resilience4j:
  circuitbreaker:
    instances:
      payment:
        slidingWindowSize: 20
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
```

실패율이 높으면 빠르게 실패(open) → 회복 시도(half-open) → 정상(close).

### Bulkhead / RateLimiter

동시 실행 수·호출 속도를 제한해 장애 전파를 막는다.

### Fallback

```java
private PaymentResult payFallback(PaymentRequest request, Throwable t) {
    return PaymentResult.failed("temporary unavailable");
}
```

폴백이 비즈니스적으로 안전한지 검토 (가짜 성공 금지).

---

## 4. HTTP 클라이언트 타임아웃

```java
JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
factory.setReadTimeout(Duration.ofSeconds(3));

RestClient client = RestClient.builder()
        .requestFactory(factory)
        .baseUrl(props.baseUrl())
        .build();
```

타임아웃 없는 클라이언트는 스레드/가상스레드·커넥션을 잡아먹는다.

---

## 5. DB 성능 체크리스트

- 인덱스: `WHERE`/`JOIN`/`ORDER BY` 컬럼
- `EXPLAIN ANALYZE`로 실행 계획 확인
- 필요 컬럼만 조회 (DTO 프로젝션)
- 배치 사이즈, 페이지 크기 상한
- 장시간 트랜잭션 금지 (락·커넥션 점유)
- Hikari `maximum-pool-size` = (코어 수 기반 공식) × 인스턴스 수와 DB max_connections 균형

---

## 6. 페이로드·직렬화

- 불필요 필드 제거 (`@JsonIgnore`, 전용 DTO)
- 대용량 목록은 커서/키셋 페이지네이션
- gzip (리버스 프록시)
- 이미지/파일은 오브젝트 스토리지 + CDN

오프셋 페이지네이션(`page=100000`)은 깊게 갈수록 느리다. 피드성 API는 **키셋 페이지네이션**이 유리하다.

```java
List<Post> findByIdLessThanOrderByIdDesc(Long cursor, Pageable pageable);
```

---

## 7. JVM·런타임

- 컨테이너: 메모리 한도에 맞는 heap (`-XX:+UseContainerSupport` 기본)
- GC 로그/메트릭 관찰
- Native Image(GraalVM)는 기동·메모리에 유리, 빌드 복잡·제한 존재 (운영 배포 문서 참고)

---

## 8. 동시성 이슈

- 재고 차감 등: 낙관적 락 / 비관적 락 / DB 제약 / 단일화 큐
- 분산 환경 락: Redis lock은 신중히 (오용 많음)
- 멱등 테이블로 “한 번만 처리”

```java
@Entity
@Table(name = "idempotency_keys", uniqueConstraints = @UniqueConstraint(columnNames = "key_value"))
public class IdempotencyKey { ... }
```

---

## 9. 부하 테스트

도구: k6, Gatling, JMeter

볼 것:

- RPS, p50/p95/p99
- 에러율
- CPU, heap, GC
- DB CPU, 커넥션, slow query
- 외부 의존성 지연

최적화 전후를 **같은 시나리오**로 비교한다.

---

## 연습

1. `@Cacheable`로 상품 조회 캐시를 넣고, 업데이트 시 evict한다.
2. 외부 호출에 Resilience4j CircuitBreaker + Retry를 적용한다.
3. RestClient read timeout을 3초로 설정한다.
4. 느린 목록 API를 키셋 페이지네이션으로 바꾼다.

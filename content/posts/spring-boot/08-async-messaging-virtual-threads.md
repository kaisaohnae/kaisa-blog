---
slug: spring-boot-08
order: 8
category: spring-boot
categoryLabel: Spring Boot
title: "비동기·메시징·Virtual Threads"
summary: "`@Async`, 이벤트, Kafka/RabbitMQ, Java 21 Virtual Threads를 상황에 맞게 선택한다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# 비동기·메시징·Virtual Threads

> 요약: `@Async`, 이벤트, Kafka/RabbitMQ, Java 21 Virtual Threads를 상황에 맞게 선택한다.

---

---

## 1. 동기 vs 비동기 — 언제 무엇을

| 요구 | 선택 |
|------|------|
| 요청-응답, 단순 CRUD | 동기 MVC (+ Virtual Threads) |
| 당장 응답 가능, 후처리는 나중 | 애플리케이션 이벤트 / 메시지 큐 |
| 높은 동시 블로킹 I/O | Virtual Threads |
| CPU 집약 | 플랫폼 스레드 풀 크기 제한 |
| 서비스 간 느슨한 결합·재시도 | Kafka / RabbitMQ / SQS |

“전부 리액티브(WebFlux)”가 기본값은 아니다. 팀 숙련도·라이브러리 생태계를 본다.

---

## 2. Virtual Threads (Spring Boot 3.2+)

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

효과:

- 요청당 블로킹(JDBC, RestClient, 파일 I/O)이 있어도 스레드가 저렴하게 대기
- Tomcat이 가상 스레드로 요청을 처리

주의:

- CPU 바운드 작업 성능 마법은 아님
- `synchronized`로 오래 막히면 캐리어 스레드 pinning (Java 21+에서 개선 중이나 주의)
- 스레드 로컬 대량 사용 라이브러리와 궁합 확인
- 커넥션 풀 크기는 여전히 병목 — 가상 스레드만 켠다고 DB가 무한히 버티지 않음

실무 팁: **I/O 많은 REST + JDBC 서비스**에서 먼저 효과를 보기 쉽다.

---

## 3. `@Async` — 간단한 백그라운드

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    TaskExecutor taskExecutor() {
        // Virtual thread executor 예시
        return new TaskExecutor() {
            @Override
            public void execute(Runnable task) {
                Thread.startVirtualThread(task);
            }
        };
    }
}
```

```java
@Service
public class MailService {
    @Async
    public void sendWelcome(String email) {
        // SMTP 호출
    }
}
```

한계:

- 실패 재시도·DLQ·순서 보장 약함
- 프로세스 죽으면 작업 유실
- “약간 나중에” 정도에만 사용하고, 중요한 후처리는 **메시지 브로커**로

---

## 4. 스프링 애플리케이션 이벤트

같은 앱 내 결합도 낮추기:

```java
public record OrderCreatedEvent(Long orderId, String email) {}

@Service
@RequiredArgsConstructor
public class OrderService {
    private final ApplicationEventPublisher publisher;
    private final OrderRepository repository;

    @Transactional
    public OrderResponse create(...) {
        Order order = repository.save(...);
        publisher.publishEvent(new OrderCreatedEvent(order.getId(), order.getEmail()));
        return ...;
    }
}

@Component
@RequiredArgsConstructor
public class OrderCreatedListener {
    private final MailService mailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(OrderCreatedEvent event) {
        mailService.sendWelcome(event.email());
    }
}
```

`@TransactionalEventListener(AFTER_COMMIT)`이 핵심이다.  
커밋 전에 메일을 보내면 롤백된 주문에 환영 메일이 갈 수 있다.

동기 이벤트는 발행 스레드에서 실행된다. 완전 분리하려면 `@Async` 또는 메시지 큐.

---

## 5. Kafka와의 연동 (개요)

```xml
<dependency>
  <groupId>org.springframework.kafka</groupId>
  <artifactId>spring-kafka</artifactId>
</dependency>
```

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BROKERS}
    consumer:
      group-id: demo-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

```java
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public void publish(OrderCreatedEvent event) {
        kafkaTemplate.send("order.created", event.orderId().toString(), event);
    }
}

@KafkaListener(topics = "order.created", groupId = "mail-service")
public void consume(OrderCreatedEvent event) {
    mailService.sendWelcome(event.email());
}
```

실무 체크리스트:

- idempotent consumer (같은 이벤트 두 번 와도 안전)
- 스키마 진화 (Avro/JSON Schema + 호환 규칙)
- 재시도 + DLT (Dead Letter Topic)
- 파티션 키로 순서 보장 범위 명확화
- Outbox 패턴 (DB 트랜잭션과 메시지 발행 원자성)

---

## 6. Outbox 패턴 (중요)

문제: DB 커밋 성공 후 Kafka 전송 실패 → 상태 불일치.

해결 개요:

1. 비즈니스 테이블 + `outbox` 테이블을 **같은 트랜잭션**에 기록
2. 별도 퍼블리셔가 outbox를 읽어 브로커로 전송
3. 전송 성공 시 처리 완료 마킹

Debezium CDC로 outbox 테이블을 스트리밍하는 방식도 널리 쓰인다.

---

## 7. RabbitMQ가 잘 맞는 경우

- 작업 큐 (메일, 썸네일, 리포트)
- 라우팅 키/교환기 기반 유연한 배포
- 비교적 단순한 경쟁 소비자 패턴

Kafka는 로그/이벤트 스트림·재생에 강하고, Rabbit은 작업 큐에 강하다. 목적에 맞게 고른다.

---

## 8. WebFlux / 반응형 — 언제 고려

다음이면 검토:

- 동시 연결이 매우 많고 메모리 제약이 큼
- 다운스트림이 전부 non-blocking
- 스트리밍(SSE, WebSocket)이 핵심

다음이면 MVC + Virtual Threads가 보통 낫다:

- JDBC/JPA 중심
- 팀 대부분이 리액티브 비숙련
- 블로킹 라이브러리가 많음

---

## 9. 타임아웃·취소·백프레셔

- HTTP 클라이언트 connect/read timeout 명시
- `@KafkaListener` 처리 시간 모니터링
- 큐 적체 알람
- 가상 스레드여도 **타임아웃 없는 무한 대기**는 위험

---

## 연습

1. Virtual Threads를 켜고, 의도적으로 `Thread.sleep` 또는 외부 HTTP 대기가 있는 API의량 테스트를 비교한다.
2. `OrderCreatedEvent` + `@TransactionalEventListener(AFTER_COMMIT)`로 메일 발송(로그로 대체)을 구현한다.
3. (선택) Kafka Testcontainers로 produce/consume 통합 테스트를 작성한다.
4. Outbox 테이블 설계를 문서/코드로 스케치한다.

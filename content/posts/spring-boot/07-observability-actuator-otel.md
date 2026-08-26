---
slug: spring-boot-07
order: 7
category: spring-boot
categoryLabel: Spring Boot
title: "Observability — Actuator, Micrometer, OpenTelemetry"
summary: "헬스체크·메트릭·트레이싱·구조화 로그로 “왜 느리고 어디서 깨졌는지”를 관측 가능하게 만든다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# Observability — Actuator, Micrometer, OpenTelemetry

> 요약: 헬스체크·메트릭·트레이싱·구조화 로그로 “왜 느리고 어디서 깨졌는지”를 관측 가능하게 만든다.

---

---

## 1. Observability 3本柱

1. **Logs** — 이벤트 기록 (무엇을 했나)
2. **Metrics** — 집계 수치 (얼마나/얼마나 자주)
3. **Traces** — 요청 단위 분산 추적 (어디서 시간이 갔나)

Spring Boot 3는 **Micrometer Observation API**로 메트릭과 트레이스를 같은 계측에서 뽑아낸다.

---

## 2. Actuator 기본

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,loggers
  endpoint:
    health:
      show-details: when_authorized
      probes:
        enabled: true
  info:
    env:
      enabled: true

info:
  app:
    name: demo
    version: 1.0.0
```

주요 엔드포인트:

| Path | 용도 |
|------|------|
| `/actuator/health` | 생존/준비 |
| `/actuator/health/liveness` | k8s liveness |
| `/actuator/health/readiness` | k8s readiness |
| `/actuator/metrics` | 메트릭 목록 |
| `/actuator/prometheus` | Prometheus 스크rape |
| `/actuator/info` | 앱 정보 |

운영에서는 Actuator를 별도 포트/인증으로 보호하는 것이 일반적이다.

```yaml
management:
  server:
    port: 8081
```

---

## 3. 커스텀 Health Indicator

```java
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    private final PaymentClient client;

    public PaymentGatewayHealthIndicator(PaymentClient client) {
        this.client = client;
    }

    @Override
    public Health health() {
        try {
            client.ping();
            return Health.up().withDetail("payment", "reachable").build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
```

외부 의존성 실패를 readiness에 반영할지, 별도 게이지로만 볼지는 팀 정책으로 정한다.  
과도한 외부 ping은 헬스체크 자체가 장애 포인트가 될 수 있다.

---

## 4. Micrometer 메트릭

```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```java
@Service
public class CheckoutService {

    private final Counter checkoutCounter;
    private final Timer checkoutTimer;

    public CheckoutService(MeterRegistry registry) {
        this.checkoutCounter = registry.counter("checkout.completed");
        this.checkoutTimer = registry.timer("checkout.latency");
    }

    public void checkout(Order order) {
        checkoutTimer.record(() -> {
            // business logic
            checkoutCounter.increment();
        });
    }
}
```

### Observation API (권장)

```java
service.observe("order.create", () -> orderService.create(request));
```

또는:

```java
Observation.createNotStarted("order.create", observationRegistry)
    .lowCardinalityKeyValue("type", "online")
    .observe(() -> orderService.create(request));
```

HTTP 서버/클라이언트, DataSource 등은 Boot가 기본 계측한다.

---

## 5. 분산 추적 (OpenTelemetry)

```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

```yaml
management:
  tracing:
    sampling:
      probability: 1.0   # 운영은 0.05~0.2부터
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces

logging:
  pattern:
    level: "%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]"
```

Zipkin/Jaeger/Grafana Tempo 등으로 트레이스를 시각화한다.  
`traceId`가 로그에 남으면 장애 티켓 ↔ 로그 ↔ 트레이스를 연결할 수 있다.

---

## 6. 구조화 로그 (JSON)

운영 로그는 텍스트보다 JSON이 검색·알람에 유리하다.

예: Logback encoder (logstash-logback-encoder) 또는 Log4j2 JSON layout.

남길 것:

- timestamp, level, logger
- service name, env
- traceId, spanId
- userId(가능하면 해시/내부 ID), requestId
- 에러 스택(샘플링/제한)

남기지 말 것:

- 비밀번호, 토큰, 카드번호, 주민번호
- 과도한 개인정보 원문

---

## 7. HTTP 클라이언트/DB 관측

- `RestClient`/`WebClient`에 Observation/Micrometer 계측 활성화
- HikariCP 메트릭: 커넥션 대기 시간 급증 = 풀 고갈 신호
- JVM: heap, GC, threads
- Tomcat/Netty 요청 큐

알람 예시:

- `http.server.requests` p99 > 1s
- `hikaricp.connections.pending` > 0 지속
- error rate (5xx) > 1%
- readiness fail

---

## 8. 프로파일별 샘플링

| 환경 | sampling probability |
|------|----------------------|
| local | 1.0 |
| staging | 0.5~1.0 |
| prod | 0.05~0.2 (트래픽에 따라) |

모든 요청을 트레이스하면 비용·성능 부담이 커진다.

---

## 9. 실무 대시보드 최소 구성

1. RED: Rate, Errors, Duration (서비스/엔드포인트별)
2. USE: Utilization, Saturation, Errors (CPU, 풀, 큐)
3. 의존성 지연: DB, 결제, 카프카
4. 비즈니스 KPI: 주문 성공 수, 결제 실패 수

기술 메트릭만 보지 말고 **비즈니스 카운터**를 함께 심는다.

---

## 연습

1. Actuator + Prometheus registry를 붙이고 `/actuator/prometheus`를 확인한다.
2. 비즈니스 카운터 `order.created`를 추가한다.
3. 로그 패턴에 `traceId`를 넣고, 요청 로그와 연결해 본다.
4. (선택) OpenTelemetry collector + Jaeger로 트레이스를 시각화한다.

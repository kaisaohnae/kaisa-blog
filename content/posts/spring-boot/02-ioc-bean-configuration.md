---
slug: spring-boot-02
order: 2
category: spring-boot
categoryLabel: Spring Boot
title: "IoC, Bean, Configuration — 현대적인 의존성 주입"
summary: "Spring IoC 컨테이너의 핵심을 이해하고, 생성자 주입·구성 클래스·조건부 Bean 등 실무 패턴을 익힌다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# IoC, Bean, Configuration — 현대적인 의존성 주입

> 요약: Spring IoC 컨테이너의 핵심을 이해하고, 생성자 주입·구성 클래스·조건부 Bean 등 실무 패턴을 익힌다.

---

---

## 1. IoC와 DI란

- **IoC (Inversion of Control)**: 객체 생성·생명주기 제어권을 프레임워크가 가진다.
- **DI (Dependency Injection)**: 필요한 의존성을 외부에서 주입받는다.

직접 `new`로 조립하면 테스트·교체가 어렵고, Spring은 **Bean**으로 등록된 객체를 조립한다.

---

## 2. Bean이 되는 방법

| 방식 | 언제 쓰나 |
|------|-----------|
| `@Component` / `@Service` / `@Repository` / `@Controller` | 직접 만든 클래스 |
| `@Bean` in `@Configuration` | 외부 라이브러리 객체, 세밀한 생성 제어 |
| `@ConfigurationProperties` + `@EnableConfigurationProperties` | 타입 세이프 설정 바인딩 |
| Auto-configuration | starter가 자동 등록 |

```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;

    // 생성자 1개면 @Autowired 생략 가능 (권장)
    public OrderService(OrderRepository orderRepository, PaymentClient paymentClient) {
        this.orderRepository = orderRepository;
        this.paymentClient = paymentClient;
    }
}
```

---

## 3. 주입 방식 — 무엇을 쓸까

### 생성자 주입 (권장, 사실상 표준)

```java
@Service
@RequiredArgsConstructor  // Lombok 사용 시
public class UserService {
    private final UserRepository userRepository;
}
```

장점:

- `final`로 불변성 보장
- 순환 의존성을 초기에 발견
- 테스트에서 목 객체를 생성자로 넣기 쉬움

### 필드 주입 (비권장)

```java
@Autowired
private UserRepository userRepository; // 테스트·불변성 약함
```

### Setter 주입

선택적 의존성일 때만 드물게 사용.

---

## 4. `@Configuration`과 `@Bean`

```java
@Configuration
public class AppConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    ObjectMapper objectMapper() {
        return JsonMapper.builder()
                .addModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }
}
```

`@Configuration`은 CGLIB 프록시로 `@Bean` 메서드 간 호출을 싱글톤으로 보장한다.  
가벼운 설정만 필요하면 `@Configuration(proxyBeanMethods = false)` (Lite mode)를 쓰면 기동이 빨라진다.

---

## 5. 스코프

| Scope | 설명 |
|-------|------|
| `singleton` (기본) | 컨테이너당 1개 |
| `prototype` | 요청마다 새 인스턴스 |
| `request` | HTTP 요청당 1개 |
| `session` | HTTP 세션당 1개 |

```java
@Bean
@Scope("prototype")
public ReportBuilder reportBuilder() {
    return new ReportBuilder();
}
```

대부분의 서비스/리포지토리는 **singleton**이면 충분하다. 상태를 필드에 두지 말 것.

---

## 6. 조건부 Bean (실무에서 자주 씀)

```java
@Bean
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
MailSender mailSender(MailProperties props) {
    return new SmtpMailSender(props);
}

@Bean
@ConditionalOnMissingBean(MailSender.class)
MailSender noopMailSender() {
    return new NoopMailSender();
}
```

기타:

- `@ConditionalOnClass`
- `@ConditionalOnWebApplication`
- `@Profile("local")`

```java
@Service
@Profile("!prod")
public class FakePaymentClient implements PaymentClient { ... }
```

---

## 7. `@ConfigurationProperties` (하드코딩 설정 금지)

```java
@ConfigurationProperties(prefix = "app.payment")
public record PaymentProperties(
        String baseUrl,
        Duration timeout,
        int maxRetries
) {}
```

```yaml
app:
  payment:
    base-url: https://pay.example.com
    timeout: 3s
    max-retries: 2
```

```java
@Configuration
@EnableConfigurationProperties(PaymentProperties.class)
public class PaymentConfig {

    @Bean
    PaymentClient paymentClient(PaymentProperties props, RestClient.Builder builder) {
        return new HttpPaymentClient(
                builder.baseUrl(props.baseUrl())
                        .build(),
                props
        );
    }
}
```

Boot 3에서는 **record + `@ConfigurationProperties`** 조합이 깔끔하다.  
IDE 자동완성을 위해 `spring-boot-configuration-processor`를 annotationProcessor로 추가하면 좋다.

---

## 8. 인터페이스 기반 설계

```java
public interface NotificationPort {
    void send(String to, String message);
}

@Service
public class EmailNotificationAdapter implements NotificationPort { ... }
```

테스트:

```java
@SpringBootTest
@Import(TestNotificationConfig.class)
class OrderServiceIT { ... }
```

의존성을 구현체가 아닌 **포트(인터페이스)** 에 두면 교체·테스트가 쉬워진다.

---

## 9. 순환 의존성

Boot 2에서는 경고, Boot 3에서는 **기본적으로 금지**에 가깝다.

해결:

1. 설계 분리 (공통 로직을 제3 서비스로)
2. 이벤트(`ApplicationEventPublisher`)로 결합도 낮추기
3. `@Lazy`는 최후 수단

---

## 10. 생명주기 콜백

```java
@Component
public class CacheWarmer {

    @PostConstruct
    void warm() {
        // 기동 직후
    }

    @PreDestroy
    void shutdown() {
        // 종료 직전
    }
}
```

또는:

```java
@Bean(initMethod = "start", destroyMethod = "stop")
MyWorker myWorker() { return new MyWorker(); }
```

리소스 정리는 `destroyMethod` / `@PreDestroy` / `DisposableBean`을 명확히.

---

## 11. 최신 기법 요약

- 생성자 주입 + `final`이 기본
- 설정은 `@ConfigurationProperties`로 타입 세이프하게
- 외부 연동 Bean은 `@Configuration`에서 조립
- `@Profile` / `@ConditionalOn*`으로 환경별 구현 교체
- 순환 참조는 구조로 해결
- Lite `@Configuration(proxyBeanMethods = false)`로 기동 최적화 가능

---

## 연습

1. `AppProperties(record)`를 만들고 `app.greeting` 값을 주입받아 API로 반환한다.
2. `Clock` Bean을 등록하고 서비스에서 “지금 시각”을 출력한다. 테스트에서는 고정 `Clock`으로 교체한다.
3. `local` 프로필에만 동작하는 `DevBanner` 컴포넌트를 만든다.

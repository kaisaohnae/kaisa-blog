---
slug: spring-boot-01
order: 1
category: spring-boot
categoryLabel: Spring Boot
title: "Spring Boot 3와 Java 21 시작하기"
summary: "Spring Boot 3.x + Java 17/21 기준으로 프로젝트를 올바르게 세팅하고, 최신 생태계의 기본 개념을 잡는다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# Spring Boot 3와 Java 21 시작하기

> 요약: Spring Boot 3.x + Java 17/21 기준으로 프로젝트를 올바르게 세팅하고, 최신 생태계의 기본 개념을 잡는다.

---

---

## 1. 왜 지금 Spring Boot인가

Spring Boot는 **관례 기반(Convention over Configuration)** 으로 애플리케이션을 빠르게 기동하고, 운영에 필요한 기능을 starter로 조합하는 프레임워크다.

2022년 이후의 큰 변화:

| 항목 | Spring Boot 2.x | Spring Boot 3.x |
|------|-----------------|-----------------|
| Java | 8+ | **17 필수**, 21 권장 |
| Jakarta EE | `javax.*` | **`jakarta.*`** |
| 기본 서블릿 | Servlet 4 | Servlet 5/6 |
| Native | 실험적 | GraalVM Native 정식 |
| Observability | Micrometer 1.x | Micrometer 1.x + Observation API |

실무에서는 **Java 21 LTS + Spring Boot 3.3~3.4+** 조합을 기본선으로 잡는 것이 일반적이다.

---

## 2. 프로젝트 생성 (권장 방법)

### 2.1 start.spring.io

[https://start.spring.io](https://start.spring.io)에서:

- **Project**: Maven 또는 Gradle (Kotlin DSL 권장하는 팀도 많음)
- **Language**: Java
- **Spring Boot**: 최신 안정 버전
- **Packaging**: Jar
- **Java**: 21
- **Dependencies** (최소 세트):
  - Spring Web
  - Spring Data JPA
  - Validation
  - Lombok (선택 — 팀 합의 후)
  - H2 / PostgreSQL Driver

### 2.2 CLI

```bash
# Spring Boot CLI 또는 curl로 생성
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.4.0 \
  -d javaVersion=21 \
  -d dependencies=web,data-jpa,validation,h2 \
  -o demo.zip
```

### 2.3 IDE

IntelliJ IDEA / VS Code / Cursor 모두 start.spring.io 연동 또는 로컬 템플릿으로 생성 가능.

---

## 3. 표준 디렉터리 구조

```
src/main/java/com/example/demo/
├── DemoApplication.java          # @SpringBootApplication
├── config/                       # @Configuration, Bean 정의
├── domain/                       # 엔티티, 도메인 서비스
├── application/                  # 유스케이스 / 애플리케이션 서비스
├── adapter/
│   ├── web/                      # Controller, DTO
│   ├── persistence/              # JPA Repository 구현
│   └── external/                 # 외부 API 클라이언트
└── common/                       # 예외, 유틸

src/main/resources/
├── application.yml
├── application-local.yml
├── application-prod.yml
└── db/migration/                 # Flyway/Liquibase (권장)
```

> 팁: 패키지를 `controller/service/repository`로만 나누는 것보다, **도메인/어댑터(헥사고날)** 방향으로 조금씩 옮기면 규모가 커져도 유지보수가 수월하다.

---

## 4. `@SpringBootApplication`이 하는 일

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

내부적으로 다음이 합쳐진 메타 어노테이션이다.

1. `@SpringBootConfiguration` — 설정 클래스
2. `@EnableAutoConfiguration` — classpath 기반 자동 구성
3. `@ComponentScan` — 현재 패키지 이하 컴포넌트 스캔

자동 구성은 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`에 등록된 클래스들이 조건을 만족할 때 활성화된다.

---

## 5. 설정: `application.yml` 모범 사례

```yaml
spring:
  application:
    name: demo
  profiles:
    active: local

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      probes:
        enabled: true   # k8s liveness/readiness

logging:
  level:
    root: INFO
    com.example.demo: DEBUG
```

### 프로파일 분리

| 파일 | 용도 |
|------|------|
| `application.yml` | 공통 |
| `application-local.yml` | 로컬 DB, 상세 로그 |
| `application-test.yml` | 테스트 |
| `application-prod.yml` | 운영 (시크릿은 환경변수/시크릿 매니저) |

시크릿은 파일에 넣지 말고:

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
```

---

## 6. Java 21에서 특히 유용한 문법

Spring Boot 3 코드베이스에서 자주 쓰이는 현대 Java 기능:

### Record (DTO에 최적)

```java
public record CreateUserRequest(String email, String name) {}
public record UserResponse(Long id, String email, String name) {}
```

### Sealed class (도메인 이벤트/결과 타입)

```java
public sealed interface PaymentResult
    permits PaymentResult.Success, PaymentResult.Failed {

    record Success(String transactionId) implements PaymentResult {}
    record Failed(String reason) implements PaymentResult {}
}
```

### Pattern matching / switch

```java
String message = switch (result) {
    case PaymentResult.Success s -> "OK: " + s.transactionId();
    case PaymentResult.Failed f -> "FAIL: " + f.reason();
};
```

### Virtual Threads (Spring Boot 3.2+)

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

블로킹 I/O가 많은 REST/JDBC 서비스에서 처리량을 크게 올릴 수 있다. (Virtual Threads 문서 참고)

---

## 7. 첫 API 한 줄로 이해하기

```java
@RestController
@RequestMapping("/api/hello")
public class HelloController {

    @GetMapping
    public Map<String, String> hello() {
        return Map.of("message", "Hello, Spring Boot 3");
    }
}
```

실행 후:

```bash
curl http://localhost:8080/api/hello
```

---

## 8. 빌드 & 실행

### Maven

```bash
./mvnw spring-boot:run
./mvnw -DskipTests package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### Gradle

```bash
./gradlew bootRun
./gradlew bootJar
java -jar build/libs/demo-0.0.1-SNAPSHOT.jar
```

---

## 9. 최신 기법 체크리스트

- [ ] Java 21 LTS 사용
- [ ] `javax.*` → `jakarta.*` 마이그레이션 완료
- [ ] YAML + 프로파일 + 환경변수로 설정 분리
- [ ] Actuator health/probes 활성화
- [ ] DTO는 record 우선 검토
- [ ] 패키지 구조를 도메인 중심으로 설계
- [ ] Virtual Threads 도입 여부 검토 (I/O 바운드 서비스)

---

## 연습

1. start.spring.io로 Web + Validation + Actuator 프로젝트를 만든다.
2. `GET /api/health-demo` 엔드포인트를 추가하고 record로 응답한다.
3. `local` / `prod` 프로파일을 나누고, `prod`에서는 로그 레벨을 INFO로 맞춘다.
4. Actuator `/actuator/health`가 200을 반환하는지 확인한다.

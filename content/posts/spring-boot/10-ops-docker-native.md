---
slug: spring-boot-10
order: 10
category: spring-boot
categoryLabel: Spring Boot
title: "운영 배포 — Docker, 설정, Native Image, 프로덕션 체크리스트"
summary: "로컬에서 잘 되는 앱을 안전하게 빌드·배포·운영하는 최신 기본기를 정리한다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# 운영 배포 — Docker, 설정, Native Image, 프로덕션 체크리스트

> 요약: 로컬에서 잘 되는 앱을 안전하게 빌드·배포·운영하는 최신 기본기를 정리한다.

---

---

## 1. 12-Factor에 가까운 Spring Boot

| 원칙 | 적용 |
|------|------|
| 설정 분리 | env / Secret / Config Server / 클라우드 설정 |
| 백엔드 서비스 | URL로 연결 (DB, Redis, Kafka) |
| 로그 | stdout/stderr (사이드카/에이전트가 수집) |
| 폐기 가능 | graceful shutdown |
| 포트 바인딩 | `SERVER_PORT` |

```yaml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

---

## 2. 설정·시크릿

하지 말 것:

- `application-prod.yml`에 DB 비밀번호 커밋
- 이미지에 시크릿 베이크인

할 것:

- 환경변수, Kubernetes Secret, AWS Secrets Manager, Vault 등
- 프로파일은 `SPRING_PROFILES_ACTIVE=prod`
- 민감 설정은 부팅 시 없으면 **실패**하게 (잘못된 기본값으로 기동 금지)

Spring Cloud Config / Consul / Kubernetes ConfigMap은 팀 인프라에 맞게 선택.

---

## 3. Dockerfile (효율적인 멀티스테이지)

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY . .
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D spring
USER spring
COPY --from=build /workspace/target/demo-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-jar","/app/app.jar"]
```

개선 팁:

- **Layered JAR**로 의존성 레이어 캐시 → 이미지 빌드/배포 가속
- distroless / chiseled 이미지로 공격면 축소
- non-root 사용자로 실행

### Layertools 예시

```bash
java -Djarmode=layertools -jar app.jar extract
```

Dockerfile에서 `dependencies` → `spring-boot-loader` → `application` 순으로 COPY.

---

## 4. Docker Compose (로컬 통합)

```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: local
      DB_URL: jdbc:postgresql://db:5432/demo
      DB_USER: demo
      DB_PASSWORD: demo
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: demo
      POSTGRES_USER: demo
      POSTGRES_PASSWORD: demo
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U demo"]
      interval: 5s
      timeout: 5s
      retries: 5
```

---

## 5. Kubernetes 최소 스펙 포인트

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8081
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8081
resources:
  requests:
    cpu: "250m"
    memory: "512Mi"
  limits:
    memory: "768Mi"
```

- readiness 실패 → 트래픽 차단
- liveness 실패 → 컨테이너 재시작
- 메모리 limit 없이 JVM만 올리면 OOMKill 위험이 크다

---

## 6. CI/CD 파이프라인 골격

1. 테스트 (단위 + Testcontainers IT)
2. 정적 분석 (SpotBugs, Checkstyle, Spotless)
3. SCA (의존성 취약점: Trivy, Dependabot, Snyk)
4. 이미지 빌드·서명·스캔
5. 스테이징 배포 → 스모크 테스트
6. 프로덕션 (카나리/블루그린)

`main`에 직접 푸시보다 PR + 필수 체크가 안전하다.

---

## 7. GraalVM Native Image

Boot 3는 Native 지원이 정식이다.

```bash
./mvnw -Pnative native:compile
```

장점:

- 매우 빠른 기동
- 낮은 메모리

비용:

- 빌드 시간·복잡도 증가
- 리플렉션/프록시 설정 필요 가능
- 일부 라이브러리 비호환

서버리스·스케일-to-zero, CLI, 사이드카에 특히 매력적.  
상시 트래픽 큰 모놀리스는 JVM + CDS/AppCDS나 일반 최적화로도 충분한 경우가 많다.

---

## 8. 로깅·감사·컴플라이언스

- 액세스 로그 / 감사 로그 분리
- PII 마스킹
- 보존 기간 정책
- 시간대: 서버는 UTC, 표시만 로컬

---

## 9. 프로덕션 체크리스트

### 보안

- [ ] 최신 패치된 Base Image / JDK
- [ ] Actuator·Swagger 노출 최소화
- [ ] 시크릿 미커밋
- [ ] HTTPS / 안전한 CORS
- [ ] 의존성 취약점 스캔

### 신뢰성

- [ ] graceful shutdown
- [ ] DB 마이그레이션(Flyway) 자동화
- [ ] 타임아웃·재시도·서킷브레이커
- [ ] 헬스 프로브 분리
- [ ] 백업·복구 훈련 (DB)

### 관측

- [ ] 메트릭 + 알람 (5xx, p99, DB 풀)
- [ ] 트레이스 샘플링
- [ ] 구조화 로그 + traceId
- [ ] 대시보드·런북

### 성능

- [ ] 부하 테스트 결과 문서화
- [ ] 커넥션 풀·JVM 메모리 검증
- [ ] 캐시/인덱스 점검

---

## 문서 목록

| 주제 | 한 줄 |
|------|------|
| Boot 3 + Java 21 | 프로젝트·프로파일·현대 Java |
| IoC / Bean | 생성자 주입·타입세이프 설정 |
| REST | Validation·ProblemDetail·RestClient |
| JPA | 트랜잭션·N+1·Flyway |
| Security 6 | FilterChain·JWT/OAuth2 |
| Test | 슬라이스·Testcontainers |
| Observability | Actuator·Micrometer·OTel |
| Async | Virtual Threads·이벤트·Kafka |
| Resilience | 캐시·Resilience4j·성능 |
| Ops | Docker·K8s·Native·체크리스트 |

---

## 종합 연습

1. 01~09에서 만든 샘플 API를 Dockerfile로 이미지화한다.
2. Compose로 app + Postgres를 띄운다.
3. Actuator health가 healthy인지 확인한다.
4. 프로덕션 체크리스트를 자신의 앱에 적용해 통과/미통과를 표시한다.
5. (선택) Native Image 빌드 후 기동 시간을 JVM jar와 비교한다.

---

## 정리

Spring Boot의 최신 기법은 “새 어노테이션 암기”보다 **운영 가능한 기본기**에 가깝다.

- 명확한 API 계약과 에러
- 안전한 트랜잭션·스키마 관리
- 측정 가능한 시스템
- 실패를 전제로 한 타임아웃/격리
- 재현 가능한 빌드·배포

이 문서들을 바탕으로, 팀 도메인에 맞게 깊이를 더하면 실무 Spring Boot 역량이 빠르게 쌓인다.

추가로 파고들 주제: Spring Authorization Server, Spring Modulith, Spring Batch, R2DBC, Spring Cloud Gateway, GraalVM 심화, ArchUnit 기반 아키텍처 테스트.

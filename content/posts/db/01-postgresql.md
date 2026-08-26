---
slug: db-01
order: 1
category: db
categoryLabel: DB
title: "PostgreSQL: 관계형 DB의 실무 기본선"
summary: "트랜잭션·인덱스·JSON·확장까지, 웹/API 백엔드에서 PostgreSQL을 고르는 이유와 운영 기본을 정리한다."
publishedAt: 2026-08-26
tags: ["db"]
---

# PostgreSQL: 관계형 DB의 실무 기본선

> 요약: 트랜잭션·인덱스·JSON·확장까지, 웹/API 백엔드에서 PostgreSQL을 고르는 이유와 운영 기본을 정리한다.

---

## 1. 언제 PostgreSQL인가

| 맞는 경우 | 덜 맞는 경우 |
|-----------|--------------|
| 관계·제약·트랜잭션이 중요 | 초단순 키-값만 필요 |
| SQL 분석·리포팅 | 극단적 수평 샤딩만 목표 |
| JSON과 관계를 함께 | 문서만 무제한 스키마리스 |

오픈소스 관계형 DB 중 **기능·표준 SQL·확장성** 균형이 좋아 기본선으로 자주 고른다.

---

## 2. 핵심 개념

- **ACID 트랜잭션**: `BEGIN` / `COMMIT` / `ROLLBACK`
- **스키마·제약**: PK, FK, UNIQUE, CHECK
- **인덱스**: B-tree 기본, 부분·표현식 인덱스
- **JSONB**: 문서형 필드를 관계형 안에 섞을 때

```sql
CREATE TABLE orders (
  id           bigserial PRIMARY KEY,
  user_id      bigint NOT NULL REFERENCES users(id),
  payload      jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_user_id_idx ON orders (user_id);
CREATE INDEX orders_payload_gin ON orders USING gin (payload);
```

---

## 3. 운영 포인트

- 연결: 풀 크기 = 앱 인스턴스 × 커넥션 (과다 연결 주의)
- `EXPLAIN (ANALYZE, BUFFERS)`로 슬로우 쿼리
- 백업: `pg_dump` / 연속 WAL(운영 등급)
- 마이그레이션 도구(Flyway, Prisma migrate 등)로 스키마 변경

---

## 4. 확장 맛보기

| 확장 | 용도 |
|------|------|
| `uuid-ossp` / `pgcrypto` | UUID·암호 |
| `pg_trgm` | 유사 문자열 검색 |
| PostGIS | 지리 정보 |

---

## 정리

PostgreSQL은 “그냥 SQL DB”가 아니라 **관계 + JSON + 확장**을 한 엔진에서 다루는 기본선이다.

---
slug: db-02
order: 2
category: db
categoryLabel: DB
title: "MySQL: 웹 서비스에서 가장 흔한 관계형 DB"
summary: "InnoDB·문자셋·인덱스·레플리케이션 관점에서 MySQL(MariaDB 계열 포함) 실무 기본을 정리한다."
publishedAt: 2026-08-26
tags: ["db"]
---

# MySQL: 웹 서비스에서 가장 흔한 관계형 DB

> 요약: InnoDB·문자셋·인덱스·레플리케이션 관점에서 MySQL(MariaDB 계열 포함) 실무 기본을 정리한다.

---

## 1. 언제 MySQL인가

- LAMP/워드프레스·레거시 웹 스택
- 읽기 위주·단순 CRUD가 많은 서비스
- 호스팅·관리형(RDS MySQL 등) 접근성이 중요할 때

MariaDB는 호환 계열로 함께 언급되는 경우가 많다. 엔진·SQL 방언 차이는 버전별로 확인한다.

---

## 2. 엔진과 문자셋

| 항목 | 권장 |
|------|------|
| 스토리지 엔진 | **InnoDB** (트랜잭션·FK) |
| 문자셋 | `utf8mb4` |
| 콜레이션 | 팀 표준 (예: `utf8mb4_unicode_ci`) |

`utf8`(3바이트)와 `utf8mb4`를 혼동하면 이모지·일부 문자에서 깨진다.

```sql
CREATE TABLE posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  KEY posts_created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. 인덱스·쿼리

- PK/UK를 명확히
- `WHERE` / `JOIN` 컬럼 인덱스
- `SELECT *`·함수로 컬럼 감싸기(인덱스 무력화) 주의
- `EXPLAIN`으로 type / rows / Extra 확인

---

## 4. 운영

- 바이너리 로그 + 백업(덤프/스냅샷)
- 읽기 레플리카(필요 시)
- `max_connections`, 버퍼 풀 크기 모니터링
- 마이그레이션 시 락·온라인 DDL 전략

---

## 정리

MySQL은 익숙함과 생태계가 강점이다. **InnoDB + utf8mb4 + 인덱스 설계**만 지켜도 실수 대부분이 줄어든다.

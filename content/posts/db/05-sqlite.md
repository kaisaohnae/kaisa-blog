---
slug: db-05
order: 5
category: db
categoryLabel: DB
title: "SQLite: 파일 하나로 충분한 임베디드 SQL"
summary: "서버 없이 파일 기반 SQL이 필요한 앱·도구·프로토타입에서 SQLite를 쓰는 기준과 한계를 정리한다."
publishedAt: 2026-08-26
tags: ["db"]
---

# SQLite: 파일 하나로 충분한 임베디드 SQL

> 요약: 서버 없이 파일 기반 SQL이 필요한 앱·도구·프로토타입에서 SQLite를 쓰는 기준과 한계를 정리한다.

---

## 1. 언제 SQLite인가

| 맞는 경우 | 아닌 경우 |
|-----------|-----------|
| 단일 서버·로컬 앱 | 다중 서버가 동시에 같은 DB 파일에 쓰기 |
| 프로토타입·CLI·모바일 | 높은 동시 쓰기 TPS |
| 읽기 위주 소규모 서비스 | 운영급 HA·페일오버 필요 |
| 테스트·임베디드 | 중앙 관리형 멀티테넌트 DB |

“서버 설치 없이 SQL”이 필요하면 최우선 후보다.

---

## 2. 기본 사용

```bash
sqlite3 app.db
```

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

- **WAL** 모드는 읽기/쓰기 동시성에 유리한 경우가 많다
- 타입은 동적이나, 앱에서 규약을 지키는 편이 안전

---

## 3. 동시성·배포

- 쓰기는 기본적으로 한 연결(파일 락)
- 서버리스/다중 인스턴스가 같은 파일을 쓰면 깨지기 쉽다
- 백업은 파일 복사 전 `sqlite3 .backup` 또는 VACUUM INTO
- 컨테이너라면 볼륨에 DB 파일을 둔다

---

## 4. 생태계

- 모바일(iOS/Android), 브라우저(wasm), 데스크톱
- ORM/도구: Prisma, Drizzle, sqlx 등에서 지원하는 경우 많음
- Litestream 등으로 복제·백업을 보강하는 운영도 가능

---

## 정리

SQLite는 작은 DB가 아니라 **임베디드 관계형 엔진**이다. 경계(단일 쓰기·파일 위치)만 지키면 운영이 매우 단순해진다.

---
slug: db-03
order: 3
category: db
categoryLabel: DB
title: "MongoDB: 문서형 DB로 유연한 스키마 다루기"
summary: "컬렉션·도큐먼트·인덱스·트랜잭션 경계를 기준으로 MongoDB가 맞는 워크로드와 설계 주의를 정리한다."
publishedAt: 2026-08-26
tags: ["db"]
---

# MongoDB: 문서형 DB로 유연한 스키마 다루기

> 요약: 컬렉션·도큐먼트·인덱스·트랜잭션 경계를 기준으로 MongoDB가 맞는 워크로드와 설계 주의를 정리한다.

---

## 1. 언제 MongoDB인가

| 맞는 경우 | 조심할 경우 |
|-----------|-------------|
| 문서 구조가 자주 변함 | 강한 조인·정규화가 핵심 |
| 수평 확장·샤딩 전제 | 단순 키-값만 (Redis가 나을 수 있음) |
| 읽기 패턴이 문서 단위 | 복잡한 다테이블 트랜잭션 중심 |

“SQL이 싫어서”만으로 고르면 나중에 조인·일관성에서 비용이 커진다.

---

## 2. 기본 모델

```js
// posts 컬렉션
{
  _id: ObjectId("…"),
  title: "제목",
  tags: ["db", "mongodb"],
  author: { id: "u1", name: "Ada" },
  createdAt: ISODate("2026-08-26T00:00:00Z")
}
```

- 자주 함께 읽는 데이터는 **임베드**
- 커지거나 독립 수명주기면 **참조**
- 배열·중첩이 커질수록 문서 500KB~MB 상한을 의식

---

## 3. 인덱스·쿼리

```js
db.posts.createIndex({ tags: 1, createdAt: -1 })
db.posts.find({ tags: "mongodb" }).sort({ createdAt: -1 }).limit(20)
```

- 쿼리 패턴에 맞춰 인덱스
- `explain("executionStats")`
- 멀티키·TTL·텍스트 인덱스 용도를 구분

---

## 4. 트랜잭션·운영

- 단일 문서 갱신은 원자적
- 멀티 도큐먼트 트랜잭션은 가능하지만 **비용·제약**을 알고 쓴다
- 레플리카 셋이 운영 기본
- 스키마 검증(Schema Validation)으로 “완전 자유”를 완화

---

## 정리

MongoDB는 유연함이 무기이지만, **읽기 패턴에 맞는 문서 설계·인덱스** 없이 쓰면 관계형보다 더 아프다.

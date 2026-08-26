---
slug: aws-05
order: 5
category: aws
categoryLabel: AWS
title: "RDS로 관리형 데이터베이스 운영하기"
summary: "엔진 선택, 서브넷 그룹, 백업·멀티 AZ까지 RDS를 안전하게 올리는 체크포인트를 정리한다."
publishedAt: 2026-08-26
tags: ["aws"]
---

# RDS로 관리형 데이터베이스 운영하기

> 요약: 엔진 선택, 서브넷 그룹, 백업·멀티 AZ까지 RDS를 안전하게 올리는 체크포인트를 정리한다.

---

## 1. 언제 RDS인가

직접 EC2에 DB를 올리는 것보다 **패치·백업·페일오버**를 AWS에 맡길 때 RDS가 맞다.

| 엔진 | 흔한 선택 |
|------|-----------|
| PostgreSQL | 일반 웹/API |
| MySQL / MariaDB | 레거시·워드프레스 |
| Aurora | 확장·고가용 요구 |

---

## 2. 네트워크

- DB는 **프라이빗 서브넷**
- SG: 앱 티어 SG에서만 포트 허용
- 퍼블릭 액세스: 기본적으로 끔

로컬에서 붙을 때는 배스천/SSM 포트포워딩 또는 VPN을 쓴다. `0.0.0.0/0`으로 3306/5432를 열지 않는다.

---

## 3. 운영 기본값

- 자동 백업 켜기 (보존 기간 합의)
- 스토리지 자동 확장 검토
- 파라미터 그룹·옵션 그룹 문서화
- 멀티 AZ: 프로덕션 권장

```bash
aws rds describe-db-instances --query "DBInstances[].{id:DBInstanceIdentifier,az:AvailabilityZone,multi:MultiAZ}"
```

---

## 4. 비용·성능

- 인스턴스 클래스보다 먼저 **커넥션·인덱스·슬로우 쿼리**
- 개발은 작은 클래스 + 스케줄 중지(가능 시)
- 스냅샷이 쌓이면 비용도 쌓인다

---

## 정리

RDS는 “DB 설치”가 아니라 **프라이빗 배치 · SG · 백업 · 멀티 AZ**를 세트로 계약하는 일이다.

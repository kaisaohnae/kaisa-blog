---
slug: aws-04
order: 4
category: aws
categoryLabel: AWS
title: "S3 버킷·접근 제어·수명주기"
summary: "퍼블릭 차단, 버킷 정책·IAM, 버전관리·수명주기로 안전한 오브젝트 스토리지 운영 기준을 잡는다."
publishedAt: 2026-08-26
tags: ["aws"]
---

# S3 버킷·접근 제어·수명주기

> 요약: 퍼블릭 차단, 버킷 정책·IAM, 버전관리·수명주기로 안전한 오브젝트 스토리지 운영 기준을 잡는다.

---

## 1. S3의 위치

S3는 무제한에 가까운 **오브젝트 스토리지**다. 정적 웹, 백업, 로그, 데이터 레이크에 쓴다.

기본 원칙:

- **Block Public Access** 유지
- 퍼블릭 웹이 필요하면 CloudFront + OAC
- 암호화(SSE-S3 또는 SSE-KMS)

---

## 2. 권한 모델

| 방식 | 용도 |
|------|------|
| IAM 정책 | 누가(역할/사용자) 무엇을 |
| 버킷 정책 | 이 버킷에 대한 리소스 정책 |
| ACL | 레거시. 신규는 비권장 |

앱은 **IAM 역할**로 `s3:GetObject` / `PutObject`만 연다. 와일드카드 `*` 버킷은 피한다.

---

## 3. 버전관리·수명주기

- Versioning: 실수 삭제·덮어쓰기 복구
- Lifecycle: 오래된 버전 → Glacier / 삭제
- Replication: 재해 복구(필요 시)

```json
{
  "Rules": [{
    "ID": "expire-old-logs",
    "Status": "Enabled",
    "Filter": { "Prefix": "logs/" },
    "Expiration": { "Days": 90 }
  }]
}
```

---

## 4. 자주 하는 실수

- 개발 편의로 퍼블릭 읽기 오픈
- 액세스 키를 프론트에 심기
- 버킷 이름을 추측 가능하게 만들고 민감 파일 방치

---

## 정리

S3는 편하지만 **퍼블릭 차단 + 최소 IAM + 수명주기** 세 가지를 기본값으로 둔다.

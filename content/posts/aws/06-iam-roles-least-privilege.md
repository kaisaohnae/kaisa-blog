---
slug: aws-06
order: 6
category: aws
categoryLabel: AWS
title: "IAM 역할과 최소 권한 설계"
summary: "사용자·역할·정책을 구분하고, 인스턴스/서비스가 맡는 권한을 최소 권한으로 설계하는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["aws"]
---

# IAM 역할과 최소 권한 설계

> 요약: 사용자·역할·정책을 구분하고, 인스턴스/서비스가 맡는 권한을 최소 권한으로 설계하는 방법을 정리한다.

---

## 1. 핵심 용어

| 용어 | 의미 |
|------|------|
| User | 사람(또는 장기 자격) |
| Role | 맡길 수 있는 임시 권한 세트 |
| Policy | Allow/Deny 문서 |
| STS | 임시 자격 발급 |

장기 액세스 키보다 **역할 Assume**이 기본선이다.

---

## 2. 누가 역할을 맡나

- EC2 / ECS Task / Lambda → 실행 역할
- CI (GitHub Actions 등) → OIDC로 역할 Assume
- 사람 → SSO 또는 역할 전환

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::my-app-assets/*"
}
```

`Resource`와 `Action`을 좁히는 것이 최소 권한의 전부다.

---

## 3. 실무 팁

- 관리형 정책은 시작용. 나중에 고객 관리형으로 축소
- `*` 리소스 + `iam:*` 조합은 사고 대기
- Condition(`aws:RequestedRegion`, IP, MFA)으로 한 겹 더
- Access Analyzer·IAM Access Advisor로 안 쓰는 권한 제거

---

## 4. 분리

- 개발/스테이징/프로덕션 계정 분리(가능하면)
- 같은 계정이면 태그·권한 경계(Permissions Boundary)

---

## 정리

IAM은 기능이 아니라 **경계**다. “일단 Admin”을 없애는 순간부터 운영이 안정된다.

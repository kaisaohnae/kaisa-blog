---
slug: aws-01
order: 1
category: aws
categoryLabel: AWS
title: "AWS 계정·IAM·빌링 기초 잡기"
summary: "루트 계정 보호, IAM 사용자·MFA, 비용 알람까지 AWS를 안전하게 시작하는 최소 세팅을 정리한다."
publishedAt: 2026-08-26
tags: ["aws"]
---

# AWS 계정·IAM·빌링 기초 잡기

> 요약: 루트 계정 보호, IAM 사용자·MFA, 비용 알람까지 AWS를 안전하게 시작하는 최소 세팅을 정리한다.

---

## 1. 먼저 지킬 것

AWS는 권한만 열리면 비용·데이터가 바로 열린다. 첫 주는 **계정 보안 + 비용 가시성**이 우선이다.

| 항목 | 권장 |
|------|------|
| 루트 | 일상 작업에 쓰지 않음 |
| MFA | 루트·관리자 IAM 모두 필수 |
| 액세스 키 | 루트에 발급하지 않음 |
| 예산 | Billing 알람(예: $10/$50) |

---

## 2. 루트 vs IAM

- **루트**: 계정 소유자. 결제·계정 닫기 등 제한된 작업만.
- **IAM 사용자/역할**: 일상 개발·운영. 최소 권한 원칙.

실무 기본 흐름:

1. 루트에 MFA 설정
2. 관리자용 IAM 사용자 생성 + MFA
3. 이후 콘솔·CLI는 IAM만 사용

---

## 3. IAM 그룹으로 권한 묶기

사용자를 그룹에 넣고, 그룹에 정책을 붙인다.

예:

- `Developers` → 읽기 + 제한된 배포 권한
- `Ops` → CloudWatch, EC2 운영
- `BillingViewers` → 비용 조회만

`AdministratorAccess`를 개인에게 바로 다는 습관은 피한다. 필요하면 짧은 시간·별도 역할로.

---

## 4. CLI 프로필

```bash
aws configure --profile work
aws sts get-caller-identity --profile work
```

`~/.aws/credentials`와 `config`에 프로필을 나눠 두면 계정·환경을 섞지 않기 쉽다.

---

## 5. 비용 알람

Billing → Budgets / Cost Explorer에서:

- 월 예산 알림
- 이상 비용(Anomaly) 감지
- 태그 전략(예: `Project`, `Env`)을 처음부터 합의

프리 티어·크레딧이 있어도 **알람 없이 방치하지 않는다.**

---

## 정리

AWS 시작의 정답은 서비스 개수가 아니라 **루트 보호 · IAM · 비용 알람** 세 줄이다.

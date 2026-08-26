---
slug: aws-03
order: 3
category: aws
categoryLabel: AWS
title: "EC2 인스턴스 기초와 운영 포인트"
summary: "AMI·인스턴스 타입·키페어·스토리지까지 EC2를 올리고 안전하게 접속·운영하는 기본을 정리한다."
publishedAt: 2026-08-26
tags: ["aws"]
---

# EC2 인스턴스 기초와 운영 포인트

> 요약: AMI·인스턴스 타입·키페어·스토리지까지 EC2를 올리고 안전하게 접속·운영하는 기본을 정리한다.

---

## 1. EC2 선택 체크리스트

| 항목 | 고민 |
|------|------|
| AMI | Amazon Linux 2023 / Ubuntu LTS |
| 타입 | `t3.micro` 실험, 부하는 측정 후 |
| 스토리지 | gp3, 암호화 기본 |
| 네트워크 | 프라이빗 서브넷 + SSM 권장 |
| IAM 역할 | 인스턴스 프로필로 권한 부여 |

SSH 키를 인터넷에 계속 열어두는 구성보다 **Systems Manager Session Manager**를 우선 검토한다.

---

## 2. 최소 생성 흐름

1. IAM 역할: `AmazonSSMManagedInstanceCore` 등
2. 보안 그룹: 필요한 포트만
3. 유저 데이터로 패키지/에이전트 설치(선택)
4. 태그: `Name`, `Env`, `Owner`

```bash
aws ec2 describe-instances --filters Name=tag:Env,Values=dev
```

---

## 3. 스토리지

- **EBS**: 인스턴스에 붙는 블록. 스냅샷으로 백업.
- **인스턴스 스토어**: 휘발성. 중요 데이터 금지.

스냅샷 수명주기(DLM)를 초기에 걸어 두면 사고 대응이 쉬워진다.

---

## 4. 운영에서 자주 하는 일

- CPU/메모리 알람
- 오토스케일 전에 단일 인스턴스 헬스체크
- 변경은 AMI 또는 구성 관리(이미지 베이킹)로 재현

---

## 정리

EC2는 “서버 한 대”가 아니라 **역할·SG·스토리지·접속 경로**를 세트로 설계한다.

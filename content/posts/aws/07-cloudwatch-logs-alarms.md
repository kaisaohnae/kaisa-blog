---
slug: aws-07
order: 7
category: aws
categoryLabel: AWS
title: "CloudWatch 로그·메트릭·알람"
summary: "로그 수집, 핵심 메트릭, 알람·대시보드로 “이상할 때 알려주는” 관측 기본선을 만든다."
publishedAt: 2026-08-26
tags: ["aws"]
---

# CloudWatch 로그·메트릭·알람

> 요약: 로그 수집, 핵심 메트릭, 알람·대시보드로 “이상할 때 알려주는” 관측 기본선을 만든다.

---

## 1. 관측의 최소 세트

| 신호 | 예 |
|------|-----|
| 메트릭 | CPU, 5xx, latency |
| 로그 | 앱/ALB/RDS 로그 |
| 알람 | 임계값 → SNS/Slack |
| 대시보드 | 한 화면 요약 |

모니터링 없이 스케일만 키우면 비용만 는다.

---

## 2. 로그

- 앱 → CloudWatch Logs 에이전트 / 사이드카
- 보존 기간을 정한다 (무기한은 비용)
- 민감정보(토큰·PII) 마스킹

로그 그룹 이름 규칙 예: `/app/${env}/${service}`

---

## 3. 알람 예시

- ALB `HTTPCode_Target_5XX_Count` > 0 (평가 기간 합의)
- RDS `FreeStorageSpace` 낮음
- EC2 `StatusCheckFailed`
- Billing 예상 비용

알람은 **노이즈와 침묵** 사이 균형이 핵심이다. 처음엔 소수만.

---

## 4. X-Ray·기타

분산 추적까지 가면 X-Ray / OpenTelemetry를 붙인다.  
처음부터 전부 붙이기보다 **메트릭+로그+알람**을 먼저 안정화한다.

---

## 정리

관측은 사후 도구가 아니라 **배포 완료 조건**에 넣는다.

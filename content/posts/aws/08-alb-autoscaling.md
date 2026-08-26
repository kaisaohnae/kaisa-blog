---
slug: aws-08
order: 8
category: aws
categoryLabel: AWS
title: "ALB와 Auto Scaling으로 트래픽 받기"
summary: "로드밸런서, 타깃 그룹, 헬스체크, Auto Scaling 정책으로 수평 확장의 기본 구성을 잡는다."
publishedAt: 2026-08-26
tags: ["aws"]
---

# ALB와 Auto Scaling으로 트래픽 받기

> 요약: 로드밸런서, 타깃 그룹, 헬스체크, Auto Scaling 정책으로 수평 확장의 기본 구성을 잡는다.

---

## 1. 기본 토폴로지

```
사용자 → ALB(퍼블릭) → 타깃 그룹 → EC2/ECS(프라이빗)
```

- HTTPS 리스너(443) + ACM 인증서
- HTTP → HTTPS 리다이렉트
- 헬스체크 경로: `/health` 같은 가벼운 엔드포인트

---

## 2. 타깃 그룹

| 설정 | 포인트 |
|------|--------|
| 프로토콜/포트 | 앱이 실제로 듣는 포트 |
| 헬스체크 | 성공 코드·주기·임계 |
| stickiness | 세션 필요 시에만 |

헬스체크가 실패하면 트래픽이 빠지므로, 배포 중 드레인 시간을 맞춘다.

---

## 3. Auto Scaling

- 최소/희망/최대 용량
- CPU 또는 ALB RequestCount 기반
- 스케일 아웃은 빠르게, 인은 보수적으로

```
예: CPU 60% 5분 → +1
    CPU 20% 15분 → -1
```

앱이 상태를 로컬 디스크에만 두면 스케일이 깨진다. **세션·파일은 외부화**.

---

## 4. 보안

- ALB SG만 인터넷에 열고
- 앱 SG는 ALB SG만 허용
- WAF는 공개 API·로그인에 검토

---

## 정리

ALB + ASG는 “서버 여러 대”가 아니라 **헬스체크가 통과하는 동일한 타깃**을 만드는 설계다.

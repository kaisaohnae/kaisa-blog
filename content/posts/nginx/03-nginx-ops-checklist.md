---
slug: nginx-03
order: 3
category: nginx
categoryLabel: Nginx
title: "Nginx 운영·보안 체크리스트"
summary: "타임아웃, 버퍼, 로그, 보안 헤더, gzip까지 배포 전에 볼 Nginx 실무 체크리스트를 모은다."
publishedAt: 2026-08-26
tags: ["nginx"]
---

# Nginx 운영·보안 체크리스트

> 요약: 타임아웃, 버퍼, 로그, 보안 헤더, gzip까지 배포 전에 볼 Nginx 실무 체크리스트를 모은다.

---

## 1. 프록시·타임아웃

- [ ] `proxy_connect_timeout` / `proxy_read_timeout` 앱 특성에 맞게
- [ ] 업로드가 있으면 `client_max_body_size`
- [ ] WebSocket이면 `Upgrade` / `Connection` 헤더
- [ ] upstream 다운 시 에러 페이지·재시도 정책

```nginx
proxy_connect_timeout 5s;
proxy_read_timeout 60s;
client_max_body_size 20m;
```

---

## 2. 보안 헤더(예시)

```nginx
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options SAMEORIGIN always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
```

CSP는 앱과 맞춰 단계적으로. 잘못 넣면 스크립트·스타일이 한꺼번에 깨진다.

---

## 3. 로그·관측

- access/error 로그 경로·로테이션
- `$request_time` / upstream 시간 필드로 지연 분석
- 헬스체크 URL은 access_log off 검토

---

## 4. 성능

| 항목 | 메모 |
|------|------|
| gzip / brotli | 텍스트 응답 |
| `sendfile` | 정적 파일 |
| 캐시 헤더 | 해시 파일명 자산에 장기 캐시 |
| worker_connections | 트래픽에 맞게 |

미세 튜닝보다 **불필요한 프록시·큰 바디·느린 upstream**을 먼저 본다.

---

## 5. 배포 전 확인

- [ ] `nginx -t`
- [ ] reload 후 헬스·주요 URL
- [ ] HTTP→HTTPS, www/non-www 정책 일치
- [ ] 인증서 만료일·자동 갱신
- [ ] 서버_tokens off (버전 노출 축소)

---

## 정리

Nginx 운영은 옵션 나열이 아니라 **타임아웃 · 헤더 · 로그 · 인증서 갱신**이 체크리스트를 통과하는지다.

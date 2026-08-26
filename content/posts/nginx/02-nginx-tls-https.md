---
slug: nginx-02
order: 2
category: nginx
categoryLabel: Nginx
title: "Nginx에서 HTTPS·TLS 종단하기"
summary: "인증서 배치, 443 리스너, HTTP→HTTPS 리다이렉트까지 실무에서 쓰는 TLS 기본 구성을 정리한다."
publishedAt: 2026-08-26
tags: ["nginx"]
---

# Nginx에서 HTTPS·TLS 종단하기

> 요약: 인증서 배치, 443 리스너, HTTP→HTTPS 리다이렉트까지 실무에서 쓰는 TLS 기본 구성을 정리한다.

---

## 1. TLS를 앞단에 두는 이유

인증서를 Nginx(또는 로드밸런서)에서 끊으면:

- 앱은 HTTP로 단순하게 유지할 수 있다
- 인증서 갱·암호 스위트를 한곳에서 관리한다
- HSTS 등 보안 헤더를 일관 적용하기 쉽다

---

## 2. 443 서버 블록 골격

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

`X-Forwarded-Proto`가 틀리면 앱이 http 링크를 만들거나 쿠키 Secure 설정이 어긋날 수 있다.

---

## 3. 80 → 443

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

인증서 발급(ACME HTTP-01) 중에는 `/.well-known/acme-challenge/` 경로를 열어 두는 구성이 흔하다.

---

## 4. 운영 포인트

| 항목 | 권장 |
|------|------|
| 갱신 | certbot renew + deploy hook으로 reload |
| 프로토콜 | TLS 1.2+ |
| HSTS | 안정화 후 `Strict-Transport-Security` |
| 권한 | privkey 권한·백업 경로 점검 |

---

## 정리

HTTPS는 “인증서 파일만 넣는 일”이 아니라 **리다이렉트 · Forwarded 헤더 · 갱신 자동화**를 세트로 끝내는 일이다.

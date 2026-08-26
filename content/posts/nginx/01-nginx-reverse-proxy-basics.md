---
slug: nginx-01
order: 1
category: nginx
categoryLabel: Nginx
title: "Nginx 리버스 프록시 기초"
summary: "정적 파일 서빙과 upstream 프록시로 앱 앞단에 Nginx를 두는 최소 구성을 정리한다."
publishedAt: 2026-08-26
tags: ["nginx"]
---

# Nginx 리버스 프록시 기초

> 요약: 정적 파일 서빙과 upstream 프록시로 앱 앞단에 Nginx를 두는 최소 구성을 정리한다.

---

## 1. 왜 Nginx인가

Nginx는 **리버스 프록시·정적 파일·TLS 종단**에 자주 쓴다. 앱 서버(Node, Java, PHP-FPM 등) 앞에 두면:

- 포트·프로토콜을 바깥에 한 곳에서 정리한다
- 정적 자산은 앱을 거치지 않는다
- 헬스체크·타임아웃·버퍼를 앞단에서 통제한다

---

## 2. 최소 서버 블록

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`Host` / `X-Forwarded-*` 헤더는 앱이 실제 호스트·스킴을 알게 하는 데 중요하다.

---

## 3. 정적 + 프록시

```nginx
location /assets/ {
    alias /var/www/app/assets/;
    expires 7d;
    access_log off;
}

location / {
    proxy_pass http://127.0.0.1:3000;
}
```

긴 매칭·정확한 경로(`=`, `^~`) 우선순위를 알고 쓰면 의도치 않은 프록시를 줄일 수 있다.

---

## 4. 확인

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I http://127.0.0.1/
```

설정 문법 검사(`-t`) 없이 reload 하지 않는다.

---

## 정리

Nginx 첫 목표는 복잡한 튜닝이 아니라 **앱 앞단에서 Host·Forwarded·정적/동적 분리를 올바르게 하는 것**이다.

---
slug: laravel-10
order: 10
category: laravel
categoryLabel: Laravel
title: "운영 배포 — Sail, Forge/Vapor, 프로덕션 체크리스트"
summary: "Laravel 앱을 안전하게 빌드·배포·감시하는 운영 기본기를 정리한다."
publishedAt: 2026-08-26
tags: ["laravel"]
---

# 운영 배포 — Sail, Forge/Vapor, 프로덕션 체크리스트

> 요약: Laravel 앱을 안전하게 빌드·배포·감시하는 운영 기본기를 정리한다.

---

---

## 1. 환경 분리

| ENV | DEBUG | 목적 |
|-----|-------|------|
| local | true | 개발 |
| staging | false 권장 | 배포 리허설 |
| production | **false** | 운영 |

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://example.com
LOG_CHANNEL=stack
LOG_LEVEL=info
```

`.env`는 서버/시크릿 매니저에만. 이미지·저장소에 시크릿 베이크인 금지.

---

## 2. 배포 시 필수 Artisan

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan storage:link
npm ci && npm run build
```

큐 워커·Horizon·스케줄러·Reverb는 **별도 프로세스**로 항상 켜 둔다.

무중단 배포 시:

- `php artisan down --render="errors::503" --retry=60` (필요 시)
- 심링크 릴리즈 전환 (Envoyer 스타일)
- `horizon:terminate`로 워커 graceful reload

---

## 3. Laravel Sail (로컬 Docker)

```bash
php artisan sail:install
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
./vendor/bin/sail npm run dev
```

팀원 환경 차이를 줄인다. 운영 이미지는 Sail을 그대로 쓰지 않고 **프로덕션 Dockerfile**을 따로 두는 경우가 많다.

---

## 4. 프로덕션 Dockerfile 스케치

```dockerfile
FROM serversideup/php:8.3-fpm-nginx AS base
# 또는 공식 php-fpm + nginx/caddy 조합

WORKDIR /var/www/html
COPY --chown=www-data:www-data . .
RUN composer install --no-dev --optimize-autoloader \
 && php artisan storage:link \
 && npm ci && npm run build \
 && php artisan view:cache
```

권장:

- PHP-FPM + Nginx/Caddy
- non-root
- healthcheck: `GET /up`
- 별도 컨테이너/프로세스: `queue`, `scheduler`, `horizon`

Kubernetes면 Deployment를 웹/워커/스케줄로 분리.

---

## 5. 호스팅 옵션

| 옵션 | 특징 |
|------|------|
| **Laravel Forge** | VPS 프로비저닝, Nginx, SSL, 배포 스크립트 |
| **Laravel Vapor** | AWS 서버리스 (Lambda) — 스케일·운영 모델이 다름 |
| **Laravel Cloud** | 공식 클라우드 옵션 (시점별 확인) |
| 일반 VPS | Supervisor + Nginx + MySQL/Redis 직접 |
| PaaS | Railway, Render, Fly.io 등 |

Forge: 전통 서버 운영에 최적.  
Vapor: 서버리스 제약(파일시스템, 롱런 프로세스)을 이해하고 써야 한다.

---

## 6. Supervisor 예시 (큐)

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/app/artisan queue:work redis --sleep=1 --tries=3 --max-time=3600
autostart=true
autorestart=true
numprocs=2
user=www-data
redirect_stderr=true
stdout_logfile=/home/app/storage/logs/worker.log
```

Horizon 사용 시 `artisan horizon`을 관리.

Cron:

```cron
* * * * * www-data cd /home/app && php artisan schedule:run >> /dev/null 2>&1
```

---

## 7. 스토리지·파일

- 로컬 `storage`는 컨테이너 재시작 시 유실될 수 있음 → **S3 호환 오브젝트 스토리지**
- `FILESYSTEM_DISK=s3`
- 공개 파일은 CDN
- 백업: DB 스냅샷 + 스토리지 버전닝

---

## 8. 관측·로그

```env
LOG_CHANNEL=stack
LOG_STACK=single,stderr
```

- 구조화 로그(JSON) + 수집기
- 예외: Flare, Sentry, Bugsnag
- 메트릭: 호스트/APM
- Telescope는 운영 전면 노출 금지 (필요 시 강력 보호)

헬스: Laravel 11+ `health: '/up'`  
DB/Redis까지 보려면 커스텀 health 체크 추가.

---

## 9. 보안 운영 체크리스트

- [ ] `APP_KEY` 유출 시 재발급·세션/암호화 영향 이해
- [ ] `APP_DEBUG=false`
- [ ] HTTPS, HSTS
- [ ] CSRF / CORS / Sanctum 도메인
- [ ] 의존성 취약점: `composer audit`
- [ ] `.env`, 백업, 프라이빗 버킷 권한
- [ ] Rate limit 로그인·민감 API
- [ ] 관리자 경로·Filament 패널 추가 보호
- [ ] 업로드 MIME/크기 제한

---

## 문서 목록

| 주제 | 한 줄 |
|------|------|
| Laravel 11+ 시작 | 슬림 스켈레톤, PHP 8.3, env |
| 라우트·미들웨어 | 생명주기, 리소스, throttle |
| Eloquent | 관계, N+1, 마이그레이션 |
| Validation·Resource | Form Request, API 계약 |
| Authz | Sanctum, Policy |
| Test | Pest/Feature, fake |
| Queue | Job, Event, Schedule, Horizon |
| Cache | Redis, lock, Octane |
| Frontend | Blade, Livewire, Inertia, API |
| Ops | 배포, Forge/Vapor, 체크리스트 |

---

## 종합 연습

1. Sail로 app + mysql + redis를 띄운다.
2. 배포 스크립트(캐시·migrate·build)를 문서/스크립트로 만든다.
3. `queue:work` 또는 Horizon을 켜고 Job을 처리한다.
4. `APP_DEBUG=false` + `/up` 헬스 + Sentry(또는 로그) 연동을 확인한다.
5. 위의 보안·운영 체크리스트를 통과/미통과로 표시한다.

---

## 정리

현대 Laravel은 “빠른 CRUD”를 넘어 **검증·인가·큐·캐시·배포**가 한 줄로 이어진 프레임워크다.

- 입력은 Form Request, 출력은 Resource
- 권한은 Policy
- 느린 일은 Queue + afterCommit
- 관측과 실패 재시도 없는 비동기는 미완성
- 운영 캐시·워커·스케줄러를 배포의 일부로 취급

이 문서들을 바탕으로, 도메인에 Filament·Inertia·Vapor·Event Sourcing 등을 선택적으로 더하면 실무 생산성이 빠르게 오른다.

추가로 파고들 주제: Laravel Pennant(피처 플래그), Folio, Volt, Tenancy, DDD/Action 패턴, Arch 테스트, CI with GitHub Actions.

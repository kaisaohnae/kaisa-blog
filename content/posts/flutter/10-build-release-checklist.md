---
slug: flutter-10
order: 10
category: flutter
categoryLabel: Flutter
title: "Flutter 빌드·배포 실무 체크리스트"
summary: "아이콘·서명·난독화·스토어 제출까지 Flutter 앱을 릴리스하기 전에 볼 실무 체크리스트를 모은다."
publishedAt: 2026-08-26
tags: ["flutter"]
---

# Flutter 빌드·배포 실무 체크리스트

> 요약: 아이콘·서명·난독화·스토어 제출까지 Flutter 앱을 릴리스하기 전에 볼 실무 체크리스트를 모은다.

---

## 1. 품질

- [ ] null-safety / 분석 옵션(`analysis_options.yaml`) 통과
- [ ] 주요 흐름 위젯·유닛 테스트
- [ ] 접근성: 대비, 큰 글자, 스크린 리더 라벨
- [ ] 가로·노치·키보드 오버플로 확인

---

## 2. 성능·용량

- [ ] 릴리스 모드에서 체감 (`flutter run --release`)
- [ ] 이미지 해상도·webp
- [ ] 불필요 에셋·디버그 로그 제거
- [ ] DevTools로 jank 구간 확인

---

## 3. Android

- [ ] applicationId, versionCode/Name
- [ ] 키스토어·Play App Signing
- [ ] minify/shrink 설정
- [ ] 권한 최소화

```bash
flutter build appbundle
```

---

## 4. iOS

- [ ] Bundle ID, 인증서, 프로비저닝
- [ ] 권한 설명 문구(Info.plist)
- [ ] `flutter build ipa` / Xcode Archive

---

## 5. 보안·운영

- [ ] API 키를 앱에 박지 않기 (가능하면 백엔드)
- [ ] 인증서 피닝은 팀 정책
- [ ] 크래시 리포트(Firebase Crashlytics 등)
- [ ] 환경(dev/prod) 분리

---

## 정리

Flutter 릴리스는 `flutter build` 한 줄이 아니라 **서명·권한·스토어 메타·관측**이 체크리스트를 통과하는 일이다.

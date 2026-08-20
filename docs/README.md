# Kaisa Blog

블로그 프론트엔드 초기 세팅 문서.

## 현재 상태

- kaisa-fo와 동일한 Next.js + TypeScript + Zustand 구조
- 차트 라이브러리 제외
- mock 데이터 기반 목록/상세 페이지
- static export (`out/`)

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 글 목록 |
| `/posts/[slug]/` | 글 상세 |
| `/about/` | 소개 |

## 다음 단계

1. `kaisa-blog-api` 연동
2. 카테고리/태그 필터
3. 마크다운 또는 CMS 연동

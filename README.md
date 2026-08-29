# kaisa-blog

kaisa-fo와 같은 Next.js 프레임워크 기반 블로그 프론트엔드.

## 기술 스택

- Next.js 16 (App Router, static export)
- React 19
- TypeScript
- Zustand
- Axios
- AG Grid (kaisa-fo와 동일하게 포함, 차트 라이브러리만 제외)

## 시작하기

```bash
npm install
npm run dev
```

개발 서버: `http://localhost:5552`

## 프로젝트 구조

```
src/
  app/           Next.js App Router
  components/    레이아웃, 블로그 UI
  config/        API 설정
  data/          mock 블로그 데이터
  store/         Zustand store
  ui-components/ 공통 UI (Alert, Loading, Popup 등)
```

## 배포

```bash
npm run build
# out/ 폴더를 정적 호스팅에 업로드
```

## API 연동

`.env.example`의 `NEXT_PUBLIC_API_URL`을 `kaisa-blog-api` 주소로 맞춥니다.

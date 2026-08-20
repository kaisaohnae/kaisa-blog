import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="error-page">
      <div className="error-page__inner">
        <p className="error-page__code">404</p>
        <h1 className="error-page__title">Page Not Found</h1>
        <p className="error-page__desc">요청하신 페이지를 찾을 수 없습니다.</p>
        <Link href="/" className="error-page__cta">
          HOME
        </Link>
      </div>
    </div>
  );
}

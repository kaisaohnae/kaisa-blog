'use client';

import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="error-page">
      <div className="error-page__inner">
        <p className="error-page__code">500</p>
        <h1 className="error-page__title">Something Went Wrong</h1>
        <p className="error-page__desc">알 수 없는 에러가 발생하였습니다.</p>
        <Link href="/" className="error-page__cta">
          HOME
        </Link>
      </div>
    </div>
  );
}

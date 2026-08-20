export default function AboutPage() {
  return (
    <main className="blog-main">
      <div className="site-shell">
        <div className="site-shell__inner blog-post">
          <p className="blog-hero__eyebrow">About</p>
          <h1 className="blog-hero__title">Kaisa Blog</h1>
          <div className="blog-post__body">
            <p>kaisa-fo와 같은 프레임워크 구조로 만든 블로그 프로젝트입니다.</p>
            <p>차트 라이브러리는 제외했고, 공통 UI·상태관리·API 인터셉터 구조는 동일하게 유지했습니다.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

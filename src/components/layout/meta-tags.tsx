import Head from 'next/head';

export default function MetaTags() {
  return (
    <Head>
      <title>Kaisa Blog</title>
      <meta charSet="utf-8" />
      <meta name="robots" content="index, follow" />
      <meta name="description" content="Kaisa Blog - 개발, 디자인, 기록" />
      <meta name="viewport" content="initial-scale=1.0,minimum-scale=0,maximum-scale=1.0,user-scalable=no" />
      <meta name="format-detection" content="telephone=no, address=no, email=no" />
      <meta name="application-name" content="Kaisa Blog" />
    </Head>
  );
}

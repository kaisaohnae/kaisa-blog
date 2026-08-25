/**
 * @file 루트 레이아웃 파일
 */
import type {Metadata} from 'next';
import {Syne, DM_Sans} from 'next/font/google';
import '@/assets/css/reset.css';
import '@/assets/css/styles.css';
import '@/ui-components/styles/ui-components.css';
import '@/ui-kit/kit.css';
import MetaTags from '@/components/layout/meta-tags';
import GoogleAnalytics from '@/components/layout/google-analytics';
import GoogleAdsense from '@/components/layout/google-adsense';
import {UiAlert, UiLoading, UiPopup} from '@/ui-components';
import ThemeProvider from '@/components/layout/theme-provider';
import {THEME_STORAGE_KEY} from '@/store/use-theme-store';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kaisa Blog',
  description: 'Kaisa Blog - 개발, 디자인, 기록',
  icons: {
    icon: '/img/common/favicon.svg',
    shortcut: '/img/common/favicon.svg',
    apple: '/img/common/favicon.svg',
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="ko" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <GoogleAdsense />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=null;document.cookie.split(';').forEach(function(c){var p=c.trim().split('=');if(p[0]==='${THEME_STORAGE_KEY}')t=decodeURIComponent(p[1]||'');});document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
        <MetaTags />
        <GoogleAnalytics />
        <ThemeProvider />
        {children}
        <UiAlert />
        <UiLoading />
        <UiPopup />
      </body>
    </html>
  );
}

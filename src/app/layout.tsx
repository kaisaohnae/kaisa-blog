import type {Metadata} from 'next';
import {Syne, DM_Sans} from 'next/font/google';
import '@/assets/css/reset.css';
import '@/assets/css/styles.css';
import '@/ui-components/styles/ui-components.css';
import '@/ui-kit/kit.css';
import GoogleAnalytics from '@/components/layout/google-analytics';
import GoogleAdsense from '@/components/layout/google-adsense';
import {UiAlert, UiLoading, UiPopup} from '@/ui-components';
import ThemeProvider from '@/components/layout/theme-provider';
import {THEME_STORAGE_KEY} from '@/store/use-theme-store';
import {getSiteUrl, SITE_DESCRIPTION, SITE_NAME} from '@/config/site';

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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: '/img/common/favicon.svg',
    shortcut: '/img/common/favicon.svg',
    apple: '/img/common/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {index: true, follow: true},
  other: {
    'naver-site-verification': '4bc13b857695ff44988c260cb26124eedbcda90e',
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <GoogleAdsense />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=null;document.cookie.split(';').forEach(function(c){var p=c.trim().split('=');if(p[0]==='${THEME_STORAGE_KEY}')t=decodeURIComponent(p[1]||'');});document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
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

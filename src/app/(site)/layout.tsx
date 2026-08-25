import LayoutSub from '@/app/layout-sub';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import {LocaleProvider} from '@/i18n/locale-context';

export default function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <LocaleProvider>
      <div className="site-layout">
        <Header />
        <LayoutSub>{children}</LayoutSub>
        <Footer />
      </div>
    </LocaleProvider>
  );
}

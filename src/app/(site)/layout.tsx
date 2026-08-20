import LayoutSub from '@/app/layout-sub';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <Header />
      <LayoutSub>{children}</LayoutSub>
      <Footer />
    </>
  );
}

'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect} from 'react';
import IconLogo from '@/components/icons/common/icon-logo';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import ManagerNavIcon from '@/components/manager/manager-nav-icon';
import ManagerTopActions from '@/components/manager/manager-top-actions';
import {useMobileNav} from '@/hooks/use-mobile-nav';
import useAdminStore from '@/store/use-admin-store';
import '@/assets/css/example1.css';
import '@/assets/css/example-responsive.css';
import '@/ui-kit/kit.css';

const NAV = [
  {id: 'dashboard', href: '/manager/', label: '대시보드'},
  {id: 'posts', href: '/manager/posts/', label: '글 관리'},
  {id: 'categories', href: '/manager/categories/', label: '카테고리'},
  {id: 'write', href: '/manager/posts/write/', label: '글쓰기'},
  {id: 'requests', href: '/manager/requests/', label: '댓글 관리'},
  {id: 'members', href: '/manager/members/', label: '회원 관리'},
  {id: 'users', href: '/manager/users/', label: '사용자 관리'},
  {id: 'issues', href: '/manager/issues/', label: '이슈탐색'},
];

function isNavActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === '/manager/') return pathname === '/manager' || pathname === '/manager/';
  if (href === '/manager/posts/') {
    return pathname === '/manager/posts' || pathname === '/manager/posts/';
  }
  if (href === '/manager/categories/') {
    return pathname === '/manager/categories' || pathname === '/manager/categories/';
  }
  if (href === '/manager/users/') {
    return pathname === '/manager/users' || pathname === '/manager/users/';
  }
  return pathname === href || pathname.startsWith(href);
}

export default function ManagerLayout({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const {admin, hydrated, hydrate} = useAdminStore();
  const {open, toggle, close} = useMobileNav();
  const isLogin = pathname?.includes('/manager/login');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || isLogin) return;
    if (!admin) router.replace('/manager/login/');
  }, [hydrated, admin, isLogin, router]);

  if (isLogin) {
    return (
      <div className="site-layout">
        <Header />
        <div className="site-layout__body kaisa-kit">{children}</div>
        <Footer />
      </div>
    );
  }

  if (!hydrated || !admin) {
    return <div className="ex1" aria-busy="true" />;
  }

  return (
    <div className="ex1">
      <aside className={open ? 'ex1-sidebar ex1-sidebar--open' : 'ex1-sidebar'}>
        <div className="ex1-sidebar__brand">
          <div className="ex1-sidebar__logo">
            <Link href="/" aria-label="블로그 홈">
              <IconLogo width={92} height={39} />
            </Link>
          </div>
          <button
            type="button"
            className="ex1-sidebar__toggle"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            aria-controls="ex1-sidebar-nav"
            onClick={toggle}
          >
            <span className="ex1-sidebar__toggle-bar" />
            <span className="ex1-sidebar__toggle-bar" />
            <span className="ex1-sidebar__toggle-bar" />
          </button>
        </div>
        <nav id="ex1-sidebar-nav" className="ex1-sidebar__nav" aria-label="관리 메뉴">
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={isNavActive(item.href, pathname) ? 'ex1-sidebar__link ex1-sidebar__link--active' : 'ex1-sidebar__link'}
              onClick={close}
            >
              <ManagerNavIcon name={item.id} className="ex1-sidebar__icon" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="ex1-content">
        <ManagerTopActions />
        <div className="ex1-main kaisa-kit">{children}</div>
      </div>
    </div>
  );
}

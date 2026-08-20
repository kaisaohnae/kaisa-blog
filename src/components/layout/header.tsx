'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import ThemeToggle from './theme-toggle';
import IconLogo from '@/components/icons/common/icon-logo';

const MENU_ITEMS = [
  {href: '/', label: 'Home'},
  {href: '/about/', label: 'About'},
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header id="header">
      <div className="site-shell site-shell--header">
        <div className="header__inner site-shell__inner">
          <h1 className="header__logo">
            <Link href="/" aria-label="Kaisa Blog Home">
              <IconLogo width={100} height={42} />
            </Link>
          </h1>
          <div className="header__actions">
            <nav id="menu" aria-label="Main navigation">
              <ul className="menu__list">
                {MENU_ITEMS.map((item) => {
                  const active = pathname === item.href || pathname === item.href.replace(/\/$/, '');
                  return (
                    <li key={item.href} className={active ? 'menu__item menu__item--active' : 'menu__item'}>
                      <Link href={item.href} className="menu__link">
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

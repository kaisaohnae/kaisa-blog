'use client';

import Link from 'next/link';
import {useEffect} from 'react';
import ThemeToggle from './theme-toggle';
import IconLogo from '@/components/icons/common/icon-logo';
import useMemberStore from '@/store/use-member-store';

export default function Header() {
  const {member, hydrated, hydrate, logout} = useMemberStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
            {hydrated && member ? (
              <div className="auth-chip">
                <span>{member.memberName}</span>
                <button type="button" className="text-btn" onClick={() => logout()}>
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="auth-chip">
                <Link href="/login/" className="menu__link">
                  로그인
                </Link>
                <Link href="/register/" className="menu__link">
                  회원가입
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

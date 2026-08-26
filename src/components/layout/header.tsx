'use client';

import Link from 'next/link';
import {useEffect} from 'react';
import ThemeToggle from './theme-toggle';
import IconLogo from '@/components/icons/common/icon-logo';
import MemberHeaderActions from '@/components/layout/member-header-actions';
import {useT} from '@/i18n/locale-context';
import useMemberStore from '@/store/use-member-store';

export default function Header() {
  const {member, hydrated, hydrate, logout} = useMemberStore();
  const t = useT();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header id="header">
      <div className="site-shell site-shell--header">
        <div className="header__inner site-shell__inner">
          <p className="header__logo">
            <Link href="/" aria-label="Kaisa Blog Home">
              <IconLogo width={100} height={42} />
            </Link>
          </p>
          <div className="header__actions">
            {hydrated && member ? (
              <MemberHeaderActions member={member} onLogout={() => logout()} />
            ) : (
              <div className="auth-chip">
                <Link href="/login/" className="auth-chip__link">
                  {t('Login')}
                </Link>
                <Link href="/register/" className="auth-chip__link">
                  {t('Register')}
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

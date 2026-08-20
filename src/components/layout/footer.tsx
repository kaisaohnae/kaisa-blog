'use client';

import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer id="footer" className="site-footer">
      <div className="site-shell">
        <div className="site-footer__inner site-shell__inner">
          <p className="site-footer__copy">
            © 2005 Kaisa. All Rights Reserved
            <Link href="/manager/" className="footer-admin-dot" aria-label="관리자">
              .
            </Link>
          </p>
          <a href="mailto:7083620@hanmail.net" className="site-footer__link">
            7083620@hanmail.net
          </a>
        </div>
      </div>
    </footer>
  );
}

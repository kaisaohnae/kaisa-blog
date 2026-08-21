'use client';

import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer id="footer" className="site-footer">
      <div className="site-shell">
        <div className="site-footer__inner site-shell__inner">
          <p className="site-footer__copy">
            © 2005 Kaisa ·{' '}
            <a
              href="https://kaisa.co.kr"
              className="site-footer__copy-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              kaisa.co.kr
            </a>
            . All Rights Reserved
            <Link href="/manager/" className="footer-admin-dot" aria-label="관리자">
              .
            </Link>
          </p>
          <a href="mailto:kaisa@kaisa.co.kr" className="site-footer__link">
            kaisa@kaisa.co.kr
          </a>
        </div>
      </div>
    </footer>
  );
}

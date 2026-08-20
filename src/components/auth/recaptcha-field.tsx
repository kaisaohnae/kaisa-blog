'use client';

import dynamic from 'next/dynamic';
import {useEffect, useRef, useState} from 'react';

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {ssr: false});

const WIDGET_WIDTH = 304;
const WIDGET_HEIGHT = 78;

type RecaptchaFieldProps = {
  onChange: (token: string | null) => void;
};

export const isRecaptchaEnabled = () => Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

export function RecaptchaField({onChange}: RecaptchaFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      setScale(Math.min(1.18, Math.max(0.82, width / WIDGET_WIDTH)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!siteKey) return null;

  return (
    <div className="auth-captcha" ref={containerRef}>
      <div
        className="auth-captcha__widget"
        style={{
          height: WIDGET_HEIGHT * scale,
          ['--recaptcha-scale' as string]: scale,
        }}
      >
        <ReCAPTCHA sitekey={siteKey} onChange={onChange} />
      </div>
    </div>
  );
}

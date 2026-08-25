'use client';

import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useRef, useState} from 'react';
import {apiPost} from '@/config/api-config';
import {isRecaptchaEnabled, RecaptchaField} from '@/components/auth/recaptcha-field';
import {useT} from '@/i18n/locale-context';
import useMemberStore from '@/store/use-member-store';
import {Ex3Button, Ex3Field, Ex3Input} from '@/ui-kit';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useMemberStore(s => s.register);
  const t = useT();
  const recaptchaKeyRef = useRef(0);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [memberName, setMemberName] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [certSent, setCertSent] = useState(false);
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const captchaRequired = isRecaptchaEnabled();

  const resetCaptcha = () => {
    setCaptcha(null);
    recaptchaKeyRef.current += 1;
    setCaptchaKey(recaptchaKeyRef.current);
  };

  const onEmailChange = (value: string) => {
    setEmail(value);
    setCertSent(false);
    setCertNumber('');
    setHint('');
    if (captcha) resetCaptcha();
  };

  const sendCert = async () => {
    setError('');
    setHint('');
    if (captchaRequired && !captcha) {
      setError('Complete the robot check.');
      return;
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      await apiPost('bl/send-cert', {email: normalizedEmail, captcha});
      setCertSent(true);
      setCertNumber('');
      setHint(
        'We sent a verification code to your email. Enter it within 5 minutes. Check spam if you do not see it.'
      );
    } catch (err: any) {
      setCertSent(false);
      setError(err.message || 'Failed to send verification code.');
      resetCaptcha();
    }
  };

  const resendCert = () => {
    setCertSent(false);
    setCertNumber('');
    setHint('');
    setError('');
    resetCaptcha();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!certSent) {
      setError('Please request a verification code first.');
      return;
    }
    if (pwd !== pwdConfirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register({
        email: email.trim().toLowerCase(),
        pwd,
        pwdConfirm,
        certNumber,
        memberName
      });
      router.push(searchParams.get('returnUrl') || '/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  const canSendCert = Boolean(email) && (!captchaRequired || Boolean(captcha));

  return (
    <main className="blog-main">
      <div className="site-shell">
        <form className="auth-card ex3-kit" onSubmit={onSubmit}>
          <p className="blog-hero__eyebrow">{t('Member')}</p>
          <h1>{t('Register')}</h1>
          <Ex3Field label={t('Email')} htmlFor="reg-email" required>
            <Ex3Input
              id="reg-email"
              type="email"
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              required
              disabled={certSent}
            />
          </Ex3Field>
          {!certSent ? (
            <>
              {captchaRequired ? (
                <RecaptchaField key={captchaKey} hidden={Boolean(captcha)} onChange={setCaptcha} />
              ) : null}
              <Ex3Button type="button" variant="secondary" onClick={sendCert} disabled={!canSendCert}>
                {t('Send verification code')}
              </Ex3Button>
            </>
          ) : null}
          {certSent ? (
            <>
              <Ex3Field label={t('6-digit code')} htmlFor="reg-cert" required>
                <Ex3Input
                  id="reg-cert"
                  value={certNumber}
                  onChange={e => setCertNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </Ex3Field>
              <p className="auth-card__notice">
                {t('If you request a new code, the previous one will no longer work. ')}
                <button type="button" className="text-btn" onClick={resendCert}>
                  {t('Resend')}
                </button>
              </p>
              <Ex3Field label={t('Nickname')} htmlFor="reg-nickname" required>
                <Ex3Input
                  id="reg-nickname"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  maxLength={50}
                  required
                />
              </Ex3Field>
              <Ex3Field label={t('Password')} htmlFor="reg-pwd" required>
                <Ex3Input
                  id="reg-pwd"
                  type="password"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  minLength={6}
                  required
                />
              </Ex3Field>
              <Ex3Field label={t('Confirm password')} htmlFor="reg-pwd-confirm" required>
                <Ex3Input
                  id="reg-pwd-confirm"
                  type="password"
                  value={pwdConfirm}
                  onChange={e => setPwdConfirm(e.target.value)}
                  minLength={6}
                  required
                />
              </Ex3Field>
            </>
          ) : null}
          {hint ? <p className="auth-card__notice">{t(hint)}</p> : null}
          {error ? <p className="form-error">{t(error)}</p> : null}
          <Ex3Button type="submit" fullWidth disabled={!certSent}>
            {t('Sign up')}
          </Ex3Button>
          <p className="auth-card__hint">
            {t('Already have an account? ')}
            <Link href="/login/">{t('Login')}</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

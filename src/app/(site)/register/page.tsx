'use client';

import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useRef, useState} from 'react';
import {apiPost} from '@/config/api-config';
import {isRecaptchaEnabled, RecaptchaField} from '@/components/auth/recaptcha-field';
import useMemberStore from '@/store/use-member-store';
import {Ex3Button, Ex3Field, Ex3Input} from '@/ui-kit';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useMemberStore((s) => s.register);
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
      setError('로봇 방지 확인을 완료해 주세요.');
      return;
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      await apiPost('bl/send-cert', {email: normalizedEmail, captcha});
      setCertSent(true);
      setCertNumber('');
      setHint('인증번호를 메일로 보냈습니다. 5분 안에 입력해 주세요. 메일이 없으면 스팸함을 확인해 주세요.');
    } catch (err: any) {
      setCertSent(false);
      setError(err.message || '인증번호 발송에 실패했습니다.');
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
      setError('인증번호 받기를 먼저 진행해 주세요.');
      return;
    }
    if (pwd !== pwdConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await register({
        email: email.trim().toLowerCase(),
        pwd,
        pwdConfirm,
        certNumber,
        memberName,
      });
      router.push(searchParams.get('returnUrl') || '/');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    }
  };

  const canSendCert = Boolean(email) && (!captchaRequired || Boolean(captcha));

  return (
    <main className="blog-main">
      <div className="site-shell">
        <form className="auth-card ex3-kit" onSubmit={onSubmit}>
          <p className="blog-hero__eyebrow">Member</p>
          <h1>회원가입</h1>
          <Ex3Field label="이메일" htmlFor="reg-email" required>
            <Ex3Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
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
                인증번호 받기
              </Ex3Button>
            </>
          ) : null}
          {certSent ? (
            <>
              <Ex3Field label="인증번호 6자리" htmlFor="reg-cert" required>
                <Ex3Input
                  id="reg-cert"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </Ex3Field>
              <p className="auth-card__notice">
                인증번호를 다시 받으면 이전 번호는 사용할 수 없습니다.{' '}
                <button type="button" className="text-btn" onClick={resendCert}>
                  다시 받기
                </button>
              </p>
              <Ex3Field label="닉네임" htmlFor="reg-nickname" required>
                <Ex3Input
                  id="reg-nickname"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  maxLength={50}
                  required
                />
              </Ex3Field>
              <Ex3Field label="비밀번호" htmlFor="reg-pwd" required>
                <Ex3Input
                  id="reg-pwd"
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  minLength={6}
                  required
                />
              </Ex3Field>
              <Ex3Field label="비밀번호 확인" htmlFor="reg-pwd-confirm" required>
                <Ex3Input
                  id="reg-pwd-confirm"
                  type="password"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  minLength={6}
                  required
                />
              </Ex3Field>
            </>
          ) : null}
          {hint && <p className="auth-card__notice">{hint}</p>}
          {error && <p className="form-error">{error}</p>}
          <Ex3Button type="submit" fullWidth disabled={!certSent}>
            가입하기
          </Ex3Button>
          <p className="auth-card__hint">
            이미 계정이 있으면 <Link href="/login/">로그인</Link>
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

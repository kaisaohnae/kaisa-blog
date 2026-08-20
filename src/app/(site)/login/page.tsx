'use client';

import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useEffect, useRef, useState} from 'react';
import {isRecaptchaEnabled, RecaptchaField} from '@/components/auth/recaptcha-field';
import {clearSavedMemberEmail, getSavedMemberEmail, saveMemberEmail} from '@/lib/auth-storage';
import useMemberStore from '@/store/use-member-store';
import {Ex3Button, Ex3Checkbox, Ex3Field, Ex3Input} from '@/ui-kit';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useMemberStore((s) => s.login);
  const recaptchaKeyRef = useRef(0);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [saveId, setSaveId] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [error, setError] = useState('');
  const captchaRequired = isRecaptchaEnabled();

  useEffect(() => {
    const savedEmail = getSavedMemberEmail();
    if (!savedEmail) return;
    setEmail(savedEmail);
    setSaveId(true);
  }, []);

  const resetCaptcha = () => {
    setCaptcha(null);
    recaptchaKeyRef.current += 1;
    setCaptchaKey(recaptchaKeyRef.current);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (captchaRequired && !captcha) {
      setError('로봇 방지 확인을 완료해 주세요.');
      return;
    }
    try {
      await login(email, pwd, captcha || undefined);
      if (saveId) saveMemberEmail(email.trim());
      else clearSavedMemberEmail();
      router.push(searchParams.get('returnUrl') || '/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
      resetCaptcha();
    }
  };

  return (
    <main className="blog-main">
      <div className="site-shell">
        <form className="auth-card ex3-kit" onSubmit={onSubmit} autoComplete="on">
          <p className="blog-hero__eyebrow">Member</p>
          <h1>로그인</h1>
          <Ex3Field label="이메일" htmlFor="login-email">
            <Ex3Input
              id="login-email"
              name="username"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Ex3Field>
          <Ex3Field label="비밀번호" htmlFor="login-pwd">
            <Ex3Input
              id="login-pwd"
              name="password"
              type="password"
              autoComplete="current-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              minLength={6}
            />
          </Ex3Field>
          <Ex3Checkbox label="아이디 저장" checked={saveId} onChange={(e) => setSaveId(e.target.checked)} />
          {captchaRequired ? (
            <RecaptchaField key={captchaKey} hidden={Boolean(captcha)} onChange={setCaptcha} />
          ) : null}
          {error && <p className="form-error">{error}</p>}
          <Ex3Button type="submit" fullWidth>
            로그인
          </Ex3Button>
          <p className="auth-card__hint">
            계정이 없으면 <Link href="/register/">회원가입</Link>
          </p>
          <p className="auth-card__hint">
            <Link href="/find-id/">아이디 찾기</Link>
            {' · '}
            <Link href="/reset-password/">비밀번호 찾기</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

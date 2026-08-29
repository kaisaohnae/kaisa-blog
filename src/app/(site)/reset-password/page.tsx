'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useRef, useState} from 'react';
import {apiPost} from '@/config/api-config';
import {isRecaptchaEnabled, RecaptchaField} from '@/components/auth/recaptcha-field';
import {KaisaButton, KaisaField, KaisaInput} from '@/ui-kit';

export default function ResetPasswordPage() {
  const router = useRouter();
  const recaptchaKeyRef = useRef(0);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [email, setEmail] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [certSent, setCertSent] = useState(false);
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
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
    setPwd('');
    setPwdConfirm('');
    setHint('');
    setDone(false);
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
      await apiPost('bl/send-reset-pwd-cert', {email, captcha});
      setCertSent(true);
      setHint('인증번호를 메일로 보냈습니다. 5분 안에 입력해 주세요. 메일이 없으면 스팸함을 확인해 주세요.');
    } catch (err: any) {
      setCertSent(false);
      setError(err.message || '인증번호 발송에 실패했습니다.');
      resetCaptcha();
    }
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
      await apiPost('bl/reset-pwd', {
        email,
        certNumber,
        pwd,
        pwd_confirmation: pwdConfirm,
      });
      setDone(true);
      setHint('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.');
    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  const canSendCert = Boolean(email) && (!captchaRequired || Boolean(captcha));

  return (
    <main className="blog-main">
      <div className="site-shell">
        <form className="auth-card kaisa-kit" onSubmit={onSubmit}>
          <p className="blog-hero__eyebrow">Member</p>
          <h1>비밀번호 찾기</h1>
          <p className="muted">가입 이메일 인증 후 새 비밀번호로 변경할 수 있습니다.</p>
          <KaisaField label="이메일" htmlFor="reset-email" required>
            <KaisaInput
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              disabled={done}
            />
          </KaisaField>
          {!done ? (
            <>
              {captchaRequired ? (
                <RecaptchaField key={captchaKey} hidden={Boolean(captcha)} onChange={setCaptcha} />
              ) : null}
              <KaisaButton type="button" variant="secondary" onClick={sendCert} disabled={!canSendCert}>
                인증번호 받기
              </KaisaButton>
              {certSent ? (
                <>
                  <KaisaField label="인증번호 6자리" htmlFor="reset-cert" required>
                    <KaisaInput
                      id="reset-cert"
                      value={certNumber}
                      onChange={(e) => setCertNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      maxLength={6}
                      required
                    />
                  </KaisaField>
                  <KaisaField label="새 비밀번호" htmlFor="reset-pwd" required>
                    <KaisaInput
                      id="reset-pwd"
                      type="password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      minLength={6}
                      required
                    />
                  </KaisaField>
                  <KaisaField label="새 비밀번호 확인" htmlFor="reset-pwd-confirm" required>
                    <KaisaInput
                      id="reset-pwd-confirm"
                      type="password"
                      value={pwdConfirm}
                      onChange={(e) => setPwdConfirm(e.target.value)}
                      minLength={6}
                      required
                    />
                  </KaisaField>
                </>
              ) : null}
            </>
          ) : null}
          {hint && <p className="auth-card__notice">{hint}</p>}
          {error && <p className="form-error">{error}</p>}
          {!done ? (
            <KaisaButton type="submit" fullWidth disabled={!certSent}>
              비밀번호 변경
            </KaisaButton>
          ) : (
            <KaisaButton type="button" fullWidth onClick={() => router.push('/login/')}>
              로그인으로 이동
            </KaisaButton>
          )}
          <p className="auth-card__hint">
            <Link href="/login/">로그인</Link>
            {' · '}
            <Link href="/find-id/">아이디 찾기</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

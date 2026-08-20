'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {apiPost} from '@/config/api-config';
import useMemberStore from '@/store/use-member-store';
import {Ex3Button, Ex3Field, Ex3Input} from '@/ui-kit';

export default function RegisterPage() {
  const router = useRouter();
  const register = useMemberStore((s) => s.register);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [memberName, setMemberName] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');

  const sendCert = async () => {
    setError('');
    try {
      const body = await apiPost<{certNumber?: string}>('bl/send-cert', {email});
      setHint(body.data?.certNumber ? `개발모드 인증번호: ${body.data.certNumber}` : '인증번호를 메일로 보냈습니다. 5분 안에 입력해 주세요.');
    } catch (err: any) {
      setError(err.message || '인증번호 발송에 실패했습니다.');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({email, pwd, certNumber, memberName});
      router.push('/');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <main className="blog-main">
      <div className="site-shell">
        <form className="auth-card ex3-kit" onSubmit={onSubmit}>
          <p className="blog-hero__eyebrow">Member</p>
          <h1>회원가입</h1>
          <Ex3Field label="이메일" htmlFor="reg-email">
            <Ex3Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Ex3Field>
          <Ex3Button type="button" variant="secondary" onClick={sendCert} disabled={!email}>
            인증번호 받기
          </Ex3Button>
          <Ex3Field label="인증번호 6자리" htmlFor="reg-cert">
            <Ex3Input id="reg-cert" value={certNumber} onChange={(e) => setCertNumber(e.target.value)} maxLength={6} required />
          </Ex3Field>
          <Ex3Field label="비밀번호" htmlFor="reg-pwd">
            <Ex3Input id="reg-pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} minLength={6} required />
          </Ex3Field>
          <Ex3Field label="이름 (선택)" htmlFor="reg-name">
            <Ex3Input id="reg-name" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
          </Ex3Field>
          {hint && <p className="muted">{hint}</p>}
          {error && <p className="form-error">{error}</p>}
          <Ex3Button type="submit" fullWidth>
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

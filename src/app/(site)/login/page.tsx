'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import useMemberStore from '@/store/use-member-store';
import {Ex3Button, Ex3Field, Ex3Input} from '@/ui-kit';

export default function LoginPage() {
  const router = useRouter();
  const login = useMemberStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, pwd);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <main className="blog-main">
      <div className="site-shell">
        <form className="auth-card ex3-kit" onSubmit={onSubmit}>
          <p className="blog-hero__eyebrow">Member</p>
          <h1>로그인</h1>
          <Ex3Field label="이메일" htmlFor="login-email">
            <Ex3Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Ex3Field>
          <Ex3Field label="비밀번호" htmlFor="login-pwd">
            <Ex3Input
              id="login-pwd"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              minLength={6}
            />
          </Ex3Field>
          {error && <p className="form-error">{error}</p>}
          <Ex3Button type="submit" fullWidth>
            로그인
          </Ex3Button>
          <p className="auth-card__hint">
            계정이 없으면 <Link href="/register/">회원가입</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

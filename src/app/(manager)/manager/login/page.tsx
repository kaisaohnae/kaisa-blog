'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {clearSavedManagerId, getSavedManagerId, saveManagerId} from '@/lib/auth-storage';
import useAdminStore from '@/store/use-admin-store';
import {KaisaButton, KaisaCheckbox, KaisaField, KaisaInput} from '@/ui-kit';

export default function ManagerLoginPage() {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const [userId, setUserId] = useState('');
  const [pwd, setPwd] = useState('');
  const [saveId, setSaveId] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedId = getSavedManagerId();
    if (!savedId) return;
    setUserId(savedId);
    setSaveId(true);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(userId, pwd);
      if (saveId) saveManagerId(userId.trim());
      else clearSavedManagerId();
      router.push('/manager/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <main className="blog-main">
      <form className="auth-card" onSubmit={onSubmit} autoComplete="on">
        <p className="blog-hero__eyebrow">Manager</p>
        <h1>관리자 로그인</h1>
        <KaisaField label="아이디" htmlFor="manager-id">
          <KaisaInput
            id="manager-id"
            name="username"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </KaisaField>
        <KaisaField label="비밀번호" htmlFor="manager-pwd">
          <KaisaInput
            id="manager-pwd"
            name="password"
            type="password"
            autoComplete="current-password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
          />
        </KaisaField>
        <KaisaCheckbox
          label="아이디 저장"
          checked={saveId}
          onChange={(e) => setSaveId(e.target.checked)}
        />
        {error && <p className="form-error">{error}</p>}
        <KaisaButton type="submit" fullWidth>
          로그인
        </KaisaButton>
      </form>
    </main>
  );
}

'use client';

import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useRouter} from 'next/navigation';
import {apiPost} from '@/config/api-config';
import useAdminStore from '@/store/use-admin-store';
import {KaisaButton, KaisaField, KaisaInput} from '@/ui-kit';

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ManagerSettingsLayer({open, onClose}: {open: boolean; onClose: () => void}) {
  const admin = useAdminStore((s) => s.admin);
  const [pwd, setPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setPwd('');
    setNewPwd('');
    setMessage('');
    setError('');
  }, [open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const body = await apiPost('auth/change-password', {pwd, newPwd}, 'admin');
      setMessage(body.message);
      setPwd('');
      setNewPwd('');
    } catch (err: any) {
      setError(err.message || '변경에 실패했습니다.');
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="kaisa-overlay" role="presentation" onClick={onClose}>
      <div
        className="kaisa-dialog kaisa-dialog--popup manager-settings-layer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manager-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="manager-settings-title" className="kaisa-dialog__title">
          설정
        </h3>
        {admin ? (
          <dl className="manager-settings-layer__profile">
            <div className="manager-settings-layer__profile-row">
              <dt>아이디</dt>
              <dd>{admin.userId}</dd>
            </div>
            <div className="manager-settings-layer__profile-row">
              <dt>이름</dt>
              <dd>{admin.userName}</dd>
            </div>
            {admin.email ? (
              <div className="manager-settings-layer__profile-row">
                <dt>이메일</dt>
                <dd>{admin.email}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        <h4 className="manager-settings-layer__section-title">비밀번호 변경</h4>
        <form className="manager-settings-layer__form" onSubmit={save}>
          <KaisaField label="현재 비밀번호" htmlFor="layer-cur-pwd" required>
            <KaisaInput id="layer-cur-pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
          </KaisaField>
          <KaisaField label="새 비밀번호" htmlFor="layer-new-pwd" required>
            <KaisaInput
              id="layer-new-pwd"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              minLength={6}
              required
            />
          </KaisaField>
          {message && <p className="muted">{message}</p>}
          {error && <p className="form-error">{error}</p>}
          <div className="kaisa-dialog__actions">
            <KaisaButton type="button" variant="ghost" onClick={onClose}>
              닫기
            </KaisaButton>
            <KaisaButton type="submit">변경</KaisaButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default function ManagerTopActions() {
  const router = useRouter();
  const logout = useAdminStore((s) => s.logout);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="ex1-manager-bar">
        <button
          type="button"
          className="ex1-manager-bar__btn"
          aria-label="설정"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </button>
        <button
          type="button"
          className="ex1-manager-bar__btn"
          aria-label="로그아웃"
          onClick={() => logout().then(() => router.push('/manager/login/'))}
        >
          <LogoutIcon />
        </button>
      </div>
      <ManagerSettingsLayer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

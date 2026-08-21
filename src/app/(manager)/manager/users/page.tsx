'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ColDef, ICellRendererParams} from 'ag-grid-community';
import ManagerAgGrid, {type ManagerAgGridHandle} from '@/components/grid/manager-ag-grid';
import ManagerGridCrudBar from '@/components/manager/manager-grid-crud-bar';
import {apiPost} from '@/config/api-config';
import useAdminStore from '@/store/use-admin-store';
import {Ex3Button, Ex3Field, Ex3Input, Ex3Select} from '@/ui-kit';

type AdminUser = {
  userId: string;
  userName: string;
  email?: string | null;
  userStateCode: string;
  loginDt?: string | null;
  createDt?: string | null;
};

export default function ManagerUsersPage() {
  const {admin} = useAdminStore();
  const gridRef = useRef<ManagerAgGridHandle>(null);
  const [list, setList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [userStateCode, setUserStateCode] = useState('A');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    apiPost<{list: AdminUser[]}>('bl/get-user-list', {totalPage: 50}, 'admin')
      .then((body) => setList(body.data.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetAddForm = () => {
    setUserId('');
    setUserName('');
    setEmail('');
    setPwd('');
    setUserStateCode('A');
    setError('');
  };

  const updateState = async (user: AdminUser, nextState: string) => {
    if (user.userId === admin?.userId && nextState !== 'A') {
      window.alert('현재 로그인한 계정은 비활성화할 수 없습니다.');
      load();
      return;
    }
    await apiPost(
      'bl/set-user-list',
      [{mode: 'U', userId: user.userId, userName: user.userName, email: user.email, userStateCode: nextState}],
      'admin',
    );
    load();
  };

  const removeUsers = async (users: AdminUser[]) => {
    if (!users.length) return;
    if (users.some((user) => user.userId === admin?.userId)) {
      window.alert('현재 로그인한 계정은 삭제할 수 없습니다.');
      return;
    }
    if (!window.confirm(`${users.length}명을 탈퇴 처리할까요?`)) return;
    await apiPost(
      'bl/set-user-list',
      users.map((user) => ({mode: 'D', userId: user.userId})),
      'admin',
    );
    gridRef.current?.deselectAll();
    load();
  };

  const submitAdd = async () => {
    setSaving(true);
    setError('');
    if (!userId.trim() || !userName.trim() || pwd.length < 6) {
      setError('아이디, 이름, 비밀번호(6자 이상)를 입력해 주세요.');
      setSaving(false);
      return;
    }

    try {
      await apiPost(
        'bl/set-user-list',
        [
          {
            mode: 'C',
            userId: userId.trim(),
            userName: userName.trim(),
            email: email.trim() || null,
            pwd,
            userStateCode,
          },
        ],
        'admin',
      );
      resetAddForm();
      setShowAddForm(false);
      load();
    } catch (e: any) {
      setError(e.message || '사용자 추가에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const columnDefs = useMemo<ColDef<AdminUser>[]>(
    () => [
      {field: 'userId', headerName: '아이디', minWidth: 140},
      {field: 'userName', headerName: '이름', minWidth: 120},
      {field: 'email', headerName: '이메일', minWidth: 200},
      {
        field: 'userStateCode',
        headerName: '상태',
        minWidth: 140,
        cellRenderer: (params: ICellRendererParams<AdminUser>) => {
          if (!params.data) return null;
          const isSelf = params.data.userId === admin?.userId;
          return (
            <Ex3Select
              uiSize="sm"
              value={params.data.userStateCode}
              disabled={isSelf}
              onChange={(e) => updateState(params.data!, e.target.value)}
            >
              <option value="A">활성</option>
              <option value="S">정지</option>
              <option value="D">탈퇴</option>
            </Ex3Select>
          );
        },
      },
      {
        headerName: '최근 로그인',
        maxWidth: 160,
        valueGetter: (p) => (p.data?.loginDt ? String(p.data.loginDt).slice(0, 16).replace('T', ' ') : ''),
      },
      {
        headerName: '등록일',
        maxWidth: 140,
        valueGetter: (p) => (p.data?.createDt ? String(p.data.createDt).slice(0, 10) : ''),
      },
    ],
    [admin?.userId],
  );

  return (
    <>
      <ManagerGridCrudBar
        total={list.length}
        selected={selected}
        hint="상태 컬럼에서 활성/정지/탈퇴를 변경합니다."
        addLabel="사용자 추가"
        onAdd={() => {
          resetAddForm();
          setShowAddForm((current) => !current);
        }}
        onDelete={() => removeUsers((gridRef.current?.getSelectedRows() as AdminUser[]) ?? [])}
      />

      {showAddForm ? (
        <section className="ex1-panel manager-users-form">
          <div className="manager-users-form__grid">
            <Ex3Field label="아이디" htmlFor="admin-user-id" required>
              <Ex3Input id="admin-user-id" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </Ex3Field>
            <Ex3Field label="이름" htmlFor="admin-user-name" required>
              <Ex3Input id="admin-user-name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </Ex3Field>
            <Ex3Field label="이메일" htmlFor="admin-user-email">
              <Ex3Input id="admin-user-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Ex3Field>
            <Ex3Field label="비밀번호" htmlFor="admin-user-pwd" required>
              <Ex3Input
                id="admin-user-pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
            </Ex3Field>
            <Ex3Field label="상태" htmlFor="admin-user-state">
              <Ex3Select
                id="admin-user-state"
                value={userStateCode}
                onChange={(e) => setUserStateCode(e.target.value)}
              >
                <option value="A">활성</option>
                <option value="S">정지</option>
              </Ex3Select>
            </Ex3Field>
          </div>
          <div className="manager-users-form__actions">
            <Ex3Button type="button" onClick={submitAdd} disabled={saving}>
              추가
            </Ex3Button>
            <Ex3Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddForm(false);
                resetAddForm();
              }}
              disabled={saving}
            >
              취소
            </Ex3Button>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
        </section>
      ) : null}

      <section className="ex1-panel ex1-panel--grid">
        <ManagerAgGrid
          ref={gridRef}
          rowData={list}
          columnDefs={columnDefs}
          loading={loading}
          selectable
          cellSelection
          getRowId={(p) => p.data.userId}
          height={720}
          onSelectionChanged={setSelected}
        />
      </section>
    </>
  );
}

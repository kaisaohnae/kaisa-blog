'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ColDef, ICellRendererParams} from 'ag-grid-community';
import ManagerAgGrid from '@/components/grid/manager-ag-grid';
import ManagerGridCrudBar from '@/components/manager/manager-grid-crud-bar';
import {apiPost} from '@/config/api-config';
import {Ex3Select} from '@/ui-kit';

type Member = {
  memberId: string;
  memberName: string;
  email: string;
  memberStateCode: string;
  createDt?: string;
};

export default function ManagerMembersPage() {
  const [list, setList] = useState<Member[]>([]);

  const load = useCallback(() => {
    apiPost<{list: Member[]}>('bl/get-member-list', {totalPage: 50}, 'admin')
      .then((body) => setList(body.data.list || []))
      .catch(() => setList([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateState = async (member: Member, memberStateCode: string) => {
    await apiPost(
      'bl/set-member-list',
      [{mode: 'U', memberId: member.memberId, memberName: member.memberName, memberStateCode}],
      'admin',
    );
    load();
  };

  const columnDefs = useMemo<ColDef<Member>[]>(
    () => [
      {field: 'email', headerName: '이메일', minWidth: 200},
      {field: 'memberName', headerName: '이름', minWidth: 120},
      {
        field: 'memberStateCode',
        headerName: '상태',
        minWidth: 140,
        cellRenderer: (params: ICellRendererParams<Member>) => {
          if (!params.data) return null;
          return (
            <Ex3Select
              uiSize="sm"
              value={params.data.memberStateCode}
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
        headerName: '가입일',
        maxWidth: 140,
        valueGetter: (p) => (p.data?.createDt ? String(p.data.createDt).slice(0, 10) : ''),
      },
    ],
    [],
  );

  return (
    <>
      <ManagerGridCrudBar total={list.length} selected={0} hint="상태 컬럼에서 활성/정지/탈퇴를 바로 변경합니다." />
      <section className="ex1-panel ex1-panel--grid">
        <ManagerAgGrid
          rowData={list}
          columnDefs={columnDefs}
          cellSelection
          getRowId={(p) => p.data.memberId}
          height={720}
        />
      </section>
    </>
  );
}

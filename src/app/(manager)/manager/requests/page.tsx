'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ColDef, ICellRendererParams} from 'ag-grid-community';
import ManagerAgGrid, {type ManagerAgGridHandle} from '@/components/grid/manager-ag-grid';
import ManagerGridCrudBar from '@/components/manager/manager-grid-crud-bar';
import {apiPost} from '@/config/api-config';
import {KaisaSelect} from '@/ui-kit';

type ToolRequestItem = {
  requestNo: number;
  parentRequestNo?: number | null;
  toolKey: string;
  nickname: string;
  content: string;
  ip?: string | null;
  maskedIp?: string;
  country?: string | null;
  isDisplay: string;
  createDt?: string | null;
};

type ToolStat = {
  toolKey: string;
  totalCount: number;
  displayCount: number;
};

type AdminListResponse = {
  list: ToolRequestItem[];
  toolStats: ToolStat[];
  totalCount: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
};

export default function ManagerRequestsPage() {
  const gridRef = useRef<ManagerAgGridHandle>(null);
  const [list, setList] = useState<ToolRequestItem[]>([]);
  const [toolStats, setToolStats] = useState<ToolStat[]>([]);
  const [toolKey, setToolKey] = useState('');
  const [isDisplay, setIsDisplay] = useState<'ALL' | 'Y' | 'N'>('ALL');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);

  const load = useCallback(
    (nextPage = 1) => {
      setLoading(true);
      apiPost<AdminListResponse>(
        'tl/get-admin-request-list',
        {
          toolKey: toolKey || undefined,
          isDisplay,
          page: nextPage,
          pageSize: 50,
        },
        'admin',
      )
        .then(body => {
          setList(body.data.list || []);
          setToolStats(body.data.toolStats || []);
          setTotalCount(body.data.totalCount || 0);
          setPage(body.data.currentPage || nextPage);
          setLastPage(Math.max(1, body.data.lastPage || 1));
          gridRef.current?.deselectAll();
          setSelected(0);
        })
        .catch(() => {
          setList([]);
          setToolStats([]);
          setTotalCount(0);
          setLastPage(1);
        })
        .finally(() => setLoading(false));
    },
    [toolKey, isDisplay],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const updateDisplay = useCallback(
    async (item: ToolRequestItem, next: string) => {
      if (item.isDisplay === next) return;
      setList(prev =>
        prev.map(row => (row.requestNo === item.requestNo ? {...row, isDisplay: next} : row)),
      );
      try {
        await apiPost(
          'tl/set-request-list',
          [{mode: 'U', requestNo: item.requestNo, isDisplay: next}],
          'admin',
        );
      } catch {
        setList(prev =>
          prev.map(row => (row.requestNo === item.requestNo ? {...row, isDisplay: item.isDisplay} : row)),
        );
        window.alert('표시 상태 변경에 실패했습니다.');
      }
    },
    [],
  );

  const deleteSelected = async () => {
    const rows = (gridRef.current?.getSelectedRows() as ToolRequestItem[]) ?? [];
    if (!rows.length) return;
    if (!confirm(`선택한 ${rows.length}건을 삭제할까요?\n루트를 삭제하면 답글도 함께 삭제됩니다.`)) return;
    try {
      await apiPost(
        'tl/set-request-list',
        rows.map(item => ({mode: 'D', requestNo: item.requestNo})),
        'admin',
      );
      load(page);
    } catch {
      window.alert('삭제에 실패했습니다.');
    }
  };

  const columnDefs = useMemo<ColDef<ToolRequestItem>[]>(
    () => [
      {field: 'requestNo', headerName: 'No', maxWidth: 90},
      {
        headerName: '유형',
        maxWidth: 90,
        valueGetter: p => (p.data?.parentRequestNo ? '답글' : '요청'),
      },
      {
        field: 'toolKey',
        headerName: '도구',
        minWidth: 140,
        cellRenderer: (params: ICellRendererParams<ToolRequestItem>) => {
          if (!params.data) return null;
          const key = params.data.toolKey;
          return (
            <button type="button" className="text-btn" onClick={() => setToolKey(key)} title="이 도구만 보기">
              {key}
            </button>
          );
        },
      },
      {field: 'nickname', headerName: '닉네임', minWidth: 110, maxWidth: 140},
      {field: 'content', headerName: '내용', flex: 1, minWidth: 220},
      {
        headerName: 'IP',
        minWidth: 140,
        maxWidth: 170,
        valueGetter: p => p.data?.ip || p.data?.maskedIp || '-',
      },
      {field: 'country', headerName: '국가', maxWidth: 90},
      {
        field: 'isDisplay',
        headerName: '표시',
        maxWidth: 120,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<ToolRequestItem>) => {
          if (!params.data) return null;
          const item = params.data;
          return (
            <div onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
              <KaisaSelect
                uiSize="sm"
                value={item.isDisplay}
                onChange={e => void updateDisplay(item, e.target.value)}
              >
                <option value="Y">표시</option>
                <option value="N">숨김</option>
              </KaisaSelect>
            </div>
          );
        },
      },
      {
        headerName: '등록일시',
        minWidth: 150,
        maxWidth: 170,
        valueGetter: p => (p.data?.createDt ? String(p.data.createDt).slice(0, 16).replace('T', ' ') : ''),
      },
    ],
    [updateDisplay],
  );

  return (
    <>
      <ManagerGridCrudBar
        total={totalCount}
        selected={selected}
        hint="최신 요청 순 · 도구별 필터 · 표시/숨김 · 선택 삭제"
        onDelete={deleteSelected}
        deleteLabel="선택 삭제"
      />

      <section className="ex1-panel" style={{marginBottom: 16}}>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'}}>
          <KaisaSelect uiSize="sm" value={toolKey} onChange={e => setToolKey(e.target.value)} aria-label="도구 필터">
            <option value="">전체 도구</option>
            {toolStats.map(stat => (
              <option key={stat.toolKey} value={stat.toolKey}>
                {stat.toolKey} ({stat.displayCount}/{stat.totalCount})
              </option>
            ))}
          </KaisaSelect>
          <KaisaSelect
            uiSize="sm"
            value={isDisplay}
            onChange={e => setIsDisplay(e.target.value as 'ALL' | 'Y' | 'N')}
            aria-label="표시 필터"
          >
            <option value="ALL">전체 상태</option>
            <option value="Y">표시만</option>
            <option value="N">숨김만</option>
          </KaisaSelect>
          {toolKey ? (
            <button type="button" className="text-btn" onClick={() => setToolKey('')}>
              필터 해제
            </button>
          ) : null}
        </div>
        {toolStats.length > 0 ? (
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12}}>
            {toolStats.map(stat => {
              const active = toolKey === stat.toolKey;
              return (
                <button
                  key={stat.toolKey}
                  type="button"
                  onClick={() => setToolKey(active ? '' : stat.toolKey)}
                  style={{
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 999,
                    padding: '4px 10px',
                    background: active ? '#1a1a18' : 'transparent',
                    color: active ? '#fff' : 'inherit',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {stat.toolKey} · {stat.totalCount}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="ex1-panel ex1-panel--grid">
        <ManagerAgGrid
          ref={gridRef}
          rowData={list}
          columnDefs={columnDefs}
          loading={loading}
          selectable
          cellSelection
          getRowId={p => String(p.data.requestNo)}
          height={640}
          onSelectionChanged={setSelected}
        />
      </section>

      {lastPage > 1 ? (
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16}}>
          <button type="button" className="text-btn" disabled={page <= 1 || loading} onClick={() => load(page - 1)}>
            이전
          </button>
          <span>
            {page} / {lastPage}
          </span>
          <button
            type="button"
            className="text-btn"
            disabled={page >= lastPage || loading}
            onClick={() => load(page + 1)}
          >
            다음
          </button>
        </div>
      ) : null}
    </>
  );
}

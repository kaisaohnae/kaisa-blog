'use client';

import {useRouter} from 'next/navigation';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ColDef, ICellRendererParams} from 'ag-grid-community';
import ManagerAgGrid, {type ManagerAgGridHandle} from '@/components/grid/manager-ag-grid';
import ManagerGridCrudBar from '@/components/manager/manager-grid-crud-bar';
import {apiPost} from '@/config/api-config';
import {Ex3Button} from '@/ui-kit';

type Post = {
  postNo: number;
  title: string;
  slug: string;
  isDisplay: string;
  createDt?: string;
};

export default function ManagerPostsPage() {
  const router = useRouter();
  const gridRef = useRef<ManagerAgGridHandle>(null);
  const [list, setList] = useState<Post[]>([]);
  const [selected, setSelected] = useState(0);

  const load = useCallback(() => {
    apiPost<{list: Post[]}>('bl/get-post-list', {adminYn: 'Y', totalPage: 50}, 'admin')
      .then((body) => setList(body.data.list || []))
      .catch(() => setList([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removePosts = async (posts: Post[]) => {
    if (!posts.length) return;
    if (!confirm(`${posts.length}건을 삭제할까요?`)) return;
    await apiPost(
      'bl/set-post-list',
      posts.map((post) => ({mode: 'D', postNo: post.postNo})),
      'admin',
    );
    gridRef.current?.deselectAll();
    load();
  };

  const columnDefs = useMemo<ColDef<Post>[]>(
    () => [
      {field: 'postNo', headerName: '번호', maxWidth: 110},
      {field: 'title', headerName: '제목', minWidth: 220},
      {field: 'isDisplay', headerName: '공개', maxWidth: 110},
      {
        headerName: '작성일',
        maxWidth: 140,
        valueGetter: (p) => (p.data?.createDt ? String(p.data.createDt).slice(0, 10) : ''),
      },
      {
        headerName: '',
        maxWidth: 180,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Post>) => {
          if (!params.data) return null;
          return (
            <div style={{display: 'flex', gap: 8, alignItems: 'center', height: '100%'}}>
              <Ex3Button
                variant="secondary"
                uiSize="sm"
                onClick={() => router.push(`/manager/posts/write/?postNo=${params.data!.postNo}`)}
              >
                수정
              </Ex3Button>
              <Ex3Button variant="danger" uiSize="sm" onClick={() => removePosts([params.data!])}>
                삭제
              </Ex3Button>
            </div>
          );
        },
      },
    ],
    [router],
  );

  return (
    <>
      <ManagerGridCrudBar
        total={list.length}
        selected={selected}
        onAdd={() => router.push('/manager/posts/write/')}
        onDelete={() => removePosts((gridRef.current?.getSelectedRows() as Post[]) ?? [])}
      />
      <section className="ex1-panel ex1-panel--grid">
        <ManagerAgGrid
          ref={gridRef}
          rowData={list}
          columnDefs={columnDefs}
          selectable
          cellSelection
          getRowId={(p) => String(p.data.postNo)}
          height={720}
          onSelectionChanged={setSelected}
        />
      </section>
    </>
  );
}

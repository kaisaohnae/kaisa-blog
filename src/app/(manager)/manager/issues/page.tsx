'use client';

import {useState} from 'react';
import {apiPost} from '@/config/api-config';
import {Ex3Button} from '@/ui-kit';

type IssueItem = {
  title: string;
};

type SourceKey = 'naver' | 'daum';

type SourceState = {
  items: IssueItem[];
  loading: boolean;
  error: string;
};

const INITIAL: SourceState = {items: [], loading: false, error: ''};

export default function ManagerIssuesPage() {
  const [naver, setNaver] = useState<SourceState>(INITIAL);
  const [daum, setDaum] = useState<SourceState>(INITIAL);

  const load = async (source: SourceKey) => {
    const setState = source === 'naver' ? setNaver : setDaum;
    setState((prev) => ({...prev, loading: true, error: ''}));
    try {
      const body = await apiPost<{list: IssueItem[]}>('bl/get-issue-list', {source, limit: 200}, 'admin');
      setState({items: body.data.list || [], loading: false, error: ''});
    } catch (e: any) {
      setState({items: [], loading: false, error: e.message || 'title 조회에 실패했습니다.'});
    }
  };

  return (
    <div className="manager-issues">
      <SourceCard
        title="Naver"
        state={naver}
        onLoad={() => load('naver')}
      />
      <SourceCard
        title="Daum"
        state={daum}
        onLoad={() => load('daum')}
      />
    </div>
  );
}

function SourceCard({
  title,
  state,
  onLoad,
}: {
  title: string;
  state: SourceState;
  onLoad: () => void;
}) {
  return (
    <section className="ex1-panel manager-issues__card">
      <div className="manager-issues__toolbar ex3-kit">
        <h2>{title}</h2>
        <Ex3Button onClick={onLoad} disabled={state.loading}>
          {state.loading ? '불러오는 중...' : '조회'}
        </Ex3Button>
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.items.length > 0 ? <p className="manager-issues__meta">총 {state.items.length}건</p> : null}
      {state.items.length === 0 && !state.loading ? <p className="muted">표시할 title이 없습니다.</p> : null}
      <div className="manager-issues__box">
        <ol className="manager-issues__list">
          {state.items.map((item, index) => (
            <li key={`${item.title}-${index}`}>{item.title}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

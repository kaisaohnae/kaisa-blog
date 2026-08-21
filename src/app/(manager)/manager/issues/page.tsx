'use client';

import {useState} from 'react';
import {apiPost} from '@/config/api-config';
import {Ex3Button} from '@/ui-kit';

type IssueNewsItem = {
  title: string;
  url: string;
  source?: string | null;
};

type IssueItem = {
  title: string;
  rank?: number;
  traffic?: string | null;
  publishedAt?: string | null;
  detailUrl?: string;
};

type GoogleNewsSection = {
  keyword: string;
  rank: number;
  traffic?: string | null;
  news: IssueNewsItem[];
};

type SourceKey = 'naver' | 'daum' | 'google';

type SourceState = {
  items: IssueItem[];
  loading: boolean;
  error: string;
};

const INITIAL: SourceState = {items: [], loading: false, error: ''};

const SOURCE_META: Record<SourceKey, {title: string}> = {
  naver: {title: 'Naver'},
  daum: {title: 'Daum'},
  google: {title: 'Google Trends (4시간)'},
};

const COPY_FOOTER_PROMPT =
  '블로그에 오늘 이슈다운거 다뤄볼만하거 3개만 작성하고 싶은데 마크다운 문법으로 복사되게 만들어주고 카테고리도 구분되게 알려줘';

function formatSourceList(title: string, items: IssueItem[]) {
  if (!items.length) {
    return '';
  }

  const lines = items.map((item, index) => {
    const rank = item.rank ?? index + 1;
    const traffic = item.traffic ? `\t${item.traffic}` : '';
    return `${rank}. ${item.title}${traffic}`;
  });

  return `[${title}]\n${lines.join('\n')}`;
}

function formatGoogleNews(sections: GoogleNewsSection[]) {
  if (!sections.length) {
    return '';
  }

  const lines = sections.flatMap((section) => {
    const traffic = section.traffic ? ` (${section.traffic})` : '';
    const header = `${section.rank}. ${section.keyword}${traffic}`;
    const articles = section.news.map((article) => {
      const source = article.source ? ` - ${article.source}` : '';
      return `• ${article.title}${source}`;
    });

    return articles.length ? [header, ...articles] : [header];
  });

  return `[Google Trends 뉴스]\n${lines.join('\n')}`;
}

function buildIssuesCopyText({
  googleTrends,
  googleNews,
  naver,
  daum,
}: {
  googleTrends: IssueItem[];
  googleNews: GoogleNewsSection[];
  naver: IssueItem[];
  daum: IssueItem[];
}) {
  const body = [
    formatSourceList(SOURCE_META.google.title, googleTrends),
    formatGoogleNews(googleNews),
    formatSourceList(SOURCE_META.naver.title, naver),
    formatSourceList(SOURCE_META.daum.title, daum),
  ]
    .filter(Boolean)
    .join('\n\n');

  if (!body) {
    return '';
  }

  return `${body}\n\n${COPY_FOOTER_PROMPT}`;
}

export default function ManagerIssuesPage() {
  const [naver, setNaver] = useState<SourceState>(INITIAL);
  const [daum, setDaum] = useState<SourceState>(INITIAL);
  const [googleTrends, setGoogleTrends] = useState<IssueItem[]>([]);
  const [googleNews, setGoogleNews] = useState<GoogleNewsSection[]>([]);
  const [copied, setCopied] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchMessage, setBatchMessage] = useState('');
  const [batchError, setBatchError] = useState('');

  const load = async (source: Exclude<SourceKey, 'google'>) => {
    const setState = source === 'naver' ? setNaver : setDaum;
    setState((prev) => ({...prev, loading: true, error: ''}));
    try {
      const body = await apiPost<{list: IssueItem[]}>('bl/get-issue-list', {source, limit: 200}, 'admin');
      setState({items: body.data.list || [], loading: false, error: ''});
    } catch (e: any) {
      setState({items: [], loading: false, error: e.message || '트렌드 조회에 실패했습니다.'});
    }
  };

  const handleCopyAll = async () => {
    const text = buildIssuesCopyText({
      googleTrends,
      googleNews,
      naver: naver.items,
      daum: daum.items,
    });

    if (!text.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('아래 내용을 복사하세요.', text);
    }
  };

  const handleRunBatch = async () => {
    setBatchRunning(true);
    setBatchError('');
    setBatchMessage('');

    try {
      const body = await apiPost<{
        generatedCount: number;
        createdPosts: Array<{postNo: number; title: string; slug: string; keyword?: string | null; categoryName: string}>;
        createdCategories: string[];
        excludedKeywords?: string[];
        targetCount?: number;
      }>('bl/run-blog-automation', {
        secret: process.env.NEXT_PUBLIC_BLOG_AUTOMATION_SECRET || '',
      }, null, 300000);

      const titles = (body.data.createdPosts || []).map((post) => post.title).join(', ');
      const categories = (body.data.createdCategories || []).join(', ');
      let message = body.message;

      if (body.data.excludedKeywords?.length) {
        message += ` · 제외 키워드: ${body.data.excludedKeywords.join(', ')}`;
      }
      if (body.data.targetCount != null) {
        message += ` · 생성 목표: ${body.data.targetCount}건`;
      }

      if (titles) {
        message += ` · ${titles}`;
      }
      if (categories) {
        message += ` · 카테고리: ${categories}`;
      }

      setBatchMessage(message);
    } catch (e: any) {
      setBatchError(e.message || '배치 실행에 실패했습니다.');
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div className="manager-issues">
      <GoogleTrendsCard
        title={SOURCE_META.google.title}
        onTrendsChange={setGoogleTrends}
        onNewsChange={setGoogleNews}
      />
      <SourceCard
        title={SOURCE_META.naver.title}
        state={naver}
        source="naver"
        onLoad={() => load('naver')}
      />
      <SourceCard
        title={SOURCE_META.daum.title}
        state={daum}
        source="daum"
        onLoad={() => load('daum')}
      />
      <div className="manager-issues__footer ex3-kit">
        <Ex3Button onClick={handleCopyAll}>{copied ? '복사됨' : '전체 텍스트 복사'}</Ex3Button>
        <Ex3Button onClick={handleRunBatch} disabled={batchRunning}>
          {batchRunning ? '실행 중...' : '배치실행'}
        </Ex3Button>
      </div>
      {batchError ? <p className="form-error manager-issues__batch-result">{batchError}</p> : null}
      {!batchError && batchMessage ? <p className="manager-issues__batch-result">{batchMessage}</p> : null}
    </div>
  );
}

function SourceCard({
  title,
  state,
  source,
  onLoad,
}: {
  title: string;
  state: SourceState;
  source: Exclude<SourceKey, 'google'>;
  onLoad: () => void;
}) {
  return (
    <section className={`ex1-panel manager-issues__card manager-issues__card--${source}`}>
      <div className="manager-issues__toolbar ex3-kit">
        <h2>{title}</h2>
        <Ex3Button onClick={onLoad}>조회</Ex3Button>
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
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

function GoogleTrendsCard({
  title,
  onTrendsChange,
  onNewsChange,
}: {
  title: string;
  onTrendsChange: (items: IssueItem[]) => void;
  onNewsChange: (sections: GoogleNewsSection[]) => void;
}) {
  const [trends, setTrends] = useState<IssueItem[]>([]);
  const [trendsError, setTrendsError] = useState('');
  const [newsSections, setNewsSections] = useState<GoogleNewsSection[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [newsProgress, setNewsProgress] = useState('');

  const handleLoad = async () => {
    setTrendsError('');
    setNewsError('');
    setNewsProgress('');
    setTrends([]);
    setNewsSections([]);
    onTrendsChange([]);
    onNewsChange([]);

    try {
      const body = await apiPost<{list: IssueItem[]}>('bl/get-issue-list', {source: 'google', limit: 10}, 'admin');
      const items = body.data.list || [];
      setTrends(items);
      onTrendsChange(items);

      if (!items.length) {
        return;
      }

      setNewsLoading(true);
      const sections: GoogleNewsSection[] = [];

      for (const item of items) {
        setNewsProgress(item.title);
        try {
          const newsBody = await apiPost<{news: IssueNewsItem[]}>(
            'bl/get-issue-list',
            {source: 'google', keyword: item.title},
            'admin',
          );
          sections.push({
            keyword: item.title,
            rank: item.rank ?? sections.length + 1,
            traffic: item.traffic,
            news: newsBody.data.news || [],
          });
          setNewsSections([...sections]);
          onNewsChange([...sections]);
        } catch (e: any) {
          setNewsError(e.message || '뉴스 조회에 실패했습니다.');
          break;
        }
      }
    } catch (e: any) {
      setTrendsError(e.message || '트렌드 조회에 실패했습니다.');
      setTrends([]);
      setNewsSections([]);
      onTrendsChange([]);
      onNewsChange([]);
    } finally {
      setNewsLoading(false);
      setNewsProgress('');
    }
  };

  return (
    <>
      <section className="ex1-panel manager-issues__card manager-issues__card--google">
        <div className="manager-issues__toolbar ex3-kit">
          <h2>{title}</h2>
          <Ex3Button onClick={handleLoad}>조회</Ex3Button>
        </div>
        {trendsError ? <p className="form-error">{trendsError}</p> : null}
        <div className="manager-issues__box">
          <ol className="manager-issues__list manager-issues__list--google">
            {trends.map((item, index) => (
              <li key={`${item.title}-${index}`} className="manager-issues__trend-row">
                <span className="manager-issues__rank">{item.rank ?? index + 1}</span>
                <span className="manager-issues__keyword">{item.title}</span>
                {item.traffic ? <span className="manager-issues__traffic">{item.traffic}</span> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {(newsLoading || newsSections.length > 0) && (
        <section className="ex1-panel manager-issues__news-panel">
          <div className="manager-issues__news-panel-head">
            <h2>Google Trends 뉴스</h2>
            {newsLoading ? <span className="manager-issues__meta">뉴스 불러오는 중… {newsProgress}</span> : null}
          </div>
          {newsError ? <p className="form-error">{newsError}</p> : null}
          <div className="manager-issues__news-panel-body">
            {newsSections.map((section) => (
              <article key={section.keyword} className="manager-issues__news-group">
                <h3 className="manager-issues__news-group-title">
                  <span className="manager-issues__rank">{section.rank}</span>
                  {section.keyword}
                  {section.traffic ? <span className="manager-issues__traffic">{section.traffic}</span> : null}
                </h3>
                {section.news.length ? (
                  <ul className="manager-issues__news-list">
                    {section.news.map((article, articleIndex) => (
                      <li key={`${article.url}-${articleIndex}`}>
                        <a href={article.url} target="_blank" rel="noreferrer">
                          {article.title}
                        </a>
                        {article.source ? <span className="manager-issues__news-source">{article.source}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

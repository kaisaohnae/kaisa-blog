'use client';

import {useMemo} from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './manager-dashboard.css';

const ACCENT = '#ff4d00';
const MUTED = '#e6e0d6';
const COLORS = ['#ff4d00', '#171717', '#0090ff', '#0f9d58', '#f5a524', '#6f6a62'];

type Post = {
  title: string;
  isDisplay: string;
  viewCount?: number;
  createDt?: string;
};

type Member = {
  memberStateCode: string;
  createDt?: string;
};

type PieItem = {name: string; value: number; empty?: boolean};

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #e6e0d6',
  fontSize: 12,
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function last12Months() {
  const now = new Date();
  return Array.from({length: 12}, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return {key: monthKey(date), label: `${date.getMonth() + 1}월`};
  });
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function withEmptyPie(data: PieItem[], emptyLabel = '데이터 없음'): PieItem[] {
  if (data.length > 0) return data;
  return [{name: emptyLabel, value: 1, empty: true}];
}

function ChartBox({
  children,
  tall,
  empty,
}: {
  children: React.ReactNode;
  tall?: boolean;
  empty?: boolean;
}) {
  return (
    <div className={tall ? 'ex1-chart-box ex1-chart-box--tall' : 'ex1-chart-box'}>
      {children}
      {empty ? <p className="ex1-chart-box__empty">데이터 없음</p> : null}
    </div>
  );
}

export default function ManagerDashboardCharts({posts = [], members = []}: {posts?: Post[]; members?: Member[]}) {
  const months = useMemo(() => last12Months(), []);

  const totalViews = useMemo(
    () => posts.reduce((sum, post) => sum + (post.viewCount || 0), 0),
    [posts],
  );

  const monthlyPosts = useMemo(() => {
    const counts = new Map(months.map((item) => [item.key, 0]));
    posts.forEach((post) => {
      const date = parseDate(post.createDt);
      if (!date) return;
      const key = monthKey(date);
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return months.map((item) => ({name: item.label, count: counts.get(item.key) || 0}));
  }, [months, posts]);

  const monthlyMembers = useMemo(() => {
    const counts = new Map(months.map((item) => [item.key, 0]));
    members.forEach((member) => {
      const date = parseDate(member.createDt);
      if (!date) return;
      const key = monthKey(date);
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return months.map((item) => ({name: item.label, count: counts.get(item.key) || 0}));
  }, [members, months]);

  const displayPie = useMemo(() => {
    const open = posts.filter((post) => post.isDisplay === 'Y').length;
    const hidden = posts.length - open;
    return withEmptyPie(
      [
        {name: '공개', value: open},
        {name: '비공개', value: hidden},
      ].filter((item) => item.value > 0),
    );
  }, [posts]);

  const memberPie = useMemo(() => {
    const labels: Record<string, string> = {A: '활성', S: '정지', D: '탈퇴'};
    const counts = {A: 0, S: 0, D: 0};
    members.forEach((member) => {
      const code = member.memberStateCode as keyof typeof counts;
      if (code in counts) counts[code] += 1;
    });
    return withEmptyPie(
      Object.entries(counts)
        .map(([code, value]) => ({name: labels[code], value}))
        .filter((item) => item.value > 0),
    );
  }, [members]);

  const viewBars = useMemo(() => {
    const bars = [...posts]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 6)
      .map((post) => ({
        name: post.title.length > 10 ? `${post.title.slice(0, 10)}…` : post.title,
        count: post.viewCount || 0,
      }));
    return bars;
  }, [posts]);

  const viewBarsEmpty = viewBars.length === 0;
  const viewBarData = viewBarsEmpty ? [{name: '—', count: 0}] : viewBars;
  const displayPieEmpty = displayPie[0]?.empty;
  const memberPieEmpty = memberPie[0]?.empty;

  return (
    <div className="ex1-dash">
      <section className="ex1-dash__stats">
        <article className="ex1-stat">
          <p className="ex1-stat__label">글</p>
          <p className="ex1-stat__value">{posts.length}</p>
        </article>
        <article className="ex1-stat">
          <p className="ex1-stat__label">조회</p>
          <p className="ex1-stat__value">{totalViews}</p>
        </article>
        <article className="ex1-stat">
          <p className="ex1-stat__label">공개</p>
          <p className="ex1-stat__value">{posts.filter((post) => post.isDisplay === 'Y').length}</p>
        </article>
        <article className="ex1-stat">
          <p className="ex1-stat__label">회원</p>
          <p className="ex1-stat__value">{members.length}</p>
        </article>
      </section>

      <div className="ex1-dash__grid">
        <section className="ex1-panel ex1-panel--chart">
          <div className="ex1-panel__head ex1-panel__head--compact">
            <h2>월별 글 작성</h2>
            <p>최근 12개월</p>
          </div>
          <ChartBox tall>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPosts} margin={{top: 12, right: 12, left: -18, bottom: 0}}>
                <defs>
                  <linearGradient id="dashPostArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={MUTED} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6f6a62'}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#6f6a62'}} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" name="글" stroke={ACCENT} strokeWidth={2} fill="url(#dashPostArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>
        </section>

        <section className="ex1-panel ex1-panel--chart">
          <div className="ex1-panel__head ex1-panel__head--compact">
            <h2>공개 비율</h2>
            <p>공개 / 비공개</p>
          </div>
          <ChartBox empty={displayPieEmpty}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="52%"
                  outerRadius="78%"
                  paddingAngle={displayPieEmpty ? 0 : 4}
                  stroke="none"
                >
                  {displayPie.map((item, index) => (
                    <Cell key={item.name} fill={item.empty ? MUTED : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </section>

        <section className="ex1-panel ex1-panel--chart">
          <div className="ex1-panel__head ex1-panel__head--compact">
            <h2>조회수 TOP</h2>
            <p>상위 6개 글</p>
          </div>
          <ChartBox tall empty={viewBarsEmpty}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewBarData} margin={{top: 12, right: 12, left: -18, bottom: 0}} barCategoryGap="24%">
                <CartesianGrid stroke={MUTED} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6f6a62'}} axisLine={false} tickLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#6f6a62'}} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="조회" fill={ACCENT} radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </section>

        <section className="ex1-panel ex1-panel--chart">
          <div className="ex1-panel__head ex1-panel__head--compact">
            <h2>회원</h2>
            <p>상태 · 월별 가입</p>
          </div>
          <div className="ex1-chart-split">
            <div className="ex1-chart-split__item">
              <p className="ex1-chart-split__label">상태</p>
              <ChartBox empty={memberPieEmpty}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memberPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="48%"
                      outerRadius="72%"
                      paddingAngle={memberPieEmpty ? 0 : 3}
                      stroke="none"
                    >
                      {memberPie.map((item, index) => (
                        <Cell key={item.name} fill={item.empty ? MUTED : COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>
            <div className="ex1-chart-split__item">
              <p className="ex1-chart-split__label">월별 가입</p>
              <ChartBox>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyMembers} margin={{top: 8, right: 8, left: -22, bottom: 0}} barCategoryGap="20%">
                    <CartesianGrid stroke={MUTED} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6f6a62'}} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{fontSize: 10, fill: '#6f6a62'}} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="가입" fill="#171717" radius={[5, 5, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

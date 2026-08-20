'use client';

import {useEffect, useState} from 'react';
import ManagerDashboardCharts from '@/components/manager/manager-dashboard-charts';
import {apiPost} from '@/config/api-config';

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

export default function ManagerHomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    apiPost<{list: Post[]}>('bl/get-post-list', {adminYn: 'Y', totalPage: 100}, 'admin')
      .then((body) => setPosts(body.data.list || []))
      .catch(() => setPosts([]));
    apiPost<{list: Member[]}>('bl/get-member-list', {totalPage: 100}, 'admin')
      .then((body) => setMembers(body.data.list || []))
      .catch(() => setMembers([]));
  }, []);

  return <ManagerDashboardCharts posts={posts} members={members} />;
}

'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {Ex3Button, Ex3Textarea} from '@/ui-kit';
import {apiPost} from '@/config/api-config';
import useMemberStore from '@/store/use-member-store';

type CommentItem = {
  commentNo: number;
  content: string;
  createDt?: string;
  member?: {memberName?: string; email?: string};
};

export default function CommentSection({postNo}: {postNo: number}) {
  const member = useMemberStore((s) => s.member);
  const [list, setList] = useState<CommentItem[]>([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    apiPost<{list: CommentItem[]}>('bl/get-comment-list', {postNo})
      .then((body) => setList(body.data.list || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, [postNo]);

  const submit = async () => {
    setMessage('');
    try {
      await apiPost('bl/set-comment', {postNo, content}, 'member');
      setContent('');
      load();
    } catch (e: any) {
      setMessage(e.message || '댓글 등록에 실패했습니다.');
    }
  };

  return (
    <section className="comment-box">
      <h2>댓글 {list.length}</h2>
      {member ? (
        <div className="comment-form ex3-kit">
          <Ex3Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="댓글을 남겨 주세요" rows={4} />
          <Ex3Button onClick={submit} disabled={!content.trim()}>
            등록
          </Ex3Button>
          {message && <p className="form-error">{message}</p>}
        </div>
      ) : (
        <p className="muted">
          댓글은 회원만 작성할 수 있습니다. <Link href="/login/">로그인</Link> 또는 <Link href="/register/">회원가입</Link>
        </p>
      )}
      <ul className="comment-list">
        {list.map((item) => (
          <li key={item.commentNo}>
            <strong>{item.member?.memberName || '회원'}</strong>
            <span>{item.createDt ? String(item.createDt).slice(0, 16) : ''}</span>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>
      {list.length === 0 ? <p className="muted empty-state">아직 댓글이 없습니다.</p> : null}
    </section>
  );
}

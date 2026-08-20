'use client';

import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';
import {Ex3Button, Ex3Textarea} from '@/ui-kit';
import {apiPost} from '@/config/api-config';
import useMemberStore from '@/store/use-member-store';

type CommentItem = {
  commentNo: number;
  memberId?: string;
  content: string;
  createDt?: string;
  updateDt?: string;
  member?: {memberName?: string; email?: string};
};

export default function CommentSection({postNo}: {postNo: number}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const member = useMemberStore((s) => s.member);
  const hydrated = useMemberStore((s) => s.hydrated);
  const [list, setList] = useState<CommentItem[]>([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [busyNo, setBusyNo] = useState<number | null>(null);

  const returnUrl = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const loginHref = `/login/?returnUrl=${encodeURIComponent(returnUrl)}`;
  const registerHref = `/register/?returnUrl=${encodeURIComponent(returnUrl)}`;

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
      await apiPost('bl/set-comment', {postNo, content, mode: 'C'}, 'member');
      setContent('');
      load();
    } catch (e: any) {
      setMessage(e.message || '댓글 등록에 실패했습니다.');
    }
  };

  const startEdit = (item: CommentItem) => {
    setEditingNo(item.commentNo);
    setEditingContent(item.content);
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingNo(null);
    setEditingContent('');
  };

  const saveEdit = async (commentNo: number) => {
    if (!editingContent.trim()) return;
    setBusyNo(commentNo);
    setMessage('');
    try {
      await apiPost('bl/set-comment', {commentNo, content: editingContent.trim(), mode: 'U'}, 'member');
      cancelEdit();
      load();
    } catch (e: any) {
      setMessage(e.message || '댓글 수정에 실패했습니다.');
    } finally {
      setBusyNo(null);
    }
  };

  const remove = async (commentNo: number) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;
    setBusyNo(commentNo);
    setMessage('');
    try {
      await apiPost('bl/set-comment', {commentNo, mode: 'D'}, 'member');
      if (editingNo === commentNo) cancelEdit();
      load();
    } catch (e: any) {
      setMessage(e.message || '댓글 삭제에 실패했습니다.');
    } finally {
      setBusyNo(null);
    }
  };

  const formatDate = (value?: string) => (value ? String(value).slice(0, 16).replace('T', ' ') : '');

  return (
    <section className="comment-box">
      <div className="comment-box__head">
        <h2>댓글</h2>
        <span className="comment-box__count">{list.length}</span>
      </div>

      {!hydrated ? (
        <div className="comment-guest comment-guest--loading" aria-hidden />
      ) : member ? (
        <div className="comment-form ex3-kit">
          <Ex3Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 남겨 주세요"
            rows={4}
          />
          <div className="comment-form__actions">
            <span className="comment-form__user">{member.memberName}님으로 작성 중</span>
            <Ex3Button onClick={submit} disabled={!content.trim()}>
              등록
            </Ex3Button>
          </div>
        </div>
      ) : (
        <div className="comment-guest">
          <div className="comment-guest__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M7 9h10M7 13h6M21 12c0 4.418-4.03 8-9 8-1.05 0-2.06-.15-3-.42L3 21l1.42-5.01C3.52 14.6 3 13.34 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="comment-guest__body">
            <p className="comment-guest__title">로그인하고 댓글을 남겨보세요</p>
            <p className="comment-guest__desc">댓글은 회원만 작성할 수 있습니다.</p>
          </div>
          <div className="comment-guest__actions">
            <Link href={loginHref} className="comment-guest__btn comment-guest__btn--primary">
              로그인
            </Link>
            <Link href={registerHref} className="comment-guest__btn">
              회원가입
            </Link>
          </div>
        </div>
      )}

      {message && <p className="form-error comment-box__message">{message}</p>}

      {list.length === 0 ? (
        <p className="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="comment-list">
          {list.map((item) => {
            const isOwner = member?.memberId && item.memberId === member.memberId;
            const isEditing = editingNo === item.commentNo;
            const isBusy = busyNo === item.commentNo;

            return (
              <li key={item.commentNo} className="comment-item">
                <div className="comment-item__head">
                  <div className="comment-item__meta">
                    <strong>{item.member?.memberName || '회원'}</strong>
                    <time dateTime={item.createDt}>{formatDate(item.createDt)}</time>
                    {item.updateDt && item.updateDt !== item.createDt ? (
                      <span className="comment-item__edited">수정됨</span>
                    ) : null}
                  </div>
                  {isOwner && !isEditing ? (
                    <div className="comment-item__actions">
                      <button type="button" className="text-btn" onClick={() => startEdit(item)} disabled={isBusy}>
                        수정
                      </button>
                      <button type="button" className="text-btn text-btn--danger" onClick={() => remove(item.commentNo)} disabled={isBusy}>
                        삭제
                      </button>
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="comment-edit ex3-kit">
                    <Ex3Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      disabled={isBusy}
                    />
                    <div className="comment-edit__actions">
                      <Ex3Button variant="secondary" uiSize="sm" onClick={cancelEdit} disabled={isBusy}>
                        취소
                      </Ex3Button>
                      <Ex3Button uiSize="sm" onClick={() => saveEdit(item.commentNo)} disabled={isBusy || !editingContent.trim()}>
                        저장
                      </Ex3Button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-item__content">{item.content}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

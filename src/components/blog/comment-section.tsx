'use client';

import {useEffect, useMemo, useState} from 'react';
import {KaisaButton, KaisaTextarea} from '@/ui-kit';
import {apiPost} from '@/config/api-config';
import useMemberStore from '@/store/use-member-store';

type CommentItem = {
  commentNo: number;
  parentCommentNo?: number | null;
  memberId?: string;
  content: string;
  createDt?: string;
  updateDt?: string;
  member?: {memberName?: string; email?: string};
};

function buildThreads(list: CommentItem[]) {
  const roots: CommentItem[] = [];
  const replies = new Map<number, CommentItem[]>();

  for (const item of list) {
    if (item.parentCommentNo) {
      const bucket = replies.get(item.parentCommentNo) || [];
      bucket.push(item);
      replies.set(item.parentCommentNo, bucket);
    } else {
      roots.push(item);
    }
  }

  return {roots, replies};
}

export default function CommentSection({postNo}: {postNo: number}) {
  const member = useMemberStore((s) => s.member);
  const hydrated = useMemberStore((s) => s.hydrated);
  const [list, setList] = useState<CommentItem[]>([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingNo, setReplyingNo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [busyNo, setBusyNo] = useState<number | null>(null);

  const threads = useMemo(() => buildThreads(list), [list]);

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

  const submitReply = async (parentCommentNo: number) => {
    if (!replyContent.trim()) return;
    setBusyNo(parentCommentNo);
    setMessage('');
    try {
      await apiPost(
        'bl/set-comment',
        {postNo, content: replyContent.trim(), parentCommentNo, mode: 'C'},
        'member',
      );
      setReplyingNo(null);
      setReplyContent('');
      load();
    } catch (e: any) {
      setMessage(e.message || '답글 등록에 실패했습니다.');
    } finally {
      setBusyNo(null);
    }
  };

  const startEdit = (item: CommentItem) => {
    setEditingNo(item.commentNo);
    setEditingContent(item.content);
    setReplyingNo(null);
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingNo(null);
    setEditingContent('');
  };

  const startReply = (commentNo: number) => {
    setReplyingNo(commentNo);
    setReplyContent('');
    cancelEdit();
    setMessage('');
  };

  const cancelReply = () => {
    setReplyingNo(null);
    setReplyContent('');
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
      if (replyingNo === commentNo) cancelReply();
      load();
    } catch (e: any) {
      setMessage(e.message || '댓글 삭제에 실패했습니다.');
    } finally {
      setBusyNo(null);
    }
  };

  const formatDate = (value?: string) => (value ? String(value).slice(0, 16).replace('T', ' ') : '');

  const renderComment = (item: CommentItem, isReply = false) => {
    const isOwner = member?.memberId && item.memberId === member.memberId;
    const isEditing = editingNo === item.commentNo;
    const isReplying = replyingNo === item.commentNo;
    const isBusy = busyNo === item.commentNo;
    const canReply = Boolean(member) && !item.parentCommentNo;

    return (
      <li key={item.commentNo} className={isReply ? 'comment-item comment-item--reply' : 'comment-item'}>
        <div className="comment-item__head">
          <div className="comment-item__meta">
            <strong>{item.member?.memberName || '회원'}</strong>
            {isReply ? <span className="comment-item__badge">답글</span> : null}
            <time dateTime={item.createDt}>{formatDate(item.createDt)}</time>
            {item.updateDt && item.updateDt !== item.createDt ? (
              <span className="comment-item__edited">수정됨</span>
            ) : null}
          </div>
          <div className="comment-item__actions">
            {canReply && !isEditing ? (
              <button type="button" className="text-btn" onClick={() => startReply(item.commentNo)} disabled={isBusy}>
                답글
              </button>
            ) : null}
            {isOwner && !isEditing ? (
              <>
                <button type="button" className="text-btn" onClick={() => startEdit(item)} disabled={isBusy}>
                  수정
                </button>
                <button type="button" className="text-btn text-btn--danger" onClick={() => remove(item.commentNo)} disabled={isBusy}>
                  삭제
                </button>
              </>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <div className="comment-edit kaisa-kit">
            <KaisaTextarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={3}
              disabled={isBusy}
            />
            <div className="comment-edit__actions">
              <KaisaButton variant="secondary" uiSize="sm" onClick={cancelEdit} disabled={isBusy}>
                취소
              </KaisaButton>
              <KaisaButton uiSize="sm" onClick={() => saveEdit(item.commentNo)} disabled={isBusy || !editingContent.trim()}>
                저장
              </KaisaButton>
            </div>
          </div>
        ) : (
          <p className="comment-item__content">{item.content}</p>
        )}

        {isReplying ? (
          <div className="comment-reply-form kaisa-kit">
            <KaisaTextarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 입력해 주세요"
              rows={3}
              disabled={isBusy}
            />
            <div className="comment-edit__actions">
              <KaisaButton variant="secondary" uiSize="sm" onClick={cancelReply} disabled={isBusy}>
                취소
              </KaisaButton>
              <KaisaButton uiSize="sm" onClick={() => submitReply(item.commentNo)} disabled={isBusy || !replyContent.trim()}>
                답글 등록
              </KaisaButton>
            </div>
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <section className="comment-box">
      <div className="comment-box__head">
        <h2>댓글</h2>
        <span className="comment-box__count">{list.length}</span>
      </div>

      {!hydrated ? (
        <div className="comment-guest comment-guest--loading" aria-hidden />
      ) : member ? (
        <div className="comment-form kaisa-kit">
          <KaisaTextarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 남겨 주세요"
            rows={4}
          />
          <div className="comment-form__actions">
            <span className="comment-form__user">{member.memberName}님으로 작성 중</span>
            <KaisaButton onClick={submit} disabled={!content.trim()}>
              등록
            </KaisaButton>
          </div>
        </div>
      ) : (
        <div className="comment-guest">
          <p className="comment-guest__text">댓글은 회원만 작성할 수 있습니다.</p>
        </div>
      )}

      {message && <p className="form-error comment-box__message">{message}</p>}

      {list.length === 0 ? (
        <p className="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="comment-list">
          {threads.roots.map((item) => {
            const replies = threads.replies.get(item.commentNo) || [];
            return (
              <li key={item.commentNo} className="comment-thread">
                <ul className="comment-list comment-list--flat">
                  {renderComment(item)}
                </ul>
                {replies.length ? (
                  <ul className="comment-replies">
                    {replies.map((reply) => renderComment(reply, true))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

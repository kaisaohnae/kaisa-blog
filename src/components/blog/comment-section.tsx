'use client';

import {useEffect, useMemo, useState} from 'react';
import {KaisaButton, KaisaTextarea} from '@/ui-kit';
import {apiPost} from '@/config/api-config';
import useMemberStore from '@/store/use-member-store';

const SITE_CODE = 'kaisa-blog';
const COMMENT_MAX = 500;

type CommentItem = {
  requestNo: number;
  parentRequestNo?: number | null;
  nickname: string;
  content: string;
  createDt?: string | null;
};

type ListResponse = {
  list: CommentItem[];
};

function buildThreads(list: CommentItem[]) {
  const roots: CommentItem[] = [];
  const replies = new Map<number, CommentItem[]>();

  for (const item of list) {
    if (item.parentRequestNo) {
      const bucket = replies.get(item.parentRequestNo) || [];
      bucket.push(item);
      replies.set(item.parentRequestNo, bucket);
    } else {
      roots.push(item);
    }
  }

  return {roots, replies};
}

function formatDate(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 16).replace('T', ' ');
}

export default function CommentSection({pathKey}: {pathKey: string}) {
  const member = useMemberStore(s => s.member);
  const hydrated = useMemberStore(s => s.hydrated);
  const hydrate = useMemberStore(s => s.hydrate);
  const [list, setList] = useState<CommentItem[]>([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [replyingNo, setReplyingNo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [busy, setBusy] = useState(false);

  const threads = useMemo(() => buildThreads(list), [list]);

  const load = () => {
    apiPost<ListResponse>('tl/get-request-list', {
      siteCode: SITE_CODE,
      toolKey: pathKey,
      page: 1,
      pageSize: 50,
    })
      .then(body => setList(body.data.list || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    load();
  }, [pathKey]);

  const submit = async (text: string, parentRequestNo?: number) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    setMessage('');
    try {
      await apiPost(
        'tl/set-request',
        {
          siteCode: SITE_CODE,
          toolKey: pathKey,
          content: trimmed,
          parentRequestNo,
        },
        'member',
      );
      setContent('');
      setReplyContent('');
      setReplyingNo(null);
      load();
    } catch (err: any) {
      setMessage(err.message || '댓글 등록에 실패했습니다.');
    } finally {
      setBusy(false);
    }
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
            onChange={e => setContent(e.target.value)}
            placeholder="댓글을 남겨 주세요"
            rows={4}
            maxLength={COMMENT_MAX}
          />
          <div className="comment-form__actions">
            <span className="comment-form__user">
              {member.memberName}님으로 작성 중 ({content.length}/{COMMENT_MAX})
            </span>
            <KaisaButton onClick={() => void submit(content)} disabled={busy || !content.trim()}>
              등록
            </KaisaButton>
          </div>
        </div>
      ) : (
        <div className="comment-guest">
          <p className="comment-guest__text">댓글은 로그인 후 작성할 수 있습니다.</p>
        </div>
      )}

      {message ? <p className="form-error comment-box__message">{message}</p> : null}

      {list.length === 0 ? (
        <p className="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="comment-list">
          {threads.roots.map(item => {
            const childReplies = threads.replies.get(item.requestNo) || [];
            return (
              <li key={item.requestNo} className="comment-thread">
                <ul className="comment-list comment-list--flat">
                  <li className="comment-item">
                    <div className="comment-item__head">
                      <div className="comment-item__meta">
                        <strong>{item.nickname}</strong>
                        <time dateTime={item.createDt || undefined}>{formatDate(item.createDt)}</time>
                      </div>
                      {hydrated && member ? (
                        <div className="comment-item__actions">
                          <button type="button" className="text-btn" onClick={() => setReplyingNo(item.requestNo)}>
                            답글
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <p className="comment-item__content">{item.content}</p>
                    {hydrated && member && replyingNo === item.requestNo ? (
                      <div className="comment-reply-form kaisa-kit">
                        <KaisaTextarea
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                          placeholder="답글을 입력해 주세요"
                          rows={3}
                          maxLength={COMMENT_MAX}
                          disabled={busy}
                        />
                        <div className="comment-edit__actions">
                          <span className="comment-form__user">
                            {member.memberName}님으로 작성 중 ({replyContent.length}/{COMMENT_MAX})
                          </span>
                          <div className="comment-edit__buttons">
                          <KaisaButton variant="secondary" uiSize="sm" onClick={() => setReplyingNo(null)} disabled={busy}>
                            취소
                          </KaisaButton>
                          <KaisaButton
                            uiSize="sm"
                            onClick={() => void submit(replyContent, item.requestNo)}
                            disabled={busy || !replyContent.trim()}
                          >
                            답글 등록
                          </KaisaButton>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </li>
                </ul>
                {childReplies.length ? (
                  <ul className="comment-replies">
                    {childReplies.map(reply => (
                      <li key={reply.requestNo} className="comment-item comment-item--reply">
                        <div className="comment-item__head">
                          <div className="comment-item__meta">
                            <strong>{reply.nickname}</strong>
                            <span className="comment-item__badge">답글</span>
                            <time dateTime={reply.createDt || undefined}>{formatDate(reply.createDt)}</time>
                          </div>
                        </div>
                        <p className="comment-item__content">{reply.content}</p>
                      </li>
                    ))}
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

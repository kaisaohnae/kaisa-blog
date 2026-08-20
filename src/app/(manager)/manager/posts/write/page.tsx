'use client';

import {Suspense, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import PostEditor, {isEditorEmpty} from '@/components/editor/post-editor';
import {apiPost} from '@/config/api-config';
import {LoadingFallback} from '@/ui-components';
import {Ex3Button, Ex3Field, Ex3Input, Ex3Select} from '@/ui-kit';

type Category = {categoryId: number; categoryName: string};

function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function PostWriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postNo = searchParams.get('postNo');
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isDisplay, setIsDisplay] = useState('Y');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(!postNo);

  useEffect(() => {
    apiPost<{list: Category[]}>('bl/get-category-list', {})
      .then((body) => setCategories(body.data.list || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!postNo) return;
    apiPost<any>('bl/get-post', {postNo: Number(postNo), adminYn: 'Y'}, 'admin')
      .then((body) => {
        const post = body.data;
        setTitle(post.title || '');
        setSlug(post.slug || '');
        setExcerpt(post.excerpt || '');
        setContent(post.content || '');
        setCategoryId(String(post.categoryId || ''));
        setIsDisplay(post.isDisplay || 'Y');
      })
      .finally(() => setReady(true));
  }, [postNo]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isEditorEmpty(content)) {
      setError('본문을 입력해 주세요.');
      return;
    }
    try {
      await apiPost(
        'bl/set-post-list',
        [
          {
            mode: postNo ? 'U' : 'C',
            postNo: postNo ? Number(postNo) : undefined,
            title,
            slug: slug || slugify(title),
            excerpt,
            content,
            categoryId: categoryId ? Number(categoryId) : null,
            isDisplay,
          },
        ],
        'admin',
      );
      router.push('/manager/posts/');
    } catch (err: any) {
      setError(err.message || '저장에 실패했습니다.');
    }
  };

  return (
    <form className="ex1-panel post-write" onSubmit={save}>
      <div className="post-write__meta">
        <Ex3Field label="제목" htmlFor="post-title" required>
          <Ex3Input
            id="post-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!postNo) setSlug(slugify(e.target.value));
            }}
            required
          />
        </Ex3Field>
        <Ex3Field label="슬러그" htmlFor="post-slug" required>
          <Ex3Input id="post-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </Ex3Field>
        <Ex3Field label="카테고리" htmlFor="post-category">
          <Ex3Select id="post-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">선택</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </Ex3Select>
        </Ex3Field>
        <Ex3Field label="공개" htmlFor="post-display">
          <Ex3Select id="post-display" value={isDisplay} onChange={(e) => setIsDisplay(e.target.value)}>
            <option value="Y">공개</option>
            <option value="N">비공개</option>
          </Ex3Select>
        </Ex3Field>
        <Ex3Button type="submit">저장</Ex3Button>
      </div>
      <Ex3Field label="요약" htmlFor="post-excerpt">
        <Ex3Input id="post-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </Ex3Field>
      {ready ? (
        <PostEditor key={postNo || 'new'} value={content} onChange={setContent} />
      ) : (
        <div className="post-editor post-editor--loading" aria-hidden />
      )}
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PostWriteForm />
    </Suspense>
  );
}

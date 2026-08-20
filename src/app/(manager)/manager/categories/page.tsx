'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import CategoryTreeBoard from '@/components/manager/category-tree-board';
import type {CategoryTreeNode} from '@/components/manager/category-tree-utils';
import '@/components/manager/manager-category.css';
import {apiPost} from '@/config/api-config';
import {Ex3Button, Ex3Field, Ex3Input, Ex3Select} from '@/ui-kit';

type Category = {
  categoryId: number;
  categoryName: string;
  slug: string;
  sortOrder: number;
  isDisplay: 'Y' | 'N';
};

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function toTreeNodes(list: Category[]): CategoryTreeNode[] {
  return [...list]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.categoryId - b.categoryId)
    .map((item) => ({
      id: String(item.categoryId),
      label: item.categoryName,
      slug: item.slug,
      isDisplay: item.isDisplay,
      kind: 'leaf' as const,
    }));
}

function toCategoryPayload(nodes: CategoryTreeNode[], source: Category[]) {
  const map = new Map(source.map((item) => [String(item.categoryId), item]));
  return nodes.map((node, index) => {
    const origin = map.get(node.id);
    return {
      mode: 'U' as const,
      categoryId: Number(node.id),
      categoryName: origin?.categoryName ?? node.label,
      slug: origin?.slug ?? node.slug,
      isDisplay: origin?.isDisplay ?? node.isDisplay,
      sortOrder: index + 1,
    };
  });
}

export default function ManagerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeNodes, setTreeNodes] = useState<CategoryTreeNode[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [isDisplay, setIsDisplay] = useState<'Y' | 'N'>('Y');
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const body = await apiPost<{list: Category[]}>('bl/get-category-list', {adminYn: 'Y'}, 'admin');
    const list = body.data.list || [];
    setCategories(list);
    setTreeNodes(toTreeNodes(list));
  }, []);

  useEffect(() => {
    load().catch(() => {
      setCategories([]);
      setTreeNodes([]);
    });
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setCategoryName('');
    setSlug('');
    setIsDisplay('Y');
    setSlugTouched(false);
  };

  const saveOrder = async (nextNodes: CategoryTreeNode[], source = categories) => {
    const payload = toCategoryPayload(nextNodes, source);
    if (!payload.length) return;
    await apiPost('bl/set-category-list', payload, 'admin');
    await load();
  };

  const onReorder = async (nextNodes: CategoryTreeNode[]) => {
    setTreeNodes(nextNodes);
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await saveOrder(nextNodes);
      setMessage('카테고리 순서가 저장되었습니다.');
    } catch (e: any) {
      setError(e.message || '순서 저장에 실패했습니다.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    const nextSlug = slug.trim() || slugify(categoryName);
    if (!categoryName.trim() || !nextSlug) {
      setError('카테고리명과 슬러그를 입력해 주세요.');
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await apiPost(
          'bl/set-category-list',
          [
            {
              mode: 'U',
              categoryId: editingId,
              categoryName: categoryName.trim(),
              slug: nextSlug,
              isDisplay,
            },
          ],
          'admin',
        );
        setMessage('카테고리가 수정되었습니다.');
      } else {
        await apiPost(
          'bl/set-category-list',
          [
            {
              mode: 'C',
              categoryName: categoryName.trim(),
              slug: nextSlug,
              isDisplay,
              sortOrder: categories.length + 1,
            },
          ],
          'admin',
        );
        setMessage('카테고리가 추가되었습니다.');
      }
      resetForm();
      await load();
    } catch (e: any) {
      setError(e.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (node: CategoryTreeNode) => {
    setEditingId(Number(node.id));
    setCategoryName(node.label);
    setSlug(node.slug);
    setIsDisplay(node.isDisplay);
    setSlugTouched(true);
    setError('');
    setMessage('');
  };

  const remove = async (node: CategoryTreeNode) => {
    if (!window.confirm(`"${node.label}" 카테고리를 삭제할까요?`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await apiPost('bl/set-category-list', [{mode: 'D', categoryId: Number(node.id)}], 'admin');
      if (editingId === Number(node.id)) resetForm();
      setMessage('카테고리가 삭제되었습니다.');
      await load();
    } catch (e: any) {
      setError(e.message || '삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const formTitle = useMemo(() => (editingId ? '카테고리 수정' : '카테고리 추가'), [editingId]);

  return (
    <div className="manager-category-page">
      <div className="manager-category-page__head">
        <div>
          <h1>카테고리 관리</h1>
          <p>드래그로 메뉴 순서를 바꾸고, 등록·수정·삭제할 수 있습니다.</p>
        </div>
        <span className="comment-box__count">{categories.length}</span>
      </div>

      <section className="ex1-panel manager-category-form">
        <Ex3Field label={formTitle} htmlFor="category-name" required>
          <Ex3Input
            id="category-name"
            value={categoryName}
            onChange={(e) => {
              const next = e.target.value;
              setCategoryName(next);
              if (!slugTouched) setSlug(slugify(next));
            }}
            placeholder="예: 개발"
            required
          />
        </Ex3Field>
        <Ex3Field label="슬러그" htmlFor="category-slug" required>
          <Ex3Input
            id="category-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="예: dev"
            required
          />
        </Ex3Field>
        <Ex3Field label="공개" htmlFor="category-display">
          <Ex3Select id="category-display" value={isDisplay} onChange={(e) => setIsDisplay(e.target.value as 'Y' | 'N')}>
            <option value="Y">공개</option>
            <option value="N">비공개</option>
          </Ex3Select>
        </Ex3Field>
        <div className="manager-category-form__actions">
          {editingId ? (
            <Ex3Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
              취소
            </Ex3Button>
          ) : null}
          <Ex3Button type="button" onClick={submit} disabled={saving || !categoryName.trim()}>
            {editingId ? '저장' : '추가'}
          </Ex3Button>
        </div>
      </section>

      <section className="ex1-panel manager-category-panel">
        <p className="manager-category-panel__hint">행을 드래그하면 순서가 저장됩니다.{saving ? ' 저장 중…' : ''}</p>
        <CategoryTreeBoard nodes={treeNodes} onChange={onReorder} onEdit={startEdit} onDelete={remove} />
      </section>

      {message ? <p className="muted">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

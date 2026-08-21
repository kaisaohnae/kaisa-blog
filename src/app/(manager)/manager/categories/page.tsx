'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import CategoryTreeBoard from '@/components/manager/category-tree-board';
import {
  buildCategoryTree,
  collectDescendantIds,
  flattenCategoryOptions,
  flattenCategoryTree,
  findCategoryNode,
  type CategoryTreeNode,
  type FlatCategory,
} from '@/components/manager/category-tree-utils';
import '@/components/manager/manager-category.css';
import {apiPost} from '@/config/api-config';
import {Ex3Button, Ex3Field, Ex3Input, Ex3Select, Ex3Toggle} from '@/ui-kit';

type Category = FlatCategory;

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function toUpdatePayload(flatRows: ReturnType<typeof flattenCategoryTree>, source: Category[]) {
  const map = new Map(source.map((item) => [String(item.categoryId), item]));
  return flatRows.map((row) => {
    const origin = map.get(row.id);
    return {
      mode: 'U' as const,
      categoryId: Number(row.id),
      categoryName: origin?.categoryName ?? '',
      slug: origin?.slug ?? '',
      isDisplay: origin?.isDisplay ?? 'Y',
      parentCategoryId: row.parentCategoryId,
      sortOrder: row.sortOrder,
    };
  });
}

export default function ManagerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeNodes, setTreeNodes] = useState<CategoryTreeNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [isDisplay, setIsDisplay] = useState<'Y' | 'N'>('Y');
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const body = await apiPost<{list: Category[]}>('bl/get-category-list', {adminYn: 'Y'}, 'admin');
    const list = body.data.list || [];
    setCategories(list);
    setTreeNodes(buildCategoryTree(list));
  }, []);

  useEffect(() => {
    load().catch(() => {
      setCategories([]);
      setTreeNodes([]);
    });
  }, [load]);

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setCategoryName('');
    setSlug('');
    setParentCategoryId(null);
    setIsDisplay('Y');
    setSlugTouched(false);
  };

  const startCreateRoot = () => {
    resetForm();
    setIsCreating(true);
    setSelectedId(null);
    setError('');
    setMessage('');
  };

  const startCreateChild = () => {
    if (!selectedId) return;
    resetForm();
    setIsCreating(true);
    setParentCategoryId(Number(selectedId));
    setError('');
    setMessage('');
  };

  const selectNode = (node: CategoryTreeNode) => {
    setSelectedId(node.id);
    setIsCreating(false);
    setEditingId(Number(node.id));
    setCategoryName(node.label);
    setSlug(node.slug);
    setIsDisplay(node.isDisplay);
    const origin = categories.find((item) => item.categoryId === Number(node.id));
    setParentCategoryId(origin?.parentCategoryId ?? null);
    setSlugTouched(true);
    setError('');
    setMessage('');
  };

  const saveOrder = async (nextNodes: CategoryTreeNode[], source = categories) => {
    const payload = toUpdatePayload(flattenCategoryTree(nextNodes), source);
    if (!payload.length) return;
    await apiPost('bl/set-category-list', payload, 'admin');
    await load();
  };

  const onTreeChange = async (nextNodes: CategoryTreeNode[]) => {
    setTreeNodes(nextNodes);
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await saveOrder(nextNodes);
      setMessage('카테고리 구조가 저장되었습니다.');
    } catch (e: any) {
      setError(e.message || '구조 저장에 실패했습니다.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updateDisplay = useCallback(async (node: CategoryTreeNode, checked: boolean) => {
    const next = checked ? 'Y' : 'N';
    const categoryId = Number(node.id);
    const origin = categories.find((item) => item.categoryId === categoryId);
    if (!origin || origin.isDisplay === next) {
      return;
    }

    const applyDisplay = (list: Category[]) =>
      list.map((item) => (item.categoryId === categoryId ? {...item, isDisplay: next} : item));

    setCategories((prev) => {
      const nextList = applyDisplay(prev);
      setTreeNodes(buildCategoryTree(nextList));
      return nextList;
    });
    if (editingId === categoryId) {
      setIsDisplay(next);
    }

    try {
      await apiPost('bl/set-category-list', [{mode: 'U', categoryId, isDisplay: next}], 'admin');
    } catch {
      setCategories((prev) => {
        const nextList = prev.map((item) =>
          item.categoryId === categoryId ? {...item, isDisplay: origin.isDisplay} : item,
        );
        setTreeNodes(buildCategoryTree(nextList));
        return nextList;
      });
      if (editingId === categoryId) {
        setIsDisplay(origin.isDisplay);
      }
      window.alert('공개 상태 변경에 실패했습니다.');
    }
  }, [categories, editingId]);

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
              parentCategoryId,
            },
          ],
          'admin',
        );
        setMessage('카테고리가 수정되었습니다.');
        await load();
      } else {
        const siblings = categories.filter((item) => (item.parentCategoryId ?? null) === parentCategoryId);
        await apiPost(
          'bl/set-category-list',
          [
            {
              mode: 'C',
              categoryName: categoryName.trim(),
              slug: nextSlug,
              isDisplay,
              parentCategoryId,
              sortOrder: siblings.length + 1,
            },
          ],
          'admin',
        );
        setMessage('카테고리가 추가되었습니다.');
        resetForm();
        await load();
      }
    } catch (e: any) {
      setError(e.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editingId) return;
    const node = findCategoryNode(treeNodes, String(editingId));
    if (!node) return;
    if (!window.confirm(`"${node.label}" 카테고리를 삭제할까요?`)) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await apiPost('bl/set-category-list', [{mode: 'D', categoryId: editingId}], 'admin');
      resetForm();
      setSelectedId(null);
      setMessage('카테고리가 삭제되었습니다.');
      await load();
    } catch (e: any) {
      setError(e.message || '삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = useMemo(() => {
    const exclude = new Set<string>();
    if (editingId) {
      exclude.add(String(editingId));
      collectDescendantIds(treeNodes, String(editingId)).forEach((id) => exclude.add(id));
    }
    return flattenCategoryOptions(treeNodes, 0, exclude);
  }, [editingId, treeNodes]);

  const detailTitle = useMemo(() => {
    if (isCreating) return parentCategoryId ? '하위 카테고리 추가' : '최상위 카테고리 추가';
    if (editingId) return '카테고리 상세';
    return '카테고리 상세';
  }, [editingId, isCreating, parentCategoryId]);

  const showDetail = Boolean(isCreating || editingId);

  return (
    <div className="manager-category-page">
      <div className="manager-category-layout">
        <section className="ex1-panel manager-category-tree-panel">
          <div className="manager-category-tree-panel__head">
            <h2>카테고리 트리</h2>
            <Ex3Button type="button" variant="secondary" onClick={startCreateRoot} disabled={saving}>
              + 카테고리
            </Ex3Button>
          </div>
          <CategoryTreeBoard
            nodes={treeNodes}
            selectedId={selectedId}
            onSelect={selectNode}
            onChange={onTreeChange}
            onDisplayChange={(node, checked) => void updateDisplay(node, checked)}
          />
        </section>

        <section className="ex1-panel manager-category-detail-panel">
          {showDetail ? (
            <>
              <div className="manager-category-detail-panel__head">
                <h2>{detailTitle}</h2>
                {editingId && selectedId ? (
                  <Ex3Button type="button" variant="secondary" onClick={startCreateChild} disabled={saving}>
                    + 하위 추가
                  </Ex3Button>
                ) : null}
              </div>

              <div className="manager-category-detail-form">
                <Ex3Field label="카테고리명" htmlFor="category-name" required>
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
                <Ex3Field label="상위 카테고리" htmlFor="category-parent">
                  <Ex3Select
                    id="category-parent"
                    value={parentCategoryId ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setParentCategoryId(value ? Number(value) : null);
                    }}
                  >
                    <option value="">없음 (최상위)</option>
                    {parentOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {'\u00A0'.repeat(option.depth * 2)}
                        {option.label}
                      </option>
                    ))}
                  </Ex3Select>
                </Ex3Field>
                <div className="manager-category-detail-form__display">
                  <Ex3Toggle
                    id="category-display"
                    label="공개"
                    checked={isDisplay === 'Y'}
                    onChange={(e) => setIsDisplay(e.target.checked ? 'Y' : 'N')}
                  />
                </div>
              </div>

              <div className="manager-category-detail-form__actions">
                <Ex3Button type="button" onClick={submit} disabled={saving || !categoryName.trim()}>
                  {editingId ? '저장' : '추가'}
                </Ex3Button>
                {editingId ? (
                  <Ex3Button type="button" variant="secondary" onClick={remove} disabled={saving}>
                    삭제
                  </Ex3Button>
                ) : null}
                <Ex3Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
                  취소
                </Ex3Button>
              </div>
            </>
          ) : (
            <div className="manager-category-detail-empty">
              <h2>카테고리 상세</h2>
              <p>왼쪽 트리에서 카테고리를 선택하거나, 최상위 추가 버튼으로 새 카테고리를 등록하세요.</p>
            </div>
          )}
        </section>
      </div>

      {message ? <p className="muted">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

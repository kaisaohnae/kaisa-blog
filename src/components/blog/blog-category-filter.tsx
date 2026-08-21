'use client';

import {useRouter, useSearchParams} from 'next/navigation';
import {useMemo} from 'react';
import {
  buildCategoryTree,
  flattenCategoryOptions,
  type FlatCategory,
} from '@/components/manager/category-tree-utils';

export type BlogCategory = FlatCategory & {
  postCount?: number;
};

type BlogCategoryFilterProps = {
  categories: BlogCategory[];
  totalPostCount?: number;
  className?: string;
};

function CategoryLabel({label, count}: {label: string; count: number}) {
  return (
    <>
      {label}
      <span className="blog-category-filter__count"> ({count})</span>
    </>
  );
}

export default function BlogCategoryFilter({
  categories,
  totalPostCount = 0,
  className,
}: BlogCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('q')?.trim() || '';
  const selectedId = searchParams.get('categoryId')?.trim() || '';

  const countById = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach((category) => {
      map.set(String(category.categoryId), category.postCount ?? 0);
    });
    return map;
  }, [categories]);

  const options = useMemo(() => {
    if (!categories.length) return [];
    return flattenCategoryOptions(buildCategoryTree(categories));
  }, [categories]);

  const navigate = (categoryId: string | null) => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (categoryId) params.set('categoryId', categoryId);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  if (!options.length) return null;

  return (
    <nav
      className={['blog-category-filter', className].filter(Boolean).join(' ')}
      aria-label="카테고리"
    >
      <button
        type="button"
        className={[
          'blog-category-filter__item',
          !selectedId && 'blog-category-filter__item--active',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => navigate(null)}
        aria-current={!selectedId ? 'true' : undefined}
      >
        <CategoryLabel label="전체" count={totalPostCount} />
      </button>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          data-depth={option.depth}
          className={[
            'blog-category-filter__item',
            selectedId === option.id && 'blog-category-filter__item--active',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => navigate(option.id)}
          aria-current={selectedId === option.id ? 'true' : undefined}
        >
          <CategoryLabel label={option.label} count={countById.get(option.id) ?? 0} />
        </button>
      ))}
    </nav>
  );
}

export function findCategoryLabel(categories: BlogCategory[], categoryId: string): string | null {
  if (!categoryId) return null;
  const match = categories.find((item) => String(item.categoryId) === categoryId);
  return match?.categoryName ?? null;
}

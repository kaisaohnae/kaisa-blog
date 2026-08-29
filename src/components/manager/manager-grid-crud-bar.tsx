'use client';

import {KaisaButton} from '@/ui-kit';

type ManagerGridCrudBarProps = {
  total: number;
  selected: number;
  hint?: string;
  onAdd?: () => void;
  onDelete?: () => void;
  addLabel?: string;
  deleteLabel?: string;
};

export default function ManagerGridCrudBar({
  total,
  selected,
  hint = '셀 드래그로 범위 선택 · Ctrl+C로 Excel 붙여넣기',
  onAdd,
  onDelete,
  addLabel = '새 글',
  deleteLabel = '선택 삭제',
}: ManagerGridCrudBarProps) {
  return (
    <div className="ex1-grid-crud">
      <div className="ex1-grid-crud__meta">
        <span className="ex1-grid-crud__count">총 {total}건</span>
        <span className="ex1-grid-crud__selected">{selected}건 선택</span>
        <span className="ex1-grid-crud__hint">{hint}</span>
      </div>
      {(onAdd || onDelete) && (
        <div className="ex1-grid-crud__actions">
          {onAdd ? (
            <KaisaButton variant="secondary" uiSize="sm" onClick={onAdd}>
              {addLabel}
            </KaisaButton>
          ) : null}
          {onDelete ? (
            <KaisaButton variant="danger" uiSize="sm" onClick={onDelete} disabled={selected === 0}>
              {deleteLabel}
            </KaisaButton>
          ) : null}
        </div>
      )}
    </div>
  );
}

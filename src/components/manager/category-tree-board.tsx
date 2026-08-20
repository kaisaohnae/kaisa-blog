'use client';

import {useMemo, useState, type DragEvent} from 'react';
import {dropZone, moveCategoryNode, type CategoryDropPos, type CategoryTreeNode} from './category-tree-utils';

type DragPayload = {
  nodeId: string;
};

let activeDrag: DragPayload | null = null;

type CategoryTreeBoardProps = {
  nodes: CategoryTreeNode[];
  onChange: (nodes: CategoryTreeNode[]) => void;
  onEdit: (node: CategoryTreeNode) => void;
  onDelete: (node: CategoryTreeNode) => void;
  emptyText?: string;
};

export default function CategoryTreeBoard({
  nodes,
  onChange,
  onEdit,
  onDelete,
  emptyText = '등록된 카테고리가 없습니다.',
}: CategoryTreeBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [over, setOver] = useState<{id: string; pos: CategoryDropPos} | null>(null);

  const rows = useMemo(() => nodes, [nodes]);

  const finishDrop = (payload: DragPayload, targetId: string, pos: CategoryDropPos) => {
    const next = moveCategoryNode(nodes, payload.nodeId, targetId, pos);
    if (!next) return;
    onChange(next);
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, node: CategoryTreeNode) => {
    const payload: DragPayload = {nodeId: node.id};
    activeDrag = payload;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', node.id);
    setDraggingId(node.id);
  };

  const clearDrag = () => {
    setDraggingId(null);
    setOver(null);
    activeDrag = null;
  };

  const onDragOverRow = (event: DragEvent<HTMLDivElement>, node: CategoryTreeNode) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const pos = dropZone((event.clientY - rect.top) / rect.height);
    event.dataTransfer.dropEffect = 'move';
    setOver({id: node.id, pos});
  };

  const onDropRow = (event: DragEvent<HTMLDivElement>, node: CategoryTreeNode) => {
    event.preventDefault();
    const payload = activeDrag;
    const pos = over?.id === node.id ? over.pos : 'after';
    setOver(null);
    setDraggingId(null);
    if (!payload) return;
    finishDrop(payload, node.id, pos);
    activeDrag = null;
  };

  return (
    <div className="manager-category-tree">
      <div className="manager-category-tree__list">
        {rows.length ? (
          rows.map((node) => {
            const dropPos = over?.id === node.id ? over.pos : null;
            return (
              <div
                key={node.id}
                className={[
                  'manager-category-tree__row',
                  draggingId === node.id && 'manager-category-tree__row--dragging',
                  dropPos && `manager-category-tree__row--${dropPos}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                draggable
                onDragStart={(event) => onDragStart(event, node)}
                onDragEnd={clearDrag}
                onDragOver={(event) => onDragOverRow(event, node)}
                onDragLeave={() => setOver((current) => (current?.id === node.id ? null : current))}
                onDrop={(event) => onDropRow(event, node)}
              >
                <span className="manager-category-tree__grip" aria-hidden="true" />
                <div className="manager-category-tree__body">
                  <strong>{node.label}</strong>
                  <span className="manager-category-tree__slug">{node.slug}</span>
                  {node.isDisplay === 'N' ? <span className="manager-category-tree__badge">비공개</span> : null}
                </div>
                <div className="manager-category-tree__actions">
                  <button
                    type="button"
                    className="text-btn"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={() => onEdit(node)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="text-btn text-btn--danger"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={() => onDelete(node)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="manager-category-tree__empty">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

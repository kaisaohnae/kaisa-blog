'use client';

import {useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent} from 'react';
import {
  CategoryFileIcon,
  CategoryFolderClosedIcon,
  CategoryFolderOpenIcon,
} from './category-tree-icons';
import {KaisaToggle} from '@/ui-kit';
import {
  canDropCategory,
  dropZone,
  hasCategoryChildren,
  isFolder,
  moveCategoryNodes,
  selectedCategoryRoots,
  type CategoryDropPos,
  type CategoryTreeNode,
} from './category-tree-utils';

type DragPayload = {
  nodeIds: string[];
};

type FlatRow = {
  node: CategoryTreeNode;
  depth: number;
};

const DROP_HINT: Record<CategoryDropPos, string> = {
  before: '위로 이동',
  after: '아래로 이동',
  inside: '하위로 이동',
};

function flatten(nodes: CategoryTreeNode[], collapsed: Set<string>, depth = 0): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const node of nodes) {
    rows.push({node, depth});
    if (isFolder(node) && node.children?.length && !collapsed.has(node.id)) {
      rows.push(...flatten(node.children, collapsed, depth + 1));
    }
  }
  return rows;
}

function readDropPos(event: DragEvent<HTMLElement>, allowInside: boolean): CategoryDropPos {
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5;
  return dropZone(ratio, allowInside);
}

function isLeavingRow(event: DragEvent<HTMLElement>) {
  const related = event.relatedTarget;
  if (!(related instanceof Node)) return true;
  return !event.currentTarget.contains(related);
}

type CategoryTreeBoardProps = {
  nodes: CategoryTreeNode[];
  selectedIds: string[];
  onSelect: (node: CategoryTreeNode, selectedIds: string[]) => void;
  onClearSelection: () => void;
  onChange: (nodes: CategoryTreeNode[]) => void;
  onDisplayChange?: (node: CategoryTreeNode, checked: boolean) => void;
  emptyText?: string;
};

export default function CategoryTreeBoard({
  nodes,
  selectedIds,
  onSelect,
  onClearSelection,
  onChange,
  onDisplayChange,
  emptyText = '등록된 카테고리가 없습니다.',
}: CategoryTreeBoardProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [draggingIds, setDraggingIds] = useState<string[]>([]);
  const [over, setOver] = useState<{id: string; pos: CategoryDropPos} | null>(null);
  const activeDragRef = useRef<DragPayload | null>(null);
  const draggedRef = useRef(false);
  const selectionAnchorRef = useRef<string | null>(null);
  const handledModifierMouseDownRef = useRef<string | null>(null);

  const rows = useMemo(() => flatten(nodes, collapsed), [collapsed, nodes]);

  const finishDrop = (payload: DragPayload, targetId: string, pos: CategoryDropPos) => {
    const next = moveCategoryNodes(nodes, payload.nodeIds, targetId, pos, 'reparent');
    if (!next) return;
    if (pos === 'inside') {
      setCollapsed((current) => {
        const nextCollapsed = new Set(current);
        nextCollapsed.delete(targetId);
        return nextCollapsed;
      });
    }
    onChange(next);
  };

  const clearDrag = () => {
    activeDragRef.current = null;
    setDraggingIds([]);
    setOver(null);
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 100);
  };

  const onDragStart = (event: DragEvent<HTMLSpanElement>, node: CategoryTreeNode) => {
    event.stopPropagation();
    draggedRef.current = true;
    const nodeIds = selectedIds.includes(node.id) ? selectedCategoryRoots(nodes, selectedIds) : [node.id];
    if (!selectedIds.includes(node.id)) {
      selectionAnchorRef.current = node.id;
      onSelect(node, [node.id]);
    }
    const payload: DragPayload = {nodeIds};
    activeDragRef.current = payload;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', nodeIds.join(','));
    window.requestAnimationFrame(() => {
      setDraggingIds(nodeIds);
    });
  };

  const canDropPayload = (payload: DragPayload, targetId: string, pos: CategoryDropPos) => {
    const sourceIds = selectedCategoryRoots(nodes, payload.nodeIds);
    return (
      sourceIds.length > 0 &&
      !sourceIds.includes(targetId) &&
      sourceIds.every((sourceId) =>
        canDropCategory({mode: 'reparent', nodes, sourceId, targetId, pos}),
      )
    );
  };

  const onDragOverRow = (event: DragEvent<HTMLDivElement>, node: CategoryTreeNode) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = activeDragRef.current;
    if (!payload) return;

    const pos = readDropPos(event, true);
    if (!canDropPayload(payload, node.id, pos)) {
      event.dataTransfer.dropEffect = 'none';
      setOver((current) => (current?.id === node.id ? null : current));
      return;
    }

    event.dataTransfer.dropEffect = 'move';
    setOver({id: node.id, pos});
  };

  const onDropRow = (event: DragEvent<HTMLDivElement>, node: CategoryTreeNode) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = activeDragRef.current;
    if (!payload) {
      clearDrag();
      return;
    }

    const pos = readDropPos(event, true);
    if (!canDropPayload(payload, node.id, pos)) {
      clearDrag();
      return;
    }

    finishDrop(payload, node.id, pos);
    clearDrag();
  };

  const onDragOverList = (event: DragEvent<HTMLDivElement>) => {
    if (!activeDragRef.current) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const toggleCollapse = (event: MouseEvent<HTMLButtonElement>, node: CategoryTreeNode) => {
    event.stopPropagation();
    if (!hasCategoryChildren(node)) return;
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      return next;
    });
  };

  const handleSelect = (event: MouseEvent<HTMLDivElement>, node: CategoryTreeNode) => {
    if (draggedRef.current) return;
    const rowIds = rows.map((row) => row.node.id);
    let nextIds: string[];

    if (event.shiftKey && selectionAnchorRef.current) {
      const from = rowIds.indexOf(selectionAnchorRef.current);
      const to = rowIds.indexOf(node.id);
      nextIds = from >= 0 && to >= 0 ? rowIds.slice(Math.min(from, to), Math.max(from, to) + 1) : [node.id];
    } else if (event.altKey) {
      const selected = new Set(selectedIds);
      if (selected.has(node.id)) selected.delete(node.id);
      else selected.add(node.id);
      nextIds = rowIds.filter((id) => selected.has(id));
      selectionAnchorRef.current = node.id;
    } else {
      nextIds = [node.id];
      selectionAnchorRef.current = node.id;
    }

    if (!nextIds.length) {
      onClearSelection();
      return;
    }

    const activeId = nextIds.includes(node.id) ? node.id : nextIds[nextIds.length - 1];
    const activeNode = rows.find((row) => row.node.id === activeId)?.node ?? node;
    onSelect(activeNode, nextIds);
  };

  return (
    <div className="manager-category-tree">
      <div
        className="manager-category-tree__list"
        role="tree"
        aria-label="카테고리"
        aria-multiselectable
        onDragOver={onDragOverList}
      >
        {rows.length ? (
          rows.map(({node, depth}) => {
            const dropPos = over?.id === node.id ? over.pos : null;
            const hasChildren = hasCategoryChildren(node);
            const expanded = hasChildren && !collapsed.has(node.id);
            const Icon = hasChildren
              ? expanded
                ? CategoryFolderOpenIcon
                : CategoryFolderClosedIcon
              : CategoryFileIcon;

            return (
              <div
                key={node.id}
                role="treeitem"
                aria-expanded={hasChildren ? expanded : undefined}
                aria-selected={selectedIds.includes(node.id)}
                className={[
                  'manager-category-tree__row',
                  selectedIds.includes(node.id) && 'manager-category-tree__row--selected',
                  draggingIds.includes(node.id) && 'manager-category-tree__row--dragging',
                  dropPos && `manager-category-tree__row--${dropPos}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{'--tree-depth': depth} as CSSProperties}
                onDragOver={(event) => onDragOverRow(event, node)}
                onDragLeave={(event) => {
                  if (isLeavingRow(event)) {
                    setOver((current) => (current?.id === node.id ? null : current));
                  }
                }}
                onDrop={(event) => onDropRow(event, node)}
                onMouseDown={(event) => {
                  // Browser drag handles can swallow a later click with Alt held.
                  // Select on press as well, then consume that matching click below.
                  if (!event.altKey && !event.shiftKey) return;
                  handledModifierMouseDownRef.current = node.id;
                  handleSelect(event, node);
                }}
                onClick={(event) => {
                  if (handledModifierMouseDownRef.current === node.id) {
                    handledModifierMouseDownRef.current = null;
                    return;
                  }
                  handleSelect(event, node);
                }}
              >
                {dropPos ? <span className="manager-category-tree__drop-hint">{DROP_HINT[dropPos]}</span> : null}
                <div className="manager-category-tree__inner">
                  <button
                    type="button"
                    className="manager-category-tree__toggle"
                    aria-label={expanded ? '접기' : '펼치기'}
                    draggable={false}
                    onMouseDown={(event) => event.stopPropagation()}
                    onDragStart={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => toggleCollapse(event, node)}
                    disabled={!hasChildren}
                  >
                    {hasChildren ? (expanded ? '▾' : '▸') : ''}
                  </button>
                  <span
                    className="manager-category-tree__handle"
                    draggable
                    aria-label={`${node.label}${draggingIds.length > 1 ? ` 포함 ${draggingIds.length}개` : ''} 이동`}
                    onDragStart={(event) => onDragStart(event, node)}
                    onDragEnd={clearDrag}
                  />
                  <div className="manager-category-tree__content">
                    <Icon className="manager-category-tree__icon" />
                    <span className="manager-category-tree__label">{node.label}</span>
                    <span className="manager-category-tree__slug">{node.slug}</span>
                    {node.isDisplay === 'N' ? <span className="manager-category-tree__badge">비공개</span> : null}
                  </div>
                  <div
                    className="manager-category-tree__display"
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <KaisaToggle
                      className="manager-category-tree__display-toggle"
                      label="공개"
                      checked={node.isDisplay === 'Y'}
                      onChange={(event) => onDisplayChange?.(node, event.target.checked)}
                    />
                  </div>
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

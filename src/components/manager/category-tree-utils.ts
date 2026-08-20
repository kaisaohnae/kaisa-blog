export type CategoryTreeNode = {
  id: string;
  label: string;
  slug: string;
  isDisplay: 'Y' | 'N';
  kind?: 'leaf';
};

export type CategoryDropPos = 'before' | 'after';

export function cloneCategoryNodes(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.map((node) => ({...node}));
}

export function moveCategoryNode(
  nodes: CategoryTreeNode[],
  sourceId: string,
  targetId: string,
  pos: CategoryDropPos,
): CategoryTreeNode[] | null {
  if (sourceId === targetId) return null;

  const next = cloneCategoryNodes(nodes);
  const sourceIndex = next.findIndex((node) => node.id === sourceId);
  const targetIndex = next.findIndex((node) => node.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return null;

  const [removed] = next.splice(sourceIndex, 1);
  const insertIndex = pos === 'before' ? targetIndex : targetIndex + 1;
  const adjustedIndex = sourceIndex < targetIndex ? insertIndex - 1 : insertIndex;
  next.splice(adjustedIndex, 0, removed);
  return next;
}

export function dropZone(ratio: number): CategoryDropPos {
  return ratio < 0.5 ? 'before' : 'after';
}

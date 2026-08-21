export type CategoryTreeKind = 'folder' | 'leaf';

export type CategoryTreeNode = {
  id: string;
  label: string;
  slug: string;
  isDisplay: 'Y' | 'N';
  kind?: CategoryTreeKind;
  children?: CategoryTreeNode[];
};

export type CategoryDropPos = 'before' | 'after' | 'inside';
export type CategoryTreeMode = 'reorder' | 'reparent';

export type FlatCategory = {
  categoryId: number;
  parentCategoryId?: number | null;
  categoryName: string;
  slug: string;
  sortOrder: number;
  isDisplay: 'Y' | 'N';
};

export type CategoryTreeFlatRow = {
  id: string;
  parentCategoryId: number | null;
  sortOrder: number;
};

export function cloneCategoryNodes(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children ? cloneCategoryNodes(node.children) : undefined,
  }));
}

export function hasCategoryChildren(node: CategoryTreeNode) {
  return Boolean(node.children?.length);
}

export function isFolder(node: CategoryTreeNode) {
  return hasCategoryChildren(node);
}

export function findCategoryNode(nodes: CategoryTreeNode[], id: string): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findCategoryNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findContext(nodes: CategoryTreeNode[], id: string, parent: CategoryTreeNode | null = null) {
  const index = nodes.findIndex((node) => node.id === id);
  if (index >= 0) {
    return {parent, index, siblings: nodes, node: nodes[index]};
  }
  for (const node of nodes) {
    if (!node.children) continue;
    const found = findContext(node.children, id, node);
    if (found) return found;
  }
  return null;
}

export function isCategoryDescendant(nodes: CategoryTreeNode[], ancestorId: string, maybeChildId: string) {
  const ancestor = findCategoryNode(nodes, ancestorId);
  if (!ancestor?.children) return false;
  if (findCategoryNode(ancestor.children, maybeChildId)) return true;
  return false;
}

function nodeDepth(nodes: CategoryTreeNode[], id: string, depth = 0): number {
  for (const node of nodes) {
    if (node.id === id) return depth;
    if (node.children) {
      const found = nodeDepth(node.children, id, depth + 1);
      if (found >= 0) return found;
    }
  }
  return -1;
}

function subtreeHeight(node: CategoryTreeNode): number {
  if (!node.children?.length) return 0;
  return 1 + Math.max(...node.children.map(subtreeHeight));
}

function removeNode(nodes: CategoryTreeNode[], id: string): {tree: CategoryTreeNode[]; removed: CategoryTreeNode | null} {
  const next: CategoryTreeNode[] = [];
  let removed: CategoryTreeNode | null = null;

  for (const node of nodes) {
    if (node.id === id) {
      removed = cloneCategoryNodes([node])[0];
      continue;
    }
    if (node.children) {
      const result = removeNode(node.children, id);
      if (result.removed) removed = result.removed;
      next.push({...node, children: result.tree});
    } else {
      next.push(node);
    }
  }

  return {tree: next, removed};
}

function insertNode(
  nodes: CategoryTreeNode[],
  targetId: string,
  pos: CategoryDropPos,
  incoming: CategoryTreeNode,
): CategoryTreeNode[] | null {
  const next = cloneCategoryNodes(nodes);

  if (pos === 'inside') {
    const target = findCategoryNode(next, targetId);
    if (!target) return null;
    if (target.kind === 'leaf') {
      target.kind = 'folder';
    }
    target.children = [...(target.children ?? []), incoming];
    return next;
  }

  const ctx = findContext(next, targetId);
  if (!ctx) return null;
  const index = pos === 'before' ? ctx.index : ctx.index + 1;
  ctx.siblings.splice(index, 0, incoming);
  return next;
}

export function canDropCategory(options: {
  mode: CategoryTreeMode;
  nodes: CategoryTreeNode[];
  sourceId: string;
  targetId: string;
  pos: CategoryDropPos;
  maxDepth?: number;
}) {
  const {mode, nodes, sourceId, targetId, pos, maxDepth = 4} = options;
  if (sourceId === targetId) return false;

  const source = findCategoryNode(nodes, sourceId);
  const target = findCategoryNode(nodes, targetId);
  if (!source || !target) return false;
  if (isCategoryDescendant(nodes, sourceId, targetId)) return false;

  if (pos === 'inside') {
    if (mode === 'reorder') return false;
    const depth = nodeDepth(nodes, targetId) + 1 + subtreeHeight(source);
    return depth <= maxDepth;
  }

  const sourceCtx = findContext(nodes, sourceId);
  const targetCtx = findContext(nodes, targetId);
  if (!sourceCtx || !targetCtx) return false;

  if (mode === 'reorder') {
    return sourceCtx.parent?.id === targetCtx.parent?.id;
  }

  const parent = targetCtx.parent;
  const nextDepth = (parent ? nodeDepth(nodes, parent.id) + 1 : 0) + subtreeHeight(source);
  return nextDepth <= maxDepth;
}

export function moveCategoryNode(
  nodes: CategoryTreeNode[],
  sourceId: string,
  targetId: string,
  pos: CategoryDropPos,
  mode: CategoryTreeMode = 'reparent',
  maxDepth?: number,
): CategoryTreeNode[] | null {
  if (!canDropCategory({mode, nodes, sourceId, targetId, pos, maxDepth})) return null;
  const {tree, removed} = removeNode(nodes, sourceId);
  if (!removed) return null;
  const inserted = insertNode(tree, targetId, pos, removed);
  if (!inserted) return null;
  return normalizeCategoryTreeKinds(inserted);
}

export function dropZone(ratio: number, allowInside: boolean): CategoryDropPos {
  if (allowInside) {
    if (ratio < 0.22) return 'before';
    if (ratio > 0.78) return 'after';
    return 'inside';
  }
  return ratio < 0.5 ? 'before' : 'after';
}

export function normalizeCategoryTreeKinds(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.map((node) => {
    const normalizedChildren = node.children?.length ? normalizeCategoryTreeKinds(node.children) : undefined;
    if (normalizedChildren?.length) {
      return {...node, kind: 'folder', children: normalizedChildren};
    }
    const {children: _children, kind: _kind, ...rest} = node;
    return {...rest, kind: 'leaf'};
  });
}

export function moveCategoryToRoot(nodes: CategoryTreeNode[], sourceId: string): CategoryTreeNode[] | null {
  const {tree, removed} = removeNode(nodes, sourceId);
  if (!removed) return null;
  return normalizeCategoryTreeKinds([...tree, removed]);
}

function finalizeTreeNode(node: CategoryTreeNode & {children?: CategoryTreeNode[]}): CategoryTreeNode {
  if (node.children?.length) {
    return {
      ...node,
      kind: 'folder',
      children: node.children.map(finalizeTreeNode),
    };
  }
  const {children: _children, ...rest} = node;
  return {...rest, kind: 'leaf'};
}

export function buildCategoryTree(list: FlatCategory[]): CategoryTreeNode[] {
  type MutableNode = CategoryTreeNode & {children: CategoryTreeNode[]};
  const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.categoryId - b.categoryId);
  const map = new Map<number, MutableNode>();

  for (const item of sorted) {
    map.set(item.categoryId, {
      id: String(item.categoryId),
      label: item.categoryName,
      slug: item.slug,
      isDisplay: item.isDisplay,
      kind: 'leaf',
      children: [],
    });
  }

  const roots: MutableNode[] = [];
  for (const item of sorted) {
    const node = map.get(item.categoryId);
    if (!node) continue;
    const parentId = item.parentCategoryId;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return normalizeCategoryTreeKinds(roots.map(finalizeTreeNode));
}

export function flattenCategoryTree(nodes: CategoryTreeNode[], parentId: string | null = null): CategoryTreeFlatRow[] {
  const rows: CategoryTreeFlatRow[] = [];
  nodes.forEach((node, index) => {
    rows.push({
      id: node.id,
      parentCategoryId: parentId ? Number(parentId) : null,
      sortOrder: index + 1,
    });
    if (node.children?.length) {
      rows.push(...flattenCategoryTree(node.children, node.id));
    }
  });
  return rows;
}

export function flattenCategoryOptions(
  nodes: CategoryTreeNode[],
  depth = 0,
  excludeIds: Set<string> = new Set(),
): Array<{id: string; label: string; depth: number}> {
  const rows: Array<{id: string; label: string; depth: number}> = [];
  for (const node of nodes) {
    if (!excludeIds.has(node.id)) {
      rows.push({id: node.id, label: node.label, depth});
    }
    if (node.children?.length) {
      rows.push(...flattenCategoryOptions(node.children, depth + 1, excludeIds));
    }
  }
  return rows;
}

export function collectDescendantIds(nodes: CategoryTreeNode[], rootId: string): Set<string> {
  const root = findCategoryNode(nodes, rootId);
  const ids = new Set<string>();
  if (!root?.children?.length) return ids;

  const walk = (children: CategoryTreeNode[]) => {
    for (const child of children) {
      ids.add(child.id);
      if (child.children?.length) walk(child.children);
    }
  };
  walk(root.children);
  return ids;
}

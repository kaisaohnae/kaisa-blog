import type {ColDef, GridApi} from 'ag-grid-community';
import {SELECTION_COLUMN_ID} from 'ag-grid-community';

export type CellPos = {
  rowIndex: number;
  colId: string;
};

export type NormalizedCellRange = {
  rowStart: number;
  rowEnd: number;
  colIds: string[];
};

export function isSelectionColumn(colId?: string | null) {
  return colId?.startsWith(SELECTION_COLUMN_ID) === true;
}

function getDataColumns(api: GridApi) {
  return (api.getAllDisplayedColumns() ?? []).filter((col) => !isSelectionColumn(col.getColId()));
}

export function normalizeCellRange(api: GridApi, start: CellPos, end: CellPos): NormalizedCellRange | null {
  const columns = getDataColumns(api);
  const startColIndex = columns.findIndex((col) => col.getColId() === start.colId);
  const endColIndex = columns.findIndex((col) => col.getColId() === end.colId);
  if (startColIndex < 0 || endColIndex < 0) return null;

  const minCol = Math.min(startColIndex, endColIndex);
  const maxCol = Math.max(startColIndex, endColIndex);

  return {
    rowStart: Math.min(start.rowIndex, end.rowIndex),
    rowEnd: Math.max(start.rowIndex, end.rowIndex),
    colIds: columns.slice(minCol, maxCol + 1).map((col) => col.getColId()),
  };
}

export function isCellInRange(range: NormalizedCellRange | null, rowIndex: number | null, colId: string) {
  if (!range || rowIndex == null || isSelectionColumn(colId)) return false;
  if (rowIndex < range.rowStart || rowIndex > range.rowEnd) return false;
  return range.colIds.includes(colId);
}

function getCellRangeFromContext(context: unknown) {
  return (context as {cellRange?: NormalizedCellRange | null} | undefined)?.cellRange ?? null;
}

function isRangeEdgeTop(range: NormalizedCellRange, rowIndex: number | null) {
  return rowIndex === range.rowStart;
}

function isRangeEdgeBottom(range: NormalizedCellRange, rowIndex: number | null) {
  return rowIndex === range.rowEnd;
}

function isRangeEdgeLeft(range: NormalizedCellRange, colId: string) {
  return range.colIds[0] === colId;
}

function isRangeEdgeRight(range: NormalizedCellRange, colId: string) {
  return range.colIds[range.colIds.length - 1] === colId;
}

function escapeTsvCell(value: string) {
  return value.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

function getFormattedCellValue(api: GridApi, rowIndex: number, colId: string) {
  const rowNode = api.getDisplayedRowAtIndex(rowIndex);
  if (!rowNode) return '';
  const value = api.getCellValue({rowNode, colKey: colId, useFormatter: true});
  if (value == null) return '';
  return escapeTsvCell(String(value));
}

export function buildRangeTsv(api: GridApi, range: NormalizedCellRange) {
  const lines: string[] = [];

  for (let rowIndex = range.rowStart; rowIndex <= range.rowEnd; rowIndex += 1) {
    const cells = range.colIds.map((colId) => getFormattedCellValue(api, rowIndex, colId));
    lines.push(cells.join('\t'));
  }

  return lines.join('\n');
}

export async function copyRangeToClipboard(api: GridApi, range: NormalizedCellRange | null) {
  if (!range) return false;
  const text = buildRangeTsv(api, range);
  if (!text) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

export function createCellRangeClassRules(classPrefix: string): ColDef['cellClassRules'] {
  const rangeClass = `${classPrefix}-cell-range`;
  const edgeTopClass = `${classPrefix}-cell-range-edge-top`;
  const edgeBottomClass = `${classPrefix}-cell-range-edge-bottom`;
  const edgeLeftClass = `${classPrefix}-cell-range-edge-left`;
  const edgeRightClass = `${classPrefix}-cell-range-edge-right`;

  return {
    [rangeClass]: (params) =>
      isCellInRange(
        getCellRangeFromContext(params.context),
        params.node.rowIndex,
        params.column.getColId(),
      ),
    [edgeTopClass]: (params) => {
      const range = getCellRangeFromContext(params.context);
      if (!range) return false;
      const colId = params.column.getColId();
      return (
        isCellInRange(range, params.node.rowIndex, colId) &&
        isRangeEdgeTop(range, params.node.rowIndex)
      );
    },
    [edgeBottomClass]: (params) => {
      const range = getCellRangeFromContext(params.context);
      if (!range) return false;
      const colId = params.column.getColId();
      return (
        isCellInRange(range, params.node.rowIndex, colId) &&
        isRangeEdgeBottom(range, params.node.rowIndex)
      );
    },
    [edgeLeftClass]: (params) => {
      const range = getCellRangeFromContext(params.context);
      if (!range) return false;
      const colId = params.column.getColId();
      return isCellInRange(range, params.node.rowIndex, colId) && isRangeEdgeLeft(range, colId);
    },
    [edgeRightClass]: (params) => {
      const range = getCellRangeFromContext(params.context);
      if (!range) return false;
      const colId = params.column.getColId();
      return isCellInRange(range, params.node.rowIndex, colId) && isRangeEdgeRight(range, colId);
    },
  };
}

export const CELL_RANGE_CLASS_RULES = createCellRangeClassRules('ex1');

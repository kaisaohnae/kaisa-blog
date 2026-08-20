import type {CellMouseDownEvent, CellMouseOverEvent, GridApi} from 'ag-grid-community';
import {useCallback, useEffect, useMemo, useReducer, useRef} from 'react';
import {
  copyRangeToClipboard,
  isSelectionColumn,
  normalizeCellRange,
  type CellPos,
  type NormalizedCellRange,
} from './cell-range-select';

export function useCellRangeSelect(enabled: boolean) {
  const rangeRef = useRef<NormalizedCellRange | null>(null);
  const anchorRef = useRef<CellPos | null>(null);
  const draggingRef = useRef(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [rangeTick, refresh] = useReducer((count: number) => count + 1, 0);

  const refreshRangeHighlight = useCallback((api?: GridApi | null) => {
    const targetApi = api ?? gridApiRef.current;
    targetApi?.refreshCells({force: true});
  }, []);

  const setRange = useCallback(
    (api: GridApi, start: CellPos, end: CellPos) => {
      const nextRange = normalizeCellRange(api, start, end);
      rangeRef.current = nextRange;
      api.setGridOption('context', {cellRange: nextRange});
      refreshRangeHighlight(api);
      refresh();
    },
    [refreshRangeHighlight],
  );

  const clearRange = useCallback(() => {
    rangeRef.current = null;
    gridApiRef.current?.setGridOption('context', {cellRange: null});
    refreshRangeHighlight();
    refresh();
  }, [refreshRangeHighlight]);

  useEffect(() => {
    if (!enabled) return;

    const onMouseUp = () => {
      draggingRef.current = false;
      anchorRef.current = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'c') return;
      const api = gridApiRef.current;
      if (!api || !rangeRef.current) return;

      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      void copyRangeToClipboard(api, rangeRef.current);
    };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled]);

  const bindGridApi = useCallback((api: GridApi) => {
    gridApiRef.current = api;
    api.setGridOption('context', {cellRange: rangeRef.current});
  }, []);

  const onCellMouseDown = useCallback(
    (event: CellMouseDownEvent) => {
      if (!enabled) return;

      const colId = event.column.getColId();
      if (isSelectionColumn(colId)) return;

      const mouseEvent = event.event as MouseEvent | undefined;
      if (mouseEvent?.button !== 0) return;
      if (event.rowIndex == null) return;

      const anchor: CellPos = {rowIndex: event.rowIndex, colId};
      anchorRef.current = anchor;
      draggingRef.current = true;
      setRange(event.api, anchor, anchor);
    },
    [enabled, setRange],
  );

  const onCellMouseOver = useCallback(
    (event: CellMouseOverEvent) => {
      if (!enabled || !draggingRef.current || !anchorRef.current) return;
      if (event.rowIndex == null) return;

      const mouseEvent = event.event as MouseEvent | undefined;
      if (mouseEvent?.buttons !== 1) return;

      setRange(event.api, anchorRef.current, {rowIndex: event.rowIndex, colId: event.column.getColId()});
    },
    [enabled, setRange],
  );

  const gridContext = useMemo(
    () => (enabled ? {cellRange: rangeRef.current} : undefined),
    [enabled, rangeTick],
  );

  return {
    gridContext,
    bindGridApi,
    onCellMouseDown: enabled ? onCellMouseDown : undefined,
    onCellMouseOver: enabled ? onCellMouseOver : undefined,
    clearRange,
  };
}

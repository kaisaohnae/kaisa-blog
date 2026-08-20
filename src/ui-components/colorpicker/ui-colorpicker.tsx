'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {joinClasses} from '../lib/control-utils';
import {
  DEFAULT_COLOR_PRESETS,
  clamp,
  hexToHsv,
  hsvToHex,
  normalizeHex,
  type Hsv,
} from './color-utils';

export type UiColorpickerSize = 'sm' | 'md' | 'lg';

export type UiColorpickerProps = {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (color: string | null) => void;
  presets?: string[];
  showPresets?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  uiSize?: UiColorpickerSize;
  allowManualInput?: boolean;
  className?: string;
  inputClassName?: string;
};

function useControllableColor(
  value: string | null | undefined,
  defaultValue: string | null | undefined,
  onChange?: (color: string | null) => void,
) {
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  const setSelected = (next: string | null) => {
    if (!isControlled) {
      setInternal(next);
    }
    onChange?.(next);
  };

  return [selected, setSelected] as const;
}

function getHsvFromColor(color: string | null, fallback: Hsv) {
  if (!color) {
    return fallback;
  }
  return hexToHsv(color) ?? fallback;
}

export function UiColorpicker({
  value,
  defaultValue = '#ff4d00',
  onChange,
  presets = DEFAULT_COLOR_PRESETS,
  showPresets = true,
  placeholder = '#ff4d00',
  name,
  id,
  disabled,
  readOnly,
  invalid,
  clearable = false,
  uiSize = 'md',
  allowManualInput = true,
  className,
  inputClassName,
}: UiColorpickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableColor(value, defaultValue, onChange);
  const [draft, setDraft] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => getHsvFromColor(defaultValue ?? '#ff4d00', {h: 20, s: 100, v: 100}));

  const displayValue = selected ?? '';
  const inputValue = isEditing ? draft : displayValue;

  const closePopover = () => setOpen(false);
  const openPopover = () => {
    if (disabled || readOnly) {
      return;
    }
    if (selected) {
      const nextHsv = hexToHsv(selected);
      if (nextHsv) {
        setHsv(nextHsv);
      }
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closePopover();
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const applyHsv = (next: Hsv) => {
    const normalized = {
      h: clamp(next.h, 0, 360),
      s: clamp(next.s, 0, 100),
      v: clamp(next.v, 0, 100),
    };
    setHsv(normalized);
    const hex = hsvToHex(normalized);
    setSelected(hex);
    setDraft(hex);
    setIsEditing(false);
  };

  const updateSvFromPointer = (clientX: number, clientY: number) => {
    const node = svRef.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    applyHsv({
      h: hsv.h,
      s: x,
      v: 100 - y,
    });
  };

  const handleSvPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || readOnly) {
      return;
    }
    event.preventDefault();
    updateSvFromPointer(event.clientX, event.clientY);

    const handleMove = (moveEvent: PointerEvent) => {
      updateSvFromPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const commitDraft = () => {
    setIsEditing(false);
    if (!draft.trim()) {
      if (clearable) {
        setSelected(null);
      } else {
        setDraft(displayValue);
      }
      return;
    }

    const normalized = normalizeHex(draft);
    if (!normalized) {
      setDraft(displayValue);
      return;
    }

    setSelected(normalized);
    setDraft(normalized);
    const nextHsv = hexToHsv(normalized);
    if (nextHsv) {
      setHsv(nextHsv);
    }
  };

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (!allowManualInput || readOnly || disabled) {
      return;
    }
    setIsEditing(true);
    setDraft(displayValue);
    event.target.select();
  };

  const handleInputBlur = () => {
    if (!allowManualInput || readOnly || disabled) {
      return;
    }
    commitDraft();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commitDraft();
      return;
    }
    if (event.key === 'ArrowDown' && !open) {
      event.preventDefault();
      openPopover();
    }
    if (event.key === 'Escape') {
      closePopover();
    }
  };

  const handleClear = () => {
    if (disabled || readOnly) {
      return;
    }
    setSelected(null);
    setDraft('');
    setIsEditing(false);
    closePopover();
  };

  const handlePresetSelect = (color: string) => {
    const normalized = normalizeHex(color);
    if (!normalized) {
      return;
    }
    setSelected(normalized);
    setDraft(normalized);
    const nextHsv = hexToHsv(normalized);
    if (nextHsv) {
      setHsv(nextHsv);
    }
  };

  return (
    <div
      ref={rootRef}
      className={joinClasses(
        'ui-colorpicker',
        `ui-colorpicker--${uiSize}`,
        open && 'ui-colorpicker--open',
        disabled && 'ui-colorpicker--disabled',
        readOnly && 'ui-colorpicker--readonly',
        invalid && 'ui-colorpicker--invalid',
        className,
      )}
    >
      <div className="ui-colorpicker__control">
        <button
          type="button"
          className="ui-colorpicker__swatch"
          style={{backgroundColor: selected ?? '#ffffff'}}
          onClick={() => (open ? closePopover() : openPopover())}
          disabled={disabled || readOnly}
          aria-label="색상 선택"
        />

        <input
          id={inputId}
          name={name}
          type="text"
          autoComplete="off"
          spellCheck={false}
          className={joinClasses(
            'ui-input',
            'ui-colorpicker__input',
            `ui-input--${uiSize}`,
            invalid && 'ui-input--invalid',
            disabled && 'ui-is-disabled',
            readOnly && 'ui-is-readonly',
            inputClassName,
          )}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly || !allowManualInput}
          aria-invalid={invalid || undefined}
          aria-expanded={open}
          aria-haspopup="dialog"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleInputKeyDown}
          onClick={() => {
            if (!allowManualInput) {
              openPopover();
            }
          }}
        />

        <div className="ui-colorpicker__actions">
          {clearable && selected && !disabled && !readOnly ? (
            <button
              type="button"
              className="ui-colorpicker__clear"
              onClick={handleClear}
              aria-label="색상 지우기"
            >
              ×
            </button>
          ) : null}
          <button
            type="button"
            className="ui-colorpicker__trigger"
            onClick={() => (open ? closePopover() : openPopover())}
            disabled={disabled || readOnly}
            aria-label="색상 팔레트 열기"
            aria-expanded={open}
            aria-controls={`${inputId}-palette`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3c-4.4 0-8 3.1-8 7.5 0 2.2 1.2 4.2 3 5.4.8.6 1.3 1.5 1.3 2.5v1.1c0 .6.4 1 1 1h7.4c.6 0 1-.4 1-1V18c0-1 .5-1.9 1.3-2.5 1.8-1.2 3-3.2 3-5.5C22 6.1 18.4 3 14 3h-2z" />
              <circle cx="8.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="12" cy="8.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={`${inputId}-palette`}
          className="ui-colorpicker__popover"
          role="dialog"
          aria-label="색상 선택"
        >
          <div
            ref={svRef}
            className="ui-colorpicker__sv"
            style={{backgroundColor: hsvToHex({h: hsv.h, s: 100, v: 100})}}
            onPointerDown={handleSvPointerDown}
          >
            <div className="ui-colorpicker__sv-white" />
            <div className="ui-colorpicker__sv-black" />
            <span
              className="ui-colorpicker__cursor"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
              }}
            />
          </div>

          <label className="ui-colorpicker__hue">
            <span className="ui-colorpicker__hue-label">Hue</span>
            <input
              type="range"
              min={0}
              max={360}
              value={Math.round(hsv.h)}
              onChange={(event) =>
                applyHsv({...hsv, h: Number(event.target.value)})
              }
              disabled={disabled || readOnly}
            />
          </label>

          <div className="ui-colorpicker__preview-row">
            <span
              className="ui-colorpicker__preview"
              style={{backgroundColor: selected ?? hsvToHex(hsv)}}
            />
            <input
              type="text"
              className="ui-input ui-input--sm ui-colorpicker__hex"
              value={selected ?? hsvToHex(hsv)}
              readOnly={readOnly || !allowManualInput}
              disabled={disabled}
              onChange={(event) => {
                const normalized = normalizeHex(event.target.value);
                if (normalized) {
                  handlePresetSelect(normalized);
                } else {
                  setDraft(event.target.value);
                }
              }}
            />
          </div>

          {showPresets ? (
            <div className="ui-colorpicker__presets">
              {presets.map((color) => {
                const normalized = normalizeHex(color) ?? color;
                const isActive = selected === normalized;
                return (
                  <button
                    key={normalized}
                    type="button"
                    className={joinClasses(
                      'ui-colorpicker__preset',
                      isActive && 'ui-colorpicker__preset--active',
                    )}
                    style={{backgroundColor: normalized}}
                    onClick={() => handlePresetSelect(normalized)}
                    disabled={disabled || readOnly}
                    aria-label={`${normalized} 선택`}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

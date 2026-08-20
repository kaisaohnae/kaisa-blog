'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import {joinClasses} from '../lib/control-utils';
import {
  formatDisplayDate,
  isDateAfter,
  isDateBefore,
  normalizeCalendarDate,
  parseDisplayDate,
  toDateKey,
} from '../calendar/calendar-utils';
import {UiCalendar, type UiCalendarMarkedDate, type UiCalendarSize} from '../calendar/ui-calendar';

export type UiDatepickerProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  minDate?: Date;
  maxDate?: Date;
  markedDates?: UiCalendarMarkedDate[];
  disabledDates?: Array<Date | string>;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  uiSize?: UiCalendarSize;
  locale?: 'ko' | 'en';
  closeOnSelect?: boolean;
  allowManualInput?: boolean;
  className?: string;
  inputClassName?: string;
};

function useControllableDate(
  value: Date | null | undefined,
  defaultValue: Date | null | undefined,
  onChange?: (date: Date | null) => void,
) {
  const [internal, setInternal] = useState<Date | null>(defaultValue ?? null);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  const setSelected = (next: Date | null) => {
    if (!isControlled) {
      setInternal(next);
    }
    onChange?.(next);
  };

  return [selected, setSelected] as const;
}

function isDateAllowed(
  date: Date,
  options: {
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Array<Date | string>;
  },
) {
  if (options.minDate && isDateBefore(date, options.minDate)) {
    return false;
  }
  if (options.maxDate && isDateAfter(date, options.maxDate)) {
    return false;
  }
  if (options.disabledDates?.some((item) => toDateKey(normalizeCalendarDate(item)) === toDateKey(date))) {
    return false;
  }
  return true;
}

export function UiDatepicker({
  value,
  defaultValue = null,
  onChange,
  placeholder,
  name,
  id,
  minDate,
  maxDate,
  markedDates,
  disabledDates,
  disabled,
  readOnly,
  invalid,
  clearable = false,
  uiSize = 'md',
  locale = 'ko',
  closeOnSelect = true,
  allowManualInput = true,
  className,
  inputClassName,
}: UiDatepickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableDate(value, defaultValue, onChange);
  const [draft, setDraft] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const displayValue = selected ? formatDisplayDate(selected, locale) : '';
  const inputValue = isEditing ? draft : displayValue;
  const defaultPlaceholder = locale === 'en' ? 'Select date' : '날짜 선택';

  const closePopover = () => setOpen(false);
  const openPopover = () => {
    if (disabled || readOnly) {
      return;
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

  const handleSelect = (date: Date | null) => {
    setSelected(date);
    setIsEditing(false);
    setDraft(date ? formatDisplayDate(date, locale) : '');
    if (closeOnSelect) {
      closePopover();
    }
  };

  const commitDraft = () => {
    setIsEditing(false);

    if (!draft.trim()) {
      setSelected(null);
      setDraft('');
      return;
    }

    const parsed = parseDisplayDate(draft, locale);
    if (
      !parsed ||
      !isDateAllowed(parsed, {minDate, maxDate, disabledDates})
    ) {
      setDraft(displayValue);
      return;
    }

    setSelected(parsed);
    setDraft(formatDisplayDate(parsed, locale));
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
      closePopover();
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

  return (
    <div
      ref={rootRef}
      className={joinClasses(
        'ui-datepicker',
        `ui-datepicker--${uiSize}`,
        open && 'ui-datepicker--open',
        disabled && 'ui-datepicker--disabled',
        readOnly && 'ui-datepicker--readonly',
        invalid && 'ui-datepicker--invalid',
        className,
      )}
    >
      <div className="ui-datepicker__control">
        <input
          id={inputId}
          name={name}
          type="text"
          inputMode={allowManualInput ? 'numeric' : 'none'}
          autoComplete="off"
          className={joinClasses(
            'ui-input',
            'ui-datepicker__input',
            `ui-input--${uiSize}`,
            invalid && 'ui-input--invalid',
            disabled && 'ui-is-disabled',
            readOnly && 'ui-is-readonly',
            inputClassName,
          )}
          value={inputValue}
          placeholder={placeholder ?? defaultPlaceholder}
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

        <div className="ui-datepicker__actions">
          {clearable && selected && !disabled && !readOnly ? (
            <button
              type="button"
              className="ui-datepicker__clear"
              onClick={handleClear}
              aria-label={locale === 'en' ? 'Clear date' : '날짜 지우기'}
            >
              ×
            </button>
          ) : null}
          <button
            type="button"
            className="ui-datepicker__trigger"
            onClick={() => (open ? closePopover() : openPopover())}
            disabled={disabled || readOnly}
            aria-label={locale === 'en' ? 'Open calendar' : '캘린더 열기'}
            aria-expanded={open}
            aria-controls={`${inputId}-calendar`}
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
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M4 9h16M8 3v4M16 3v4" />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={`${inputId}-calendar`}
          className="ui-datepicker__popover"
          role="dialog"
          aria-label={locale === 'en' ? 'Choose date' : '날짜 선택'}
        >
          <UiCalendar
            value={selected}
            onChange={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            markedDates={markedDates}
            disabledDates={disabledDates}
            readOnly={readOnly}
            uiSize={uiSize}
            locale={locale}
            className="ui-calendar--popover"
          />
        </div>
      ) : null}
    </div>
  );
}

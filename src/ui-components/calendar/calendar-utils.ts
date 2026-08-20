export type CalendarCell = {
  date: Date | null;
  day: number | null;
  isToday: boolean;
  isSunday: boolean;
  isSaturday: boolean;
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function buildMonthCells(viewDate: Date, today = new Date()): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push({date: null, day: null, isToday: false, isSunday: false, isSaturday: false});
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    cells.push({
      date,
      day,
      isToday: isSameDay(date, today),
      isSunday: weekday === 0,
      isSaturday: weekday === 6,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({date: null, day: null, isToday: false, isSunday: false, isSaturday: false});
  }

  return cells;
}

export function isDateBefore(a: Date, b: Date) {
  return toDateKey(a) < toDateKey(b);
}

export function isDateAfter(a: Date, b: Date) {
  return toDateKey(a) > toDateKey(b);
}

export function formatDisplayDate(date: Date, locale: 'ko' | 'en' = 'ko') {
  if (locale === 'en') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function parseDisplayDate(text: string, locale: 'ko' | 'en' = 'ko') {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  if (locale === 'en') {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  const normalized = trimmed.replace(/[/.]/g, '-');
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function normalizeCalendarDate(value: Date | string) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const parsed = parseDisplayDate(value);
  if (parsed) {
    return parsed;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

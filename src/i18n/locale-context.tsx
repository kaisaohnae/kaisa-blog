'use client';

import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from 'react';
import {
  DEFAULT_LOCALE,
  peekStoredLocale,
  persistLocale,
  resolveLocale,
} from './detect';
import {translate} from './translate';
import type {Locale} from './types';

interface LocaleContextValue {
  locale: Locale;
  country: string | null;
  t: (key: string) => string;
  setLocale: (locale: Locale, country?: string | null) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  country: null,
  t: (key: string) => key,
  setLocale: () => undefined,
});

function applyDocumentLang(locale: Locale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
}

export function LocaleProvider({children}: {children: ReactNode}) {
  const [locale, setLocaleState] = useState<Locale>(() => peekStoredLocale() ?? DEFAULT_LOCALE);
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    applyDocumentLang(peekStoredLocale() ?? DEFAULT_LOCALE);

    resolveLocale().then((result) => {
      if (cancelled) return;
      setLocaleState(result.locale);
      setCountry(result.country);
      applyDocumentLang(result.locale);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: Locale, nextCountry: string | null = null) => {
    setLocaleState(next);
    setCountry(nextCountry);
    persistLocale(next, nextCountry);
    applyDocumentLang(next);
  }, []);

  const value: LocaleContextValue = {
    locale,
    country,
    t: (key: string) => translate(key, locale),
    setLocale,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useCountry(): string | null {
  return useContext(LocaleContext).country;
}

export function useSetLocale(): (locale: Locale, country?: string | null) => void {
  return useContext(LocaleContext).setLocale;
}

export function useT(): (key: string) => string {
  return useContext(LocaleContext).t;
}

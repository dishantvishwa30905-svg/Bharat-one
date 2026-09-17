'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'en' | 'hi' | 'mr';
interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string>) => string; }

const I18nContext = createContext<I18nCtx>({ lang: 'en', setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [dict, setDict] = useState<any>({});

  useEffect(() => {
    const saved = (typeof window !== 'undefined' ? localStorage.getItem('lang') : null) as Lang | null;
    if (saved && ['en', 'hi', 'mr'].includes(saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    fetch(`/locales/${lang}.json`)
      .then(r => r.json())
      .then(setDict)
      .catch(() => {});
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') localStorage.setItem('lang', l);
  };

  const t = (key: string, vars?: Record<string, string>): string => {
    const parts = key.split('.');
    let val: any = dict;
    for (const p of parts) { val = val?.[p]; }
    if (typeof val !== 'string') return key;
    if (vars) {
      return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), val);
    }
    return val;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { translations, type Lang } from './translations';

export type { Lang };

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const STORAGE_KEY = 'app_lang';
const DEFAULT_LANG: Lang = 'pt';

function getInitialLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && (saved === 'pt' || saved === 'en' || saved === 'es')) return saved;
  }
  return DEFAULT_LANG;
}

// Resolve "a.b.c" dentro do objeto de traduções
function resolve(obj: unknown, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string | undefined;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** t('header.search') — com interpolação opcional: t('x', { count: 3 }) */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Escolhe o campo do banco pelo idioma atual, com fallback pro PT. */
  localized: <T extends Record<string, unknown>>(obj: T | undefined | null, base: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = resolve(translations[lang], key) ?? resolve(translations[DEFAULT_LANG], key) ?? key;
      if (!vars) return value;
      return Object.keys(vars).reduce(
        (str, k) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k])),
        value
      );
    },
    [lang]
  );

  const localized = useCallback(
    <T extends Record<string, unknown>>(obj: T | undefined | null, base: string): string => {
      if (!obj) return '';
      const fallback = (obj[base] as string) ?? '';
      if (lang === 'pt') return fallback;
      const localizedVal = obj[`${base}_${lang}`] as string | undefined;
      return localizedVal && localizedVal.trim() ? localizedVal : fallback;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, localized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider');
  return ctx;
}

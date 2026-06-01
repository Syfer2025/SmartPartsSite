import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useTranslation, LANGUAGES, type Lang } from '../i18n/LanguageContext';
import { FlagIcon } from './FlagIcon';

interface LanguageSelectorProps {
  /** 'desktop' shows a compact dropdown; 'mobile' shows inline pill buttons */
  variant?: 'desktop' | 'mobile';
  /** 'dark' for dark backgrounds (header/sidebar), 'light' for white surfaces */
  tone?: 'dark' | 'light';
  className?: string;
}

export function LanguageSelector({
  variant = 'desktop',
  tone = 'dark',
  className = '',
}: LanguageSelectorProps) {
  const { lang, setLang, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code as Lang)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              l.code === lang
                ? 'bg-red-600 text-white'
                : tone === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={l.code === lang}
          >
            <FlagIcon code={l.code} className="w-5 h-auto" />
            <span>{l.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  const triggerClass =
    tone === 'dark'
      ? 'text-gray-200 hover:text-white hover:bg-white/10'
      : 'text-gray-700 hover:bg-gray-100';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FlagIcon code={current.code} className="w-5 h-auto" />
        <span>{current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 z-[60]" role="listbox">
          {/* Mesmo padrão do mega-menu de Categorias */}
          <div className="bg-gradient-to-br from-white to-gray-50 text-black shadow-2xl rounded-2xl overflow-hidden border-2 border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center gap-2.5">
              <Globe className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-black text-sm leading-tight">{t('header.languageTitle')}</h3>
                <p className="text-[11px] text-red-100 leading-tight">
                  {t('header.languageTagline')}
                </p>
              </div>
            </div>

            {/* Opções */}
            <div className="p-2 space-y-1">
              {LANGUAGES.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code as Lang);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left border-2 transition-all duration-200 ${
                      active
                        ? 'bg-red-50 border-red-500 text-red-600 font-bold shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-600'
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    <FlagIcon code={l.code} className="w-6 h-auto" />
                    <span className="flex-1">{l.label}</span>
                    {active && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation, LANGUAGES, type Lang } from '../i18n/LanguageContext';

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
  const { lang, setLang } = useTranslation();
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
            <span className="text-base leading-none">{l.flag}</span>
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
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[60]"
          role="listbox"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code as Lang);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                l.code === lang
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="option"
              aria-selected={l.code === lang}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;

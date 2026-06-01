import type { Lang } from '../i18n/LanguageContext';

interface FlagIconProps {
  code: Lang;
  className?: string;
}

// Bandeiras em SVG (emoji de bandeira não renderiza no Windows).
export function FlagIcon({ code, className = 'w-5 h-auto' }: FlagIconProps) {
  const common = {
    viewBox: '0 0 28 20',
    className: `${className} rounded-[2px] ring-1 ring-black/10 shrink-0`,
    'aria-hidden': true as const,
  };

  if (code === 'pt') {
    return (
      <svg {...common}>
        <rect width="28" height="20" fill="#009b3a" />
        <path d="M14 2.2 26 10 14 17.8 2 10Z" fill="#fedf00" />
        <circle cx="14" cy="10" r="4.1" fill="#002776" />
      </svg>
    );
  }

  if (code === 'es') {
    return (
      <svg {...common}>
        <rect width="28" height="20" fill="#c60b1e" />
        <rect y="5" width="28" height="10" fill="#ffc400" />
      </svg>
    );
  }

  // en -> EUA
  return (
    <svg {...common}>
      <rect width="28" height="20" fill="#b22234" />
      <g fill="#fff">
        <rect y="1.54" width="28" height="1.54" />
        <rect y="4.62" width="28" height="1.54" />
        <rect y="7.69" width="28" height="1.54" />
        <rect y="10.77" width="28" height="1.54" />
        <rect y="13.85" width="28" height="1.54" />
        <rect y="16.92" width="28" height="1.54" />
      </g>
      <rect width="12" height="10.77" fill="#3c3b6e" />
    </svg>
  );
}

export default FlagIcon;

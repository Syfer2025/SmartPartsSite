import {
  Package,
  Snowflake,
  Wind,
  Disc,
  Settings,
  Circle,
  Wrench,
  CircleDot,
  Box,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Ícone SVG padrão por slug de categoria (fallback quando não há imagem própria).
export const categoryIcons: { [slug: string]: LucideIcon } = {
  'geladeiras-portateis': Snowflake,
  'ar-condicionado': Wind,
  'catracas-freio': Disc,
  'patim-freio': Settings,
  cuicas: Circle,
  eixos: Wrench,
  'rodas-ferro': CircleDot,
  'rodas-aluminio': CircleDot,
  rolamentos: Circle,
  'cinta-catraca': Package,
  'pe-carreta': Box,
  'mola-cuica': Settings,
  'gerador-energia': Zap,
};

export const DefaultCategoryIcon = Package;

export function getCategoryIcon(slug?: string): LucideIcon {
  return (slug && categoryIcons[slug]) || DefaultCategoryIcon;
}

// Só tratamos como imagem quando for URL real ou base64 — emoji/texto cai no SVG.
export function isImageIcon(icon?: string): boolean {
  return !!icon && (icon.startsWith('data:image') || icon.startsWith('http'));
}

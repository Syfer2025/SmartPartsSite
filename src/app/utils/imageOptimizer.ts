/**
 * Optimizes Supabase Storage image URLs by adding transformation parameters.
 * Since Supabase Storage (Free Tier) does NOT support on-the-fly transformations,
 * we use `wsrv.nl` (a free, privacy-focused, open-source image CDN) to resize and cache images.
 * 
 * @param url - Original image URL from Supabase Storage
 * @param width - Desired width (default: 300)
 * @param quality - Image quality 1-100 (default: 75)
 * @returns Optimized image URL
 */
export function optimizeSupabaseImage(url: string, width: number = 300, quality: number = 75): string {
  if (!url) return '';
  
  // Se já for uma URL otimizada ou data URL, retorna original
  if (url.startsWith('data:') || url.includes('wsrv.nl')) return url;

  // Se não for HTTPS (ex: localhost), retorna original
  if (!url.startsWith('http')) return url;

  try {
    // Codifica a URL original para passar como parâmetro
    // Remove parâmetros de query existentes para evitar conflitos limpos
    const cleanUrl = url.split('?')[0];
    
    // Constrói a URL do serviço de otimização
    // url: URL da imagem original
    // w: largura
    // q: qualidade
    // we: não aumentar imagens menores que o tamanho solicitado
    // default: retorna imagem padrão em caso de erro
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&q=${quality}&output=webp&we&default=${encodeURIComponent(cleanUrl)}`;
  } catch (e) {
    return url;
  }
}

/**
 * Gets responsive srcset for Supabase images
 * @param url - Original image URL
 * @returns srcset string for responsive images
 */
export function getSupabaseImageSrcSet(url: string): string {
  if (!url || url.startsWith('data:')) {
    return '';
  }

  return `
    ${optimizeSupabaseImage(url, 300, 75)} 300w,
    ${optimizeSupabaseImage(url, 600, 80)} 600w,
    ${optimizeSupabaseImage(url, 900, 85)} 900w,
    ${optimizeSupabaseImage(url, 1200, 85)} 1200w,
    ${optimizeSupabaseImage(url, 1920, 85)} 1920w
  `.trim();
}

/**
 * Preset sizes for common use cases
 */
export const IMAGE_PRESETS = {
  /** Search result thumbnails (56-80px display) */
  thumbnail: { width: 100, quality: 70 },
  /** Product card images (252px display) */
  card: { width: 300, quality: 80 },
  /** Category page product images */
  categoryCard: { width: 400, quality: 80 },
  /** Product detail main image */
  detail: { width: 800, quality: 85 },
  /** Hero banner full width */
  hero: { width: 1920, quality: 80 },
  /** Category icon (small) */
  icon: { width: 64, quality: 75 },
} as const;

/**
 * Optimize image with preset
 */
export function optimizeWithPreset(url: string, preset: keyof typeof IMAGE_PRESETS): string {
  const { width, quality } = IMAGE_PRESETS[preset];
  return optimizeSupabaseImage(url, width, quality);
}

/**
 * Handles image load error by falling back to the original URL.
 * Use as: <img onError={createImageFallback(originalUrl)} />
 */
export function createImageFallback(originalUrl: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Evita loop infinito: só faz fallback uma vez
    if (!img.dataset.fallback) {
      img.dataset.fallback = '1';
      img.src = originalUrl;
    }
  };
}
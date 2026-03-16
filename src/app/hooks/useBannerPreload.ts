import { useEffect, useRef } from 'react';
import { optimizeSupabaseImage } from '@/app/utils/imageOptimizer';

/**
 * Injects a <link rel="preload"> for the first banner image as soon as
 * the banner URL is known (from localStorage cache or API fetch).
 * 
 * This tells the browser to start downloading the LCP image immediately,
 * even before React renders the <img> tag in the Hero component.
 * 
 * Typical LCP improvement: 200-500ms on first visit, near-instant on repeat visits.
 */
export function useBannerPreload(bannerImageUrl: string | undefined) {
  const preloadLinkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    if (!bannerImageUrl || bannerImageUrl.startsWith('data:')) return;

    // Don't create duplicate preload links
    if (preloadLinkRef.current) return;

    // Optimize the URL the same way Hero.tsx does
    const optimizedUrl = optimizeSupabaseImage(bannerImageUrl, 1920, 80);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    link.type = 'image/webp';
    // fetchpriority="high" matches the <img> in Hero
    (link as any).fetchpriority = 'high';
    
    document.head.appendChild(link);
    preloadLinkRef.current = link;

    return () => {
      if (preloadLinkRef.current && document.head.contains(preloadLinkRef.current)) {
        document.head.removeChild(preloadLinkRef.current);
        preloadLinkRef.current = null;
      }
    };
  }, [bannerImageUrl]);
}

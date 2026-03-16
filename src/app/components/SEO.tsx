import { useEffect } from 'react';
import favicon from 'figma:asset/64691187aafea5b1405da18747b628927fc164ef.png';
import logo from 'figma:asset/93a318fedff287cf8ae9966775cd849f3e3199e4.png';
import { projectId } from '../../../utils/supabase/info';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
}

export function SEO({
  title = 'SMART PARTS IMPORT - Peças Premium para Caminhões e Carretas',
  description = 'Importadora especializada em peças premium para caminhões e carretas. Geladeiras portáteis, ar condicionado, sistema de freios, eixos, rodas e mais. Fornecedor B2B exclusivo.',
  keywords = 'peças para caminhões, peças para carretas, geladeiras portáteis, ar condicionado para caminhão, catracas de freio, patim de freio, cuicas, eixos, rodas de alumínio, rodas de ferro, rolamentos, cinta com catraca, pé de carreta, mola de cuica, importadora de peças, fornecedor B2B',
  ogImage = '',
  url = ''
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // PERFORMANCE: Preload logo LCP image
    let preloadLogo = document.querySelector('link[rel="preload"][as="image"][data-logo]') as HTMLLinkElement;
    if (!preloadLogo) {
      preloadLogo = document.createElement('link');
      preloadLogo.setAttribute('rel', 'preload');
      preloadLogo.setAttribute('as', 'image');
      preloadLogo.setAttribute('href', logo);
      preloadLogo.setAttribute('data-logo', '1');
      preloadLogo.setAttribute('fetchpriority', 'high');
      document.head.appendChild(preloadLogo);
    }

    // PERFORMANCE: Resource hints — preconnect & dns-prefetch for critical origins
    // This eliminates DNS lookup + TCP handshake + TLS negotiation latency
    // for the first API/image request (~100–300ms saved on cold start).
    // NOTE: True HTTP/2 Server Push requires server-side configuration (e.g., Supabase Edge
    // Functions with Link: <asset>; rel=preload headers). Since we can't configure that
    // from the client, we use preconnect (early connection) + preload (early fetch) instead,
    // which achieves ~80% of the same benefit in a SPA context.
    const criticalOrigins = [
      `https://${projectId}.supabase.co`,      // API + Edge Functions
      `https://${projectId}.supabase.co/storage/v1`, // Storage (images)
      'https://wsrv.nl',                        // Image CDN (resize proxy)
    ];

    criticalOrigins.forEach((origin) => {
      const baseOrigin = new URL(origin).origin;

      // preconnect (DNS + TCP + TLS)
      if (!document.querySelector(`link[rel="preconnect"][href="${baseOrigin}"]`)) {
        const preconnect = document.createElement('link');
        preconnect.setAttribute('rel', 'preconnect');
        preconnect.setAttribute('href', baseOrigin);
        preconnect.setAttribute('crossorigin', '');
        document.head.appendChild(preconnect);
      }

      // dns-prefetch (fallback for browsers that don't support preconnect)
      if (!document.querySelector(`link[rel="dns-prefetch"][href="${baseOrigin}"]`)) {
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.setAttribute('rel', 'dns-prefetch');
        dnsPrefetch.setAttribute('href', baseOrigin);
        document.head.appendChild(dnsPrefetch);
      }
    });

    // Update or create meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: 'SMART PARTS IMPORT' },
      { name: 'robots', content: 'index, follow' },
      
      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:site_name', content: 'SMART PARTS IMPORT' },
      { property: 'og:locale', content: 'pt_BR' },
      
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: url },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
      
      // Additional SEO
      { name: 'theme-color', content: '#DC2626' },
      { name: 'msapplication-TileColor', content: '#DC2626' },
    ];

    metaTags.forEach((tag) => {
      const attribute = tag.name ? 'name' : 'property';
      const value = tag.name || tag.property;
      
      let element = document.querySelector(`meta[${attribute}="${value}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value!);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', tag.content);
    });

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Update favicon
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = favicon;

    // Update apple touch icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = favicon;

  }, [title, description, keywords, ogImage, url]);

  return null;
}
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

export const trackEvent = async (event: string, data: any = {}) => {
  try {
    await fetch(`${API_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ event, data })
    });
  } catch {
    // Silently ignore — analytics endpoint may not be deployed yet
  }
};

export const useAnalytics = () => {
  return {
    trackPageView: (page: string) => trackEvent('page_view', { page }),
    trackProductView: (productId: string, productName: string) => 
      trackEvent('product_view', { productId, productName }),
    trackCategoryView: (categorySlug: string, categoryName: string) => 
      trackEvent('category_view', { categorySlug, categoryName }),
    trackWhatsAppClick: (location: string, productId?: string) => 
      trackEvent('whatsapp_click', { location, productId }),
    trackCatalogOpen: () => trackEvent('catalog_open', {}),
    trackCartAction: (action: string, productId?: string) => 
      trackEvent('cart_action', { action, productId }),
  };
};
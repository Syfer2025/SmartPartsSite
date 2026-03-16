import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  image: string;
  description: string;
  sku?: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  buttonText?: string;
  buttonLink?: string;
  order: number;
}

interface DataContextType {
  categories: Category[];
  products: Product[];
  banners: Banner[];
  loading: boolean;
  bannersLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  // Load from cache immediately on mount
  useEffect(() => {
    const cachedCategories = localStorage.getItem('categories_cache');
    const cachedProducts = localStorage.getItem('products_cache');
    
    if (cachedCategories && cachedProducts) {
      try {
        const parsedCategories = JSON.parse(cachedCategories);
        const parsedProducts = JSON.parse(cachedProducts);
        
        if (Array.isArray(parsedCategories) && Array.isArray(parsedProducts)) {
          setCategories(parsedCategories);
          setProducts(parsedProducts);
        }
      } catch (e) {
        // Cache parse error - ignore and fetch fresh data
      }
    }
  }, []);

  const fetchData = async (retryCount = 0, signal?: AbortSignal): Promise<void> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);
    
    try {
      // Only show loading if we don't have cached data
      if (categories.length === 0 && products.length === 0) {
        setLoading(true);
      }
      setError(null);

      // Use external signal if provided (for cleanup on unmount)
      const fetchSignal = signal || controller.signal;

      const [categoriesRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/categories`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: fetchSignal
        }),
        fetch(`${API_URL}/products`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: fetchSignal
        })
      ]);

      clearTimeout(timeout);

      if (!categoriesRes.ok || !productsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [categoriesData, productsData] = await Promise.all([
        categoriesRes.json(),
        productsRes.json()
      ]);

      // Garantir que sempre temos arrays, nunca undefined
      const fetchedCategories = Array.isArray(categoriesData.categories) ? categoriesData.categories : [];
      const fetchedProducts = Array.isArray(productsData.products) ? productsData.products : [];

      setCategories(fetchedCategories);
      setProducts(fetchedProducts);
      setError(null);
      
      // Cache the data for instant load next time
      // Only cache metadata, not large images to avoid quota issues
      try {
        const categoriesToCache = fetchedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon.startsWith('data:image') && cat.icon.length > 1000 ? '📦' : cat.icon, // Replace large base64 with emoji
          description: cat.description
        }));
        
        const productsToCache = fetchedProducts.map(prod => ({
          id: prod.id,
          name: prod.name,
          category: prod.category,
          categorySlug: prod.categorySlug,
          image: prod.image.startsWith('data:image') ? '' : prod.image, // Don't cache base64 images
          description: prod.description,
          sku: prod.sku
        }));
        
        localStorage.setItem('categories_cache', JSON.stringify(categoriesToCache));
        localStorage.setItem('products_cache', JSON.stringify(productsToCache));
      } catch (e) {
        // If quota exceeded, clear old cache and try again with minimal data
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          console.warn('[DataContext] ⚠️ LocalStorage quota exceeded, clearing cache...');
          try {
            localStorage.removeItem('categories_cache');
            localStorage.removeItem('products_cache');
          } catch (clearError) {
            // Failed to clear cache
          }
        } else {
          console.error('[DataContext] Cache save error:', e);
        }
      }
    } catch (err) {
      clearTimeout(timeout);
      
      // Ignore AbortError on unmount or intentional abort
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[DataContext] ⚠️ Request aborted (timeout or component unmount)');
        
        // Don't retry or set error if externally aborted (component unmount)
        if (signal) {
          return;
        }
        
        // Only retry if it's a timeout, not a manual abort
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchData(retryCount + 1);
        }
        
        setError('Request timeout - please refresh the page');
        return;
      }
      
      console.error('[DataContext] ❌ Error:', err);
      
      // Retry logic - tentar até 3 vezes
      if (retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchData(retryCount + 1);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(0, controller.signal);
    
    // Cleanup function to abort pending requests on unmount
    return () => {
      controller.abort();
    };
  }, []);

  // Fetch banners separately (non-blocking, lower priority than products/categories)
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchBanners = async () => {
      try {
        // Load cached banners instantly
        const cachedBanners = localStorage.getItem('banners_cache');
        if (cachedBanners) {
          try {
            const parsed = JSON.parse(cachedBanners);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBanners(parsed);
            }
          } catch (e) { /* ignore */ }
        }

        const response = await fetch(`${API_URL}/banners`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch banners');
        
        const data = await response.json();
        const fetchedBanners = Array.isArray(data.banners) ? data.banners : [];
        setBanners(fetchedBanners);
        
        // Cache banners (only URLs, not heavy data)
        try {
          localStorage.setItem('banners_cache', JSON.stringify(fetchedBanners));
        } catch (e) { /* quota exceeded */ }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      } finally {
        setBannersLoading(false);
      }
    };
    
    fetchBanners();
    return () => controller.abort();
  }, []);

  const value = {
    categories,
    products,
    banners,
    loading,
    bannersLoading,
    error,
    refetchData: () => fetchData(0)
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
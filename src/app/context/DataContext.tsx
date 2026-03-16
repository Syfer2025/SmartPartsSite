import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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

  // Track if we have cached data to avoid showing errors when cache is available
  const hasCachedData = useRef(false);

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
          hasCachedData.current = true;
          // If cache exists, don't block rendering with loading state
          setLoading(false);
        }
      } catch (e) {
        // Cache parse error - ignore and fetch fresh data
      }
    }
  }, []);

  const fetchData = async (retryCount = 0, signal?: AbortSignal): Promise<void> => {
    // Increase timeout for cold starts (15s first try, 12s retries)
    const timeoutMs = retryCount === 0 ? 15000 : 12000;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    
    try {
      // Only show loading if we don't have cached data
      if (!hasCachedData.current) {
        setLoading(true);
      }
      setError(null);

      // Combine external signal (unmount) with internal timeout signal
      // If external signal aborts, we should stop. If internal timeout fires, we should also stop.
      const handleExternalAbort = () => controller.abort();
      if (signal) {
        if (signal.aborted) {
          clearTimeout(timeout);
          return;
        }
        signal.addEventListener('abort', handleExternalAbort, { once: true });
      }

      const [categoriesRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/categories`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: controller.signal
        }),
        fetch(`${API_URL}/products`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: controller.signal
        })
      ]);

      clearTimeout(timeout);
      if (signal) signal.removeEventListener('abort', handleExternalAbort);

      if (!categoriesRes.ok || !productsRes.ok) {
        throw new Error(`API error: categories=${categoriesRes.status}, products=${productsRes.status}`);
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
      hasCachedData.current = true;
      
      // Cache the data for instant load next time
      // Only cache metadata, not large images to avoid quota issues
      try {
        const categoriesToCache = fetchedCategories.map((cat: Category) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon.startsWith('data:image') && cat.icon.length > 1000 ? '📦' : cat.icon,
          description: cat.description
        }));
        
        const productsToCache = fetchedProducts.map((prod: Product) => ({
          id: prod.id,
          name: prod.name,
          category: prod.category,
          categorySlug: prod.categorySlug,
          image: prod.image.startsWith('data:image') ? '' : prod.image,
          description: prod.description,
          sku: prod.sku
        }));
        
        localStorage.setItem('categories_cache', JSON.stringify(categoriesToCache));
        localStorage.setItem('products_cache', JSON.stringify(productsToCache));
      } catch (e) {
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          try {
            localStorage.removeItem('categories_cache');
            localStorage.removeItem('products_cache');
          } catch (clearError) {
            // Failed to clear cache
          }
        }
      }
    } catch (err) {
      clearTimeout(timeout);
      
      // Ignore AbortError from component unmount
      if (err instanceof Error && err.name === 'AbortError') {
        // If externally aborted (unmount), don't retry or set error
        if (signal?.aborted) {
          return;
        }
        
        // Internal timeout - retry with backoff
        if (retryCount < 2) {
          const delay = 2000 * (retryCount + 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchData(retryCount + 1, signal);
        }
        
        // After retries, only show error if no cached data
        if (!hasCachedData.current) {
          setError('Tempo limite excedido. Verifique sua conexão e tente novamente.');
        }
        return;
      }
      
      // Network or other error - retry with backoff
      if (retryCount < 2) {
        const delay = 2000 * (retryCount + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchData(retryCount + 1, signal);
      }
      
      // After all retries failed, only show error if no cached data available
      if (!hasCachedData.current) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados. Tente novamente.');
      }
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
              setBannersLoading(false);
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
        // Silently fail for banners - they're non-critical
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
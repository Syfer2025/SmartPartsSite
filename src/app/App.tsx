import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Products } from './components/Products';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CategoryPage } from './components/CategoryPage';
import { LazySection } from './components/LazySection';

// Lazy load components that still use motion/react — keeps motion out of initial bundle
// AboutUs + Footer are below-the-fold; ProductDetail only renders on /produto/* pages
const AboutUs = lazy(() => import('./components/AboutUs'));
const Footer = lazy(() => import('./components/Footer'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const Admin = lazy(() => import('./components/admin/Admin'));
const AdminSignup = lazy(() => import('./components/admin/AdminSignup'));
const AdminReset = lazy(() => import('./components/admin/AdminReset'));
const CompleteSetup = lazy(() => import('./components/admin/CompleteSetup'));
const AdminGuard = lazy(() => import('./components/admin/AdminGuard'));
const Debug = lazy(() => import('./components/Debug'));
const ApiDocs = lazy(() => import('./components/ApiDocs'));
const SeedDatabase = lazy(() => import('./components/admin/SeedDatabase'));
const UploadAssets = lazy(() => import('./components/admin/UploadAssets'));

import { SEO } from './components/SEO';
import { Toaster } from 'sonner';
import { DataProvider, useData } from './context/DataContext';
import { useAnalytics } from './hooks/useAnalytics';
import { useBannerPreload } from './hooks/useBannerPreload';
import { ErrorBoundary } from './components/ErrorBoundary';

type Page = 'home' | 'category' | 'product' | 'admin' | 'admin-setup' | 'admin-reset' | 'complete-setup' | 'debug' | 'docs' | 'seed' | 'upload-assets';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-sm">Carregando...</p>
    </div>
  </div>
);

// Skeleton for below-fold sections
const SectionSkeleton = () => (
  <div className="py-16 bg-gray-50 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const FooterSkeleton = () => (
  <div className="bg-black py-16">
    <div className="container mx-auto px-4">
      <div className="h-16 w-48 bg-gray-800 rounded mx-auto mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map(i => (
          <div key={i} className="h-64 bg-gray-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Inner app component that has access to DataContext for banner preload.
 * Separated so useBannerPreload can call useData().
 */
function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentSlug, setCurrentSlug] = useState<string>('');
  const [currentProductId, setCurrentProductId] = useState<string>('');

  // Initialize analytics - must be called at top level (Rules of Hooks)
  const analytics = useAnalytics();

  // Preload first banner image for LCP optimization
  const { banners } = useData();
  const firstBannerUrl = banners.length > 0 && banners[0].mediaType !== 'video'
    ? banners[0].imageUrl
    : undefined;
  useBannerPreload(firstBannerUrl);

  // REMOVED: Preconnect via JS useEffect was useless — browser ignores preconnects
  // created after HTML parsing. Moved to vite.config.ts preconnectPlugin() which
  // injects them as static <link> tags in the HTML <head>.

  // Check URL for /admin route
  useEffect(() => {
    const path = window.location.pathname;
    
    // Helper to parse route from pathname
    const parseRoute = (p: string) => {
      if (p === '/admin' || p === '/admin/') return { page: 'admin' as Page };
      if (p === '/admin-setup' || p === '/admin-setup/') return { page: 'admin-setup' as Page };
      if (p === '/admin-reset' || p === '/admin-reset/') return { page: 'admin-reset' as Page };
      if (p === '/complete-setup' || p === '/complete-setup/') return { page: 'complete-setup' as Page };
      if (p === '/debug' || p === '/debug/') return { page: 'debug' as Page };
      if (p === '/docs' || p === '/docs/') return { page: 'docs' as Page };
      if (p === '/seed' || p === '/seed/') return { page: 'seed' as Page };
      if (p === '/upload-assets' || p === '/upload-assets/') return { page: 'upload-assets' as Page };
      if (p.startsWith('/categoria/')) {
        const slug = p.replace('/categoria/', '').replace(/\/$/, '');
        return { page: 'category' as Page, slug };
      }
      if (p.startsWith('/produto/')) {
        const productId = p.replace('/produto/', '').replace(/\/$/, '');
        return { page: 'product' as Page, productId };
      }
      return { page: 'home' as Page };
    };

    // Set initial route from URL
    const initial = parseRoute(path);
    setCurrentPage(initial.page);
    if (initial.slug) setCurrentSlug(initial.slug);
    if (initial.productId) setCurrentProductId(initial.productId);

    // Save initial state with replaceState so browser back works correctly
    window.history.replaceState(
      { page: initial.page, slug: initial.slug || '', productId: initial.productId || '' },
      '',
      path
    );

    // Handle browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      // Scroll to top on browser navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Try to restore from saved state first (most reliable)
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        setCurrentSlug(event.state.slug || '');
        setCurrentProductId(event.state.productId || '');
        return;
      }

      // Fallback: parse from URL
      const route = parseRoute(window.location.pathname);
      setCurrentPage(route.page);
      setCurrentSlug(route.slug || '');
      setCurrentProductId(route.productId || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when navigating to admin
  useEffect(() => {
    const state = { page: currentPage, slug: currentSlug, productId: currentProductId };
    if (currentPage === 'admin') {
      window.history.pushState(state, '', '/admin');
    } else if (currentPage === 'admin-setup') {
      window.history.pushState(state, '', '/admin-setup');
    } else if (currentPage === 'admin-reset') {
      window.history.pushState(state, '', '/admin-reset');
    } else if (currentPage === 'complete-setup') {
      window.history.pushState(state, '', '/complete-setup');
    } else if (currentPage === 'debug') {
      window.history.pushState(state, '', '/debug');
    } else if (currentPage === 'docs') {
      window.history.pushState(state, '', '/docs');
    } else if (currentPage === 'seed') {
      window.history.pushState(state, '', '/seed');
    } else if (currentPage === 'upload-assets') {
      window.history.pushState(state, '', '/upload-assets');
    }
  }, [currentPage]);

  // Track page views
  useEffect(() => {
    analytics.trackPageView(currentPage);
  }, [currentPage]);

  // FORCE SCROLL TO TOP whenever page, slug, or productId changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [currentPage, currentSlug, currentProductId]);

  const handleNavigate = (page: string, slug?: string, productId?: string) => {
    setCurrentPage(page as Page);
    setCurrentSlug(slug || '');
    setCurrentProductId(productId || '');
    
    // SCROLL IMEDIATO TAMBÉM NO NAVIGATE - SEM BEHAVIOR
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.scrollIntoView({ block: 'start' });
    
    // Build state object for history (enables reliable back/forward)
    const state = { page, slug: slug || '', productId: productId || '' };
    
    // Update browser history — only push if URL actually changes
    let targetUrl = '/';
    if (page === 'category' && slug) {
      targetUrl = `/categoria/${slug}`;
    } else if (page === 'product' && productId) {
      targetUrl = `/produto/${productId}`;
    }
    
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(state, '', targetUrl);
    } else {
      window.history.replaceState(state, '', targetUrl);
    }
  };

  // Helper to check if current page is an admin/tool page
  const isAdminPage = currentPage === 'admin' || currentPage === 'admin-setup' || 
    currentPage === 'admin-reset' || currentPage === 'complete-setup' || 
    currentPage === 'debug' || currentPage === 'docs' || currentPage === 'seed' || currentPage === 'upload-assets';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-right" richColors />
      
      {/* SEO Component with dynamic titles */}
      {currentPage === 'home' && (
        <SEO
          title="SMART PARTS IMPORT - Peças Premium para Caminhões e Carretas"
          description="Importadora especializada em peças premium para caminhões e carretas. Geladeiras portáteis, ar condicionado, sistema de freios, eixos, rodas e mais. Fornecedor B2B exclusivo."
        />
      )}
      {currentPage === 'category' && (
        <SEO
          title={`${currentSlug} - SMART PARTS IMPORT`}
          description={`Explore nossa linha completa de ${currentSlug} para caminhões e carretas. Produtos de alta qualidade e durabilidade.`}
        />
      )}
      {currentPage === 'product' && (
        <SEO
          title={`Produto - SMART PARTS IMPORT`}
          description="Veja as especificações técnicas completas deste produto premium para caminhões e carretas."
        />
      )}
      {currentPage === 'docs' && (
        <SEO
          title="Documentação da API - SMART PARTS IMPORT"
          description="Documentação completa da API REST para integração com sistemas externos (ERPs). Endpoints para produtos, categorias e autenticação."
        />
      )}
      {currentPage === 'admin' && (
        <SEO
          title="Painel Administrativo - SMART PARTS IMPORT"
          description="Painel de administração para gerenciar produtos, categorias, banners e configurações do site."
        />
      )}
      
      <div className="flex flex-col flex-1">
        {!isAdminPage && (
          <Header onNavigate={handleNavigate} />
        )}

        <main>
          <ErrorBoundary>
            {currentPage === 'home' && (
              <div>
                <Hero />
                <Products onNavigate={handleNavigate} />
                {/* AboutUs is below-the-fold: lazy loaded via IntersectionObserver */}
                <LazySection
                  fallback={<SectionSkeleton />}
                  rootMargin="400px"
                  minHeight="600px"
                >
                  <AboutUs />
                </LazySection>
              </div>
            )}

            {currentPage === 'category' && (
              <div>
                <CategoryPage categorySlug={currentSlug} onNavigate={handleNavigate} />
              </div>
            )}

            {currentPage === 'product' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <ProductDetail productId={currentProductId} onNavigate={handleNavigate} />
                </Suspense>
              </div>
            )}

            {currentPage === 'admin' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <Admin onNavigate={handleNavigate} />
                </Suspense>
              </div>
            )}

            {currentPage === 'admin-setup' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <AdminSignup />
                </Suspense>
              </div>
            )}

            {currentPage === 'admin-reset' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <AdminReset />
                </Suspense>
              </div>
            )}

            {currentPage === 'complete-setup' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <CompleteSetup />
                </Suspense>
              </div>
            )}

            {currentPage === 'debug' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <AdminGuard onNavigate={handleNavigate}>
                    <Debug onNavigate={handleNavigate} />
                  </AdminGuard>
                </Suspense>
              </div>
            )}

            {currentPage === 'docs' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <AdminGuard onNavigate={handleNavigate}>
                    <ApiDocs />
                  </AdminGuard>
                </Suspense>
              </div>
            )}

            {currentPage === 'seed' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <AdminGuard onNavigate={handleNavigate}>
                    <SeedDatabase />
                  </AdminGuard>
                </Suspense>
              </div>
            )}

            {currentPage === 'upload-assets' && (
              <div>
                <Suspense fallback={<PageLoader />}>
                  <AdminGuard onNavigate={handleNavigate}>
                    <UploadAssets />
                  </AdminGuard>
                </Suspense>
              </div>
            )}
          </ErrorBoundary>
        </main>

        {/* Footer is always below-the-fold: lazy loaded via IntersectionObserver */}
        {!isAdminPage && (
          <LazySection
            fallback={<FooterSkeleton />}
            rootMargin="300px"
            minHeight="400px"
          >
            <Footer onNavigate={handleNavigate} />
          </LazySection>
        )}
      </div>

      {/* Ocultar WhatsApp e Carrinho nas páginas administrativas */}
      {!isAdminPage && (
        <ErrorBoundary>
          <WhatsAppButton />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
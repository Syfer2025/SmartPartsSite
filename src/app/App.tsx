import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Products } from './components/Products';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CategoryPage } from './components/CategoryPage';
import { LazySection } from './components/LazySection';

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
const CatalogViewer = lazy(() => import('./components/CatalogViewer'));
const SeedDatabase = lazy(() => import('./components/admin/SeedDatabase'));
const UploadAssets = lazy(() => import('./components/admin/UploadAssets'));
const SearchResults = lazy(() => import('./components/SearchResults'));

import { SEO } from './components/SEO';
import { Toaster } from 'sonner';
import { DataProvider, useData } from './context/DataContext';
import { useAnalytics } from './hooks/useAnalytics';
import { useBannerPreload } from './hooks/useBannerPreload';
import { ErrorBoundary } from './components/ErrorBoundary';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-sm">Carregando...</p>
    </div>
  </div>
);

const SectionSkeleton = () => (
  <div className="py-16 bg-gray-50 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

// --- Wrappers para compatibilidade com os componentes existentes ---
function CategoryPageWrapper({ onNavigate }: { onNavigate: any }) {
  const { slug } = useParams();
  return (
    <>
      <SEO
        title={`${slug} - SMART PARTS IMPORT`}
        description={`Explore nossa linha completa de ${slug} para caminhões e carretas. Produtos de alta qualidade e durabilidade.`}
      />
      <CategoryPage categorySlug={slug || ''} onNavigate={onNavigate} />
    </>
  );
}

function ProductWrapper({ onNavigate }: { onNavigate: any }) {
  const { productId } = useParams();
  return (
    <>
      <SEO
        title="Produto - SMART PARTS IMPORT"
        description="Veja as especificações técnicas completas deste produto premium para caminhões e carretas."
      />
      <Suspense fallback={<PageLoader />}>
        <ProductDetail productId={productId || ''} onNavigate={onNavigate} />
      </Suspense>
    </>
  );
}

function SearchWrapper({ onNavigate }: { onNavigate: any }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  return (
    <>
      <SEO
        title={`Busca: ${query} - SMART PARTS IMPORT`}
        description={`Resultados de busca para "${query}" em peças para caminhões e carretas.`}
      />
      <Suspense fallback={<PageLoader />}>
        <SearchResults query={query} onNavigate={onNavigate} />
      </Suspense>
    </>
  );
}

function AppContent() {
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const headerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const target = (node.firstElementChild as HTMLElement) || node;
      const update = () => setHeaderHeight(target.offsetHeight);
      update();
      const observer = new ResizeObserver(update);
      observer.observe(target);
    }
  }, []);

  const { banners } = useData();
  const firstBannerUrl =
    banners.length > 0 && banners[0].mediaType !== 'video' ? banners[0].imageUrl : undefined;
  useBannerPreload(firstBannerUrl);

  // Controle de analytics e scroll global
  useEffect(() => {
    analytics.trackPageView(location.pathname);
    window.scrollTo({ top: 0, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Função adaptadora para manter compatibilidade com os filhos
  const handleNavigate = (page: string, slug?: string, productId?: string) => {
    window.scrollTo(0, 0);

    if (page === 'category' && slug) {
      navigate(`/categoria/${slug}`);
    } else if (page === 'product' && productId) {
      navigate(`/produto/${productId}`);
    } else if (page === 'search' && slug) {
      navigate(`/busca?q=${encodeURIComponent(slug)}`);
    } else if (page === 'catalogs') {
      navigate('/catalogos');
    } else if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
  };

  const isAdminPage =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/complete-setup') ||
    location.pathname.startsWith('/debug') ||
    location.pathname.startsWith('/docs') ||
    location.pathname.startsWith('/seed') ||
    location.pathname.startsWith('/upload-assets');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col flex-1">
        {!isAdminPage && (
          <>
            <div ref={headerRef}>
              <Header onNavigate={handleNavigate} />
            </div>
            <div style={{ height: headerHeight }} />
          </>
        )}

        <main id="main-content">
          <ErrorBoundary>
            <Routes>
              {/* Home */}
              <Route
                path="/"
                element={
                  <>
                    <SEO
                      title="SMART PARTS IMPORT - Peças Premium para Caminhões e Carretas"
                      description="Importadora especializada em peças premium para caminhões e carretas. Geladeiras portáteis, ar condicionado, sistema de freios, eixos, rodas e mais. Fornecedor B2B exclusivo."
                    />
                    <div>
                      <Hero />
                      <Products onNavigate={handleNavigate} />
                      <LazySection
                        fallback={<SectionSkeleton />}
                        rootMargin="400px"
                        minHeight="600px"
                      >
                        <AboutUs />
                      </LazySection>
                    </div>
                  </>
                }
              />

              {/* Rotas Públicas */}
              <Route
                path="/categoria/:slug"
                element={<CategoryPageWrapper onNavigate={handleNavigate} />}
              />
              <Route
                path="/produto/:productId"
                element={<ProductWrapper onNavigate={handleNavigate} />}
              />
              <Route path="/busca" element={<SearchWrapper onNavigate={handleNavigate} />} />
              <Route
                path="/catalogos"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CatalogViewer onNavigate={handleNavigate} />
                  </Suspense>
                }
              />

              {/* Rotas Administrativas */}
              <Route
                path="/admin"
                element={
                  <>
                    <SEO
                      title="Painel Administrativo - SMART PARTS IMPORT"
                      description="Gerenciamento da loja"
                    />
                    <Suspense fallback={<PageLoader />}>
                      <Admin onNavigate={handleNavigate} />
                    </Suspense>
                  </>
                }
              />
              <Route
                path="/admin-setup"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminSignup />
                  </Suspense>
                }
              />
              <Route
                path="/admin-reset"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminReset />
                  </Suspense>
                }
              />
              <Route
                path="/complete-setup"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CompleteSetup />
                  </Suspense>
                }
              />

              <Route
                path="/debug"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminGuard onNavigate={handleNavigate}>
                      <Debug onNavigate={handleNavigate} />
                    </AdminGuard>
                  </Suspense>
                }
              />
              <Route
                path="/docs"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminGuard onNavigate={handleNavigate}>
                      <SEO
                        title="Documentação da API - SMART PARTS IMPORT"
                        description="Documentação completa da API REST para integração."
                      />
                      <ApiDocs />
                    </AdminGuard>
                  </Suspense>
                }
              />
              <Route
                path="/seed"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminGuard onNavigate={handleNavigate}>
                      <SeedDatabase />
                    </AdminGuard>
                  </Suspense>
                }
              />
              <Route
                path="/upload-assets"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminGuard onNavigate={handleNavigate}>
                      <UploadAssets />
                    </AdminGuard>
                  </Suspense>
                }
              />

              {/* Rota Fallback */}
              <Route
                path="*"
                element={
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Página não encontrada</h1>
                  </div>
                }
              />
            </Routes>
          </ErrorBoundary>
        </main>

        {!isAdminPage && (
          <LazySection fallback={<FooterSkeleton />} rootMargin="300px" minHeight="400px">
            <Footer onNavigate={handleNavigate} />
          </LazySection>
        )}
      </div>

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

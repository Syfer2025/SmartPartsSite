import { Link } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { optimizeSupabaseImage, createImageFallback } from '@/app/utils/imageOptimizer';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (page: string, slug?: string, productId?: string) => void;
}

interface Category {
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

export function CategoryPage({ categorySlug, onNavigate }: CategoryPageProps) {
  const { categories, products: allProducts, loading: dataLoading } = useData();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const analytics = useAnalytics();

  useEffect(() => {
    // Find the category
    const foundCategory = categories.find((c: Category) => c.slug === categorySlug);

    if (foundCategory) {
      setCategory(foundCategory);

      // Filter products for this category
      const categoryProducts = allProducts.filter((p: Product) => p.categorySlug === categorySlug);

      // Ordenar por SKU numérico (crescente)
      categoryProducts.sort((a, b) => {
        const skuA = parseInt(a.sku) || 0;
        const skuB = parseInt(b.sku) || 0;
        return skuA - skuB;
      });

      setProducts(categoryProducts);

      // Track category view
      analytics.trackCategoryView(categorySlug, foundCategory.name);
    } else {
      setCategory(null);
      setProducts([]);
    }
  }, [categorySlug, categories, allProducts]);

  const handleProductClick = (product: Product) => {
    analytics.trackProductView(product.id, product.name);
    onNavigate('product', categorySlug, product.id);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-in">
          <h2 className="text-2xl font-black">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-in">
          <h2 className="text-2xl font-black">Categoria não encontrada</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200 py-8 shadow-sm relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-sm font-medium mb-4">
            <Link to="/" className="text-gray-500 hover:text-red-600 transition">Início</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold">{category.name}</span>
          </nav>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {category.name}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-red-600" />
                <span>
                  <strong className="text-gray-900">{products.length}</strong> produto{products.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link
              to={`/produto/${product.id}`}
              key={product.id || `product-${index}`}
              onClick={() => analytics.trackProductView(product.id, product.name)}
              className="block group outline-none"
              style={{
                opacity: 0,
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
              }}
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2">
                {/* Image container */}
                <div className="relative h-48 mb-4 flex items-center justify-center bg-white rounded-xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center product-img-zoom">
                    <img
                      src={optimizeSupabaseImage(product.image, 400, 80)}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain p-4"
                      loading="lazy"
                      width="300"
                      height="300"
                      onError={createImageFallback(product.image)}
                    />
                  </div>
                </div>

                {/* Product info */}
                <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                  {product.name}
                </h4>

                {/* SKU */}
                {product.sku && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      SKU: {product.sku}
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                  {product.description || 'Produto de alta qualidade importado.'}
                </p>
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>

                {/* Spacer to push button to bottom */}
                <div className="flex-1"></div>

                {/* CTA Button - at bottom */}
                <button 
                  tabIndex={-1}
                  className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Ver Detalhes
                  <TrendingUp className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-16 fade-in">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-black mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">Em breve teremos novidades nesta categoria!</p>
          </div>
        )}
      </div>
    </div>
  );
}

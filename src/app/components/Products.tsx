import { ArrowRight, Package, Users, Handshake, ShoppingBag } from 'lucide-react';
import { useData } from '../context/DataContext';
import { optimizeSupabaseImage, createImageFallback } from '@/app/utils/imageOptimizer';
import { useMemo } from 'react';

interface ProductsProps {
  onNavigate: (page: string, slug?: string, productId?: string) => void;
}

export function Products({ onNavigate }: ProductsProps) {
  const { categories, products, loading, error } = useData();

  // Embaralhar produtos aleatoriamente a cada render
  const randomProducts = useMemo(() => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [products]);

  return (
    <section id="produtos" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full mb-4">
            <Package className="w-4 h-4" />
            <span className="font-semibold text-sm">Catálogo Completo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3 text-gray-900">
            Nossas Categorias de Produtos
          </h2>
          <p className="text-lg text-gray-600">
            Linha completa de peças importadas premium
          </p>
          <div className="h-1 w-24 bg-red-600 mx-auto mt-4 rounded-full" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {loading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse rounded-xl mb-3 shadow-sm" />
                <div className="w-20 h-3 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse rounded" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Erro ao carregar categorias.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-red-600 hover:text-red-700 font-semibold text-sm"
              >
                Tentar novamente
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma categoria cadastrada.</p>
            </div>
          ) : (
            categories.map((category, index) => (
              <div
                key={category.slug || `cat-${index}`}
                onClick={() => onNavigate('category', category.slug)}
                className="cursor-pointer group flex flex-col items-center"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="w-24 h-24 flex items-center justify-center mb-3 bg-white rounded-xl shadow border border-gray-200 group-hover:border-red-500 group-hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl">
                    {category.icon.startsWith('data:image') || category.icon.startsWith('http') ? (
                      <img 
                        src={category.icon} 
                        alt={category.name} 
                        className="w-16 h-16 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      category.icon
                    )}
                  </div>
                </div>
                <h3 className="text-xs font-bold text-center text-gray-800 group-hover:text-red-600 transition-colors max-w-[90px]">
                  {category.name}
                </h3>
              </div>
            ))
          )}
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-4">
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold text-sm">Produtos em Destaque</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              Confira Nossos Produtos Premium
            </h3>
            <p className="text-gray-600">Qualidade garantida e suporte completo</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Erro ao carregar produtos.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {randomProducts.map((product, index) => (
                <div
                  key={product.id || `prod-${index}`}
                  onClick={() => onNavigate('product', product.categorySlug, product.id)}
                  className="cursor-pointer group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg will-change-auto flex flex-col"
                  style={{ transition: 'box-shadow 0.2s ease-in-out' }}
                >
                  <div className="h-40 mb-3 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                    <img
                      src={optimizeSupabaseImage(product.image, 300, 85)}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain p-2"
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      fetchpriority={index === 0 ? "high" : undefined}
                      width="252"
                      height="252"
                      onError={createImageFallback(product.image)}
                    />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                    {product.name}
                  </h4>
                  
                  {/* SKU */}
                  {product.sku && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        SKU: {product.sku}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {product.description || 'Produto de alta qualidade importado.'}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                  
                  {/* Spacer to push button to bottom */}
                  <div className="flex-1"></div>
                  
                  <button className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all lg:shadow-lg lg:shadow-red-500/30">
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-black to-gray-900 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-white">
            {[
              { icon: Package, number: '12+', label: 'Categorias', desc: '100% produtos importados' },
              { icon: Users, number: 'B2B', label: 'Exclusivo', desc: 'Vendas para revendedores' },
              { icon: Handshake, number: 'Premium', label: 'Suporte', desc: 'Assessoria técnica' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="w-12 h-12 mx-auto bg-red-600 rounded-lg flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-red-500">{stat.number}</div>
                <div className="text-lg font-semibold">{stat.label}</div>
                <div className="text-gray-400 text-sm">{stat.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white font-semibold">
              🎯 <span className="text-yellow-400">Fornecedores Oficiais</span> para Revendedores
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Produtos de alta qualidade com suporte completo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
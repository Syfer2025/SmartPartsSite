import { useState, useMemo } from 'react';
import { Search, Package, SlidersHorizontal, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { smartSearch } from '../utils/searchEngine';
import { optimizeWithPreset } from '../utils/imageOptimizer';

interface SearchResultsProps {
  query: string;
  onNavigate: (page: string, slug?: string, productId?: string) => void;
}

export default function SearchResults({ query, onNavigate }: SearchResultsProps) {
  const { products, categories } = useData();
  const [filterCategory, setFilterCategory] = useState('');

  // Executar busca avançada
  const allResults = useMemo(() => {
    if (!query || query.trim().length === 0) return [];
    return smartSearch(products, query, 100);
  }, [products, query]);

  // Aplicar filtro de categoria
  const results = useMemo(() => {
    if (!filterCategory) return allResults;
    return allResults.filter(r => r.product.categorySlug === filterCategory);
  }, [allResults, filterCategory]);

  // Categorias que aparecem nos resultados (para filtro dinâmico)
  const resultCategories = useMemo(() => {
    const catMap = new Map<string, { slug: string; name: string; count: number }>();
    for (const r of allResults) {
      const slug = r.product.categorySlug;
      const existing = catMap.get(slug);
      if (existing) {
        existing.count++;
      } else {
        catMap.set(slug, { slug, name: r.product.category, count: 1 });
      }
    }
    return Array.from(catMap.values()).sort((a, b) => b.count - a.count);
  }, [allResults]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Stats bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-gray-600">
            {allResults.length === 0
              ? <>Nenhum resultado encontrado para <span className="font-bold text-gray-900">"{query}"</span></>
              : <>
                  <span className="font-bold text-gray-900">{results.length}</span>
                  {filterCategory && ` de ${allResults.length}`} resultado{results.length !== 1 ? 's' : ''} para{' '}
                  <span className="font-bold text-gray-900">"{query}"</span>
                </>
            }
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-6">
        {allResults.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filtros */}
            {resultCategories.length > 1 && (
              <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    <h3 className="font-bold text-gray-800 text-sm">Filtrar por Categoria</h3>
                  </div>

                  <button
                    onClick={() => setFilterCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition mb-1 ${
                      !filterCategory
                        ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Todas ({allResults.length})
                  </button>

                  {resultCategories.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => setFilterCategory(cat.slug === filterCategory ? '' : cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition mb-1 ${
                        filterCategory === cat.slug
                          ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  ))}
                </div>
              </aside>
            )}

            {/* Grid de resultados */}
            <div className="flex-1">
              {/* Filtro ativo */}
              {filterCategory && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">Filtrando por:</span>
                  <button
                    onClick={() => setFilterCategory('')}
                    className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-red-200 transition"
                  >
                    {resultCategories.find(c => c.slug === filterCategory)?.name}
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((result, index) => {
                  const product = result.product;
                  return (
                    <button
                      key={product.id}
                      onClick={() => onNavigate('product', product.categorySlug, product.id)}
                      className="bg-white rounded-2xl border border-gray-200 hover:border-red-300 hover:shadow-xl shadow-sm transition-all duration-300 text-left group overflow-hidden"
                    >
                      {/* Imagem — qualidade alta */}
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <img
                          src={optimizeWithPreset(product.image, 'card')}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          loading={index < 6 ? 'eager' : 'lazy'}
                        />
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2 text-sm mb-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            {product.category}
                          </span>
                          {product.sku && (
                            <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sem resultados com filtro */}
              {results.length === 0 && filterCategory && (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Nenhum resultado nesta categoria</p>
                  <button
                    onClick={() => setFilterCategory('')}
                    className="mt-3 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Limpar filtro
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Estado vazio */
          <div className="text-center py-20 max-w-lg mx-auto">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-3">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-500 mb-6">
              Nao encontramos resultados para <span className="font-bold text-gray-700">"{query}"</span>.
              Tente termos diferentes ou navegue pelas categorias.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 text-left">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Dicas de busca:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">-</span>
                  Verifique a ortografia ou tente sinônimos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">-</span>
                  Busque por codigo SKU do produto
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">-</span>
                  Use termos mais gerais (ex: "geladeira" em vez de "geladeira portatil 12v compacta")
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">-</span>
                  Busque por categoria (ex: "freios", "rodas", "eixos")
                </li>
              </ul>
            </div>

            {/* Categorias para navegar */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-700 text-sm mb-4">Ou navegue por categorias:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => onNavigate('category', cat.slug)}
                    className="bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-red-600 transition"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import {
  Search,
  ChevronDown,
  Phone,
  Menu,
  X,
  Package,
  Snowflake,
  Wind,
  Disc,
  Settings,
  Circle,
  Wrench,
  CircleDot,
  Box,
  Zap,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import logo from 'figma:asset/93a318fedff287cf8ae9966775cd849f3e3199e4.png';
import { useData } from '../context/DataContext';
import {
  optimizeWithPreset,
  createImageFallback,
  optimizeSupabaseImage,
} from '@/app/utils/imageOptimizer';
import { quickSearch } from '../utils/searchEngine';

interface HeaderProps {
  onNavigate: (page: string, slug?: string, productId?: string) => void;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

// Mapeamento de ícones padrão para categorias antigas (fallback)
const categoryIcons: { [key: string]: any } = {
  'geladeiras-portateis': Snowflake,
  'ar-condicionado': Wind,
  'catracas-freio': Disc,
  'patim-freio': Settings,
  cuicas: Circle,
  eixos: Wrench,
  'rodas-ferro': CircleDot,
  'rodas-aluminio': CircleDot,
  rolamentos: Circle,
  'cinta-catraca': Package,
  'pe-carreta': Box,
  'mola-cuica': Settings,
  'gerador-energia': Zap,
};

// Optimize logo: original is 684x162 PNG (22.5 KiB), displayed at max 48px height
// wsrv.nl serves it as WebP at correct size (~2 KiB)
const optimizedLogo = optimizeSupabaseImage(logo, 240, 90);

export function Header({ onNavigate }: HeaderProps) {
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bloquear scroll da página quando o menu mobile está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Atalho de Teclado (Ctrl+K / Cmd+K) para focar na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('desktop-search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          // Fallback para mobile se o desktop não estiver visível
          const mobileInputs = document.querySelectorAll('input[placeholder*="Buscar"]');
          if (mobileInputs.length > 0) {
            (mobileInputs[0] as HTMLElement).focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // OTIMIZAÇÃO: Usar DataContext em vez de fazer fetch separado
  // Isso elimina a chamada duplicada de categorias (economiza 5.899 KiB!)
  const { categories, products: allProducts, loading } = useData();

  const phones = [
    { label: 'Maringá', number: '(44) 99726-0058', whatsapp: '+5544997260058' },
    { label: 'Várzea Grande', number: '(65) 99329-1135', whatsapp: '+5565993291135' },
  ];

  const debouncedQuery = useDebounce(searchQuery, 300);

  const allProductsRef = useRef(allProducts);
  allProductsRef.current = allProducts;

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const results = quickSearch(allProductsRef.current, debouncedQuery);
      setSearchResults(results.map((r) => r.product));
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSearchSubmit = useCallback((e: React.KeyboardEvent | React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      onNavigate('search', searchQuery.trim());
      setShowSearch(false);
      setSearchResults([]);
      setMobileMenuOpen(false);
    }
  }, [searchQuery, onNavigate]);

  const handleWhatsAppCall = useCallback((phone: string) => {
    const message = 'Olá! Vim do site e gostaria de mais informações.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }, []);

  const isSearchVisible = showSearch && searchQuery.length > 0;

  return (
    <header className="bg-black/80 backdrop-blur-lg text-white shadow-2xl fixed top-0 left-0 right-0 z-50 border-b border-white/10 header-entrance transition-colors duration-300">
      {/* Top Bar with Phones */}
      <div className="bg-red-600/95 backdrop-blur-md relative overflow-hidden">
        {/* Gradiente nas pontas — só desktop */}
        <div className="hidden md:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-red-800/80 to-transparent pointer-events-none z-10" />
        <div className="hidden md:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-red-800/80 to-transparent pointer-events-none z-10" />
        <div className="container mx-auto px-4 md:px-6 py-px relative z-20">
          <div className="flex flex-row items-center justify-center gap-6 md:gap-8 text-[11px] font-semibold tracking-wide">
            {phones.map((phone, phoneIndex) => (
              <button
                key={phone.whatsapp}
                onClick={() => handleWhatsAppCall(phone.whatsapp)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity whitespace-nowrap md:border md:border-white/25 md:rounded-full md:px-3 md:py-0.5 md:bg-white/5 md:hover:bg-white/10 md:backdrop-blur-sm py-0.5"
              >
                <div className={phoneIndex === 0 ? 'phone-wiggle' : 'phone-wiggle-delay'}>
                  <Phone className="w-3 h-3 flex-shrink-0" />
                </div>
                <span className="opacity-80 hidden sm:inline">{phone.label}:</span>
                <span>{phone.number}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* Mobile Header - Logo left, Menu right */}
        <div className="flex lg:hidden items-center justify-between mb-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition header-logo-hover"
          >
            <img
              src={optimizedLogo}
              alt="Smart Parts Import"
              className="h-8 w-auto object-contain"
              fetchpriority="high"
              width="684"
              height="162"
            />
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-xl transition-colors backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mb-4 px-2">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              placeholder="Buscar por nome, SKU..."
              className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 backdrop-blur-md border border-white/10 focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] text-white px-4 py-2.5 pl-10 pr-10 rounded-xl transition-all duration-300 outline-none placeholder-gray-400 text-sm font-medium"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearch(false);
                }}
                className="search-clear-btn search-clear-pop right-3 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Search Results — CSS transition */}
          <div
            className={`absolute left-4 right-4 mt-2 bg-white text-black rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto z-50 border-2 border-gray-200 search-dropdown ${
              isSearchVisible ? 'visible' : ''
            }`}
          >
            {searchResults.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 text-xs font-bold">
                  {searchResults.length}{' '}
                  {searchResults.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </div>
                {searchResults.map((product, index) => (
                  <button
                    key={product.id || `search-mobile-${index}`}
                    onClick={() => {
                      onNavigate('product', product.categorySlug, product.id);
                      setShowSearch(false);
                      setSearchQuery('');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 hover:bg-red-50 transition text-left group search-result-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={optimizeWithPreset(product.image, 'thumbnail')}
                        alt={product.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs mb-0.5 group-hover:text-red-600 transition line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-gray-600 mb-1 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded">
                          {product.category}
                        </span>
                        {product.sku && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : isSearchVisible ? (
              <div className="p-6 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">Nenhum produto encontrado</p>
                <p className="text-xs text-gray-500 mt-1">Tente pesquisar por outro termo</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Desktop Header - Original Layout */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition flex-shrink-0 header-logo-hover"
          >
            <img
              src={optimizedLogo}
              alt="Smart Parts Import"
              className="h-12 w-auto object-contain"
              fetchpriority="high"
            />
          </button>

          {/* Search Bar */}
          <div className="w-full lg:flex-1 lg:max-w-2xl relative order-3 lg:order-2">
            <form onSubmit={handleSearchSubmit} className="relative search-bar-entrance group">
              <input
                id="desktop-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Buscar produtos por nome, SKU, categoria..."
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 backdrop-blur-md border border-white/10 focus:border-red-500 focus:shadow-[0_0_20px_rgba(220,38,38,0.3)] text-white px-5 py-3 pl-12 pr-16 rounded-xl transition-all duration-300 outline-none placeholder-gray-400 font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" />
              
              {!searchQuery && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 pointer-events-none opacity-60 group-focus-within:opacity-0 transition-opacity">
                  <kbd className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold text-white shadow-sm">⌘K</kbd>
                </div>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearch(false);
                  }}
                  className="search-clear-btn search-clear-pop right-4 p-1.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Desktop Search Results — CSS transition */}
            <div
              className={`absolute top-full left-0 right-0 mt-2 bg-white text-black rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto z-50 border-2 border-gray-200 search-dropdown ${
                isSearchVisible ? 'visible' : ''
              }`}
            >
              {searchResults.length > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Resultados da Busca</p>
                      <p className="text-xs text-red-100">
                        {searchResults.length}{' '}
                        {searchResults.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                      </p>
                    </div>
                    <Search className="w-5 h-5 opacity-50" />
                  </div>
                  {searchResults.map((product, index) => (
                    <button
                      key={product.id || `search-desktop-${index}`}
                      onClick={() => {
                        onNavigate('product', product.categorySlug, product.id);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 transition text-left group search-result-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 group-hover:border-red-300 transition flex-shrink-0 shadow-sm">
                        <img
                          src={optimizeWithPreset(product.image, 'thumbnail')}
                          alt={product.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-base mb-1 group-hover:text-red-600 transition line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 group-hover:bg-red-100 px-2 py-1 rounded font-medium transition">
                            {product.category}
                          </span>
                          {product.sku && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-red-600 rotate-[-90deg] transition" />
                    </button>
                  ))}
                  {/* CTA — Ver todos os resultados */}
                  {searchResults.length > 0 && (
                    <button
                      onClick={() => {
                        onNavigate('search', searchQuery.trim());
                        setShowSearch(false);
                        setSearchResults([]);
                      }}
                      className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-red-50 hover:to-red-100 px-6 py-4 border-t border-gray-200 transition text-left"
                    >
                      <p className="text-sm font-semibold text-gray-700">
                        Pressione{' '}
                        <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">
                          Enter
                        </kbd>{' '}
                        ou clique para ver todos os resultados
                      </p>
                      <p className="text-xs text-gray-500">
                        Busca avançada com correspondência inteligente
                      </p>
                    </button>
                  )}
                </>
              ) : isSearchVisible ? (
                <div className="p-8 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-base font-bold text-gray-700 mb-1">
                    Nenhum produto encontrado
                  </p>
                  <p className="text-sm text-gray-500">Tente pesquisar usando outros termos</p>
                  <div className="mt-4 text-xs text-gray-400">
                    <p>Dicas: busque por nome, categoria ou descrição</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 md:gap-4 flex-shrink-0 order-2 lg:order-3">
            <button
              onClick={() => onNavigate('catalogs')}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Acessar Catálogo
            </button>

            <div
              className="relative hidden md:block"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => {
                setShowCategories(false);
              }}
            >
              <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.5)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                <Package className="w-4 h-4" />
                <span>Categorias</span>
                <div className={`chevron-rotate ${showCategories ? 'open' : ''}`}>
                  <ChevronDown className="w-4 h-4 opacity-80" />
                </div>
              </button>

              {/* Modern Mega Menu Dropdown — CSS transition */}
              <div
                className={`absolute top-full right-0 pt-4 w-[900px] mega-menu ${
                  showCategories ? 'visible' : ''
                }`}
              >
                <div className="bg-gradient-to-br from-white to-gray-50 text-black shadow-2xl rounded-2xl overflow-hidden border-2 border-gray-200">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="icon-spin">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black">Nossas Categorias</h3>
                        <p className="text-xs text-red-100">
                          Peças premium para caminhões e carretas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-4 gap-3 p-4">
                    {categories.map((category, index) => {
                      const Icon = categoryIcons[category.slug] || Package;
                      const productCount = allProducts.filter(
                        (p) => p.categorySlug === category.slug
                      ).length;

                      return (
                        <button
                          key={`category-${category.id || index}-${index}`}
                          onClick={() => {
                            onNavigate('category', category.slug);
                            setShowCategories(false);
                          }}
                          className="p-4 rounded-xl transition-all duration-300 text-left relative overflow-hidden bg-white border-2 border-gray-200 hover:bg-red-50 hover:border-red-500 hover:shadow-xl shadow-sm group mega-menu-card"
                          style={{ animationDelay: `${index * 0.02}s` }}
                        >
                          {/* Icon and Title Row */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 overflow-hidden bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-red-600 group-hover:to-red-700 group-hover:shadow-lg">
                              {category.icon ? (
                                <img
                                  src={category.icon}
                                  alt={category.name}
                                  className="w-6 h-6 object-contain transition-all duration-300"
                                />
                              ) : (
                                <Icon className="w-5 h-5 transition-colors duration-300 text-gray-700 group-hover:text-white" />
                              )}
                            </div>

                            {/* Title - Limited to 2 lines */}
                            <h4 className="flex-1 font-bold text-sm leading-tight transition-colors duration-300 line-clamp-2 text-gray-900 group-hover:text-red-600">
                              {category.name}
                            </h4>
                          </div>

                          {/* Product Count */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium transition-colors duration-300 text-gray-500 group-hover:text-red-700">
                              {productCount} {productCount === 1 ? 'produto' : 'produtos'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-red-600 rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer with CTA */}
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-t border-gray-200 mega-menu-cta">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Explore todas as nossas categorias acima
                      </p>
                      <p className="text-xs text-gray-500">
                        Peças premium para caminhões e carretas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Click outside to close search — z-[45] fica entre o conteúdo e o header */}
      {isSearchVisible && (
        <div
          className="fixed inset-0 z-[45]"
          onClick={() => {
            setShowSearch(false);
            setSearchResults([]);
          }}
        />
      )}

      {/* Mobile Menu Sidebar — CSS transitions (always rendered, toggled via class) */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 bg-black/80 z-50 lg:hidden sidebar-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          width: '100vw',
        }}
      />

      {/* Sidebar - Desliza da Esquerda */}
      <div
        className={`fixed top-0 left-0 w-[280px] bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white shadow-2xl z-50 lg:hidden flex flex-col sidebar-panel ${mobileMenuOpen ? 'open' : ''}`}
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0, height: '100vh' }}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Header do Menu */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">Menu</h3>
              <p className="text-xs text-red-100">Smart Parts Import</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Botão Acessar Catálogo */}
          <button
            onClick={() => {
              onNavigate('catalogs');
              setMobileMenuOpen(false);
            }}
            className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg flex items-center gap-3 font-bold transition text-left"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xs">📄</span>
            </div>
            <span className="text-sm">Acessar Catálogo</span>
          </button>

          {/* Divisor */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="font-black text-xs text-gray-400 mb-3 px-2">CATEGORIAS</h4>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = categoryIcons[category.slug] || Package;
                return (
                  <button
                    key={category.id || category.slug}
                    onClick={() => {
                      onNavigate('category', category.slug);
                      setMobileMenuOpen(false);
                    }}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    className="w-full bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg flex items-center gap-3 transition group text-left"
                  >
                    <div className="w-8 h-8 bg-gray-700 group-hover:bg-red-600 rounded-lg flex items-center justify-center transition flex-shrink-0 overflow-hidden">
                      {category.icon ? (
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer do Menu */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0 bg-black/50">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">Entre em contato</p>
            <div className="flex gap-2">
              {phones.map((phone) => (
                <a
                  key={phone.whatsapp}
                  href={`https://wa.me/${phone.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  className="flex-1 bg-green-600 hover:bg-green-700 p-2 rounded-lg transition text-center"
                >
                  <Phone className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-[10px] font-bold">{phone.label}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

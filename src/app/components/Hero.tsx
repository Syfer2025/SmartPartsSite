import { ChevronLeft, ChevronRight, Star, Package, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback, memo } from 'react';
import { optimizeSupabaseImage, getSupabaseImageSrcSet } from '@/app/utils/imageOptimizer';
import { useData } from '../context/DataContext';

// Feature cards data - static, defined outside component to avoid re-creation
const featureCards = [
  { icon: Package, title: '12+ Categorias', desc: 'Amplo portfólio 100% importado' },
  { icon: Users, title: 'Vendas B2B', desc: 'Fornecedor exclusivo para revendedores' },
  { icon: TrendingUp, title: 'Suporte Completo', desc: 'Assessoria técnica e comercial' },
] as const;

const FeatureCards = memo(function FeatureCards() {
  return (
    <div className="bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((item, index) => (
            <div key={index} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const Hero = memo(function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners, bannersLoading } = useData();

  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % banners.length), [banners.length]);
  const prevSlide = useCallback(() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length), [banners.length]);

  // Auto-advance slides
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [banners.length, nextSlide]);

  // Se estiver carregando ou não tiver banners, mostra skeleton mínimo
  if (bannersLoading && banners.length === 0) {
    return (
      <section className="relative bg-black -mt-[104px] pt-[104px]">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-black flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
        </div>
        <FeatureCards />
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative bg-black -mt-[104px] pt-[104px]">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-black flex items-center justify-center">
          <div className="text-white text-lg">Carregando...</div>
        </div>
        <FeatureCards />
      </section>
    );
  }

  return (
    <section className="relative bg-black -mt-[104px] pt-[104px]">
      {/* Simple Carousel */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background */}
            {banner.mediaType === 'video' && banner.videoUrl ? (
              <video
                src={banner.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={optimizeSupabaseImage(banner.imageUrl, 1920, 80)}
                  srcSet={getSupabaseImageSrcSet(banner.imageUrl)}
                  sizes="100vw"
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  // LCP Optimization: Load first image eagerly and with high priority
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : "auto"}
                  width="1920"
                  height="1080"
                  decoding={index === 0 ? "sync" : "async"}
                />
                <div className="absolute inset-0 bg-black/60"></div>
              </div>
            )}

            {/* Content - Only for images */}
            {!(banner.mediaType === 'video' && banner.videoUrl) && (
              <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                <div className="max-w-3xl">
                  <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full mb-4">
                    <span className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4" fill="currentColor" />
                      Destaque
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-4 text-white drop-shadow-lg">
                    {banner.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-6 text-gray-200 drop-shadow-md">
                    {banner.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg shadow-red-600/30">
                      Solicitar Orçamento
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-red-600/80 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-red-600/80 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-red-600 w-8' : 'bg-white/50 w-2'
                }`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <FeatureCards />
    </section>
  );
});

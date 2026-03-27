import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Check, Shield, Truck, Package, Loader2, Download, Share2, FileArchive, Files, Copy } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useAnalytics } from '../hooks/useAnalytics';
import { useIsMobile } from '../hooks/useIsMobile';
import { useData } from '../context/DataContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { createImageFallback } from '@/app/utils/imageOptimizer';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string, slug?: string) => void;
}

interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  image: string;
  images?: string[]; // Imagens adicionais (até 10)
  sku: string;
  verified?: boolean;
  specifications: string;
  features: string[];
  applications: string;
  warranty: string;
}

export function ProductDetail({ productId, onNavigate }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  
  // Estados para o zoom direto na imagem
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMode, setDownloadMode] = useState<'zip' | 'individual'>('zip');
  const [isSharing, setIsSharing] = useState(false);
  const isMobile = useIsMobile();

  // Cache de blobs em memória para evitar re-download
  const blobCacheRef = useRef<Map<string, Blob>>(new Map());

  // OTIMIZAÇÃO: Usar DataContext para exibir produto instantaneamente
  const { products: cachedProducts } = useData();

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    // 1) Tenta encontrar o produto no cache do DataContext (instantâneo)
    const cachedProduct = cachedProducts.find(p => p.id === productId);
    if (cachedProduct && !product) {
      // Mostra imediatamente com dados básicos do cache
      setProduct({
        id: cachedProduct.id,
        name: cachedProduct.name,
        category: cachedProduct.category,
        categorySlug: cachedProduct.categorySlug,
        description: cachedProduct.description,
        image: cachedProduct.image,
        sku: cachedProduct.sku || '',
        specifications: '',
        features: [],
        applications: '',
        warranty: '',
      });
      setLoading(false);
    }

    // 2) Busca detalhes completos da API em background
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });

        const data = await response.json();

        if (data.product) {
          setProduct(data.product);
          setDetailsLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, cachedProducts]);

  // Criar array seguro de imagens
  const images = product ? [
    product.image,
    ...(product.images && Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean) : [];

  // Thumbnails visíveis por vez com LOOP INFINITO
  const VISIBLE_THUMBNAILS = 5;
  const visibleThumbnails = images.slice(thumbnailStartIndex, thumbnailStartIndex + VISIBLE_THUMBNAILS);

  const scrollThumbnailsLeft = () => {
    // Loop infinito: se estiver no início, volta para o final
    if (thumbnailStartIndex === 0) {
      setThumbnailStartIndex(Math.max(0, images.length - VISIBLE_THUMBNAILS));
    } else {
      setThumbnailStartIndex(thumbnailStartIndex - 1);
    }
  };

  const scrollThumbnailsRight = () => {
    // Loop infinito: se chegar ao final, volta para o início
    if (thumbnailStartIndex + VISIBLE_THUMBNAILS >= images.length) {
      setThumbnailStartIndex(0);
    } else {
      setThumbnailStartIndex(thumbnailStartIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-black">Carregando...</h2>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-black">Produto não encontrado</h2>
        </motion.div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsApp = () => {
    const message = `Olá! Gostaria de mais informações sobre:\n\n*${product.name}*\nSKU: ${product.sku}\n\nAguardo retorno!`;
    const phone = '+5544997260058'; // WhatsApp: 44 99726-0058
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Função para lidar com o movimento do mouse sobre a imagem (zoom)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Só funciona em desktop (não mobile)
    if (isMobile) return;
    
    // Só funciona para imagens, não vídeos
    if (images[currentImageIndex]?.includes('.mp4')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomOrigin({ x, y });
  };

  const handleMouseEnter = () => {
    // Só funciona em desktop (não mobile)
    if (isMobile) return;
    
    // Só ativa zoom para imagens, não vídeos
    if (!images[currentImageIndex]?.includes('.mp4')) {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    // Só funciona em desktop (não mobile)
    if (isMobile) return;
    
    setIsZoomed(false);
  };

  /**
   * Helper: busca uma imagem via proxy wsrv.nl (CORS-safe) com fallback direto.
   * Retorna o blob ou null se falhar.
   */
  const fetchImageBlob = async (url: string): Promise<Blob | null> => {
    const cache = blobCacheRef.current;
    if (cache.has(url)) {
      return cache.get(url)!;
    }

    try {
      const proxyUrl = url.includes('wsrv.nl')
        ? url
        : `https://wsrv.nl/?url=${encodeURIComponent(url.split('?')[0])}&q=100`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      cache.set(url, blob);
      return blob;
    } catch {
      // Fallback: tenta download direto sem proxy
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        cache.set(url, blob);
        return blob;
      } catch {
        return null;
      }
    }
  };

  /**
   * Download individual: baixa apenas a foto atualmente exibida.
   */
  const handleDownloadSingleImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const url = images[currentImageIndex];
    if (!url || url.includes('.mp4')) {
      toast.error('Esta mídia não pode ser baixada como foto.');
      return;
    }

    const toastId = toast.loading('Baixando foto...');

    try {
      const blob = await fetchImageBlob(url);
      if (!blob) throw new Error('Falha ao baixar');

      const urlPath = url.split('?')[0];
      const ext = urlPath.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i)?.[1] || 'jpg';
      const fileName = `${product.sku}-foto-${String(currentImageIndex + 1).padStart(2, '0')}.${ext}`;

      saveAs(blob, fileName);
      toast.success('Foto baixada!', { id: toastId, description: fileName });
    } catch {
      toast.error('Falha ao baixar foto', { id: toastId, description: 'Tente novamente.' });
    }
  };

  /**
   * Gera o conteúdo do info.txt com dados completos do produto.
   */
  const generateInfoTxt = (): string => {
    const lines: string[] = [
      '═══════════════════════════════════════════════════════',
      '  SMART PARTS IMPORT - Informações do Produto',
      '═══════════════════════════════════════════════════════',
      '',
      `Produto: ${product.name}`,
      `SKU: ${product.sku}`,
      `Categoria: ${product.category}`,
      '',
      '───────────────────────────────────────────────────────',
      '  Descrição',
      '───────────────────────────────────────────────────────',
      product.description || 'Sem descrição disponível.',
      '',
    ];

    // Características
    if (product.features && Array.isArray(product.features) && product.features.length > 0) {
      lines.push('───────────────────────────────────────────────────────');
      lines.push('  Características');
      lines.push('───────────────────────────────────────────────────────');
      product.features.forEach((feat, i) => {
        lines.push(`  ${i + 1}. ${feat}`);
      });
      lines.push('');
    }

    // Especificações Técnicas
    if (product.specifications) {
      const specs = Array.isArray(product.specifications)
        ? product.specifications
        : Object.entries(product.specifications).map(([key, value]) => ({ key, value: value as string }));

      if (specs.length > 0) {
        lines.push('───────────────────────────────────────────────────────');
        lines.push('  Especificações Técnicas');
        lines.push('───────────────────────────────────────────────────────');
        const maxKeyLen = Math.max(...specs.map(s => (s.key || '').length), 10);
        specs.forEach(spec => {
          const paddedKey = (spec.key || '').padEnd(maxKeyLen);
          lines.push(`  ${paddedKey}  │  ${spec.value || ''}`);
        });
        lines.push('');
      }
    }

    // Aplicações
    if (product.applications) {
      lines.push('───────────────────────────────────────────────────────');
      lines.push('  Aplicações');
      lines.push('──────────────────────────────────────────────────────');
      lines.push(product.applications);
      lines.push('');
    }

    // Garantia
    if (product.warranty) {
      lines.push('───────────────────────────────────────────────────────');
      lines.push('  Garantia');
      lines.push('───────────────────────────────────────────────────────');
      lines.push(product.warranty);
      lines.push('');
    }

    // Fotos
    const photoUrls = images.filter(u => !u.includes('.mp4'));
    lines.push('───────────────────────────────────────────────────────');
    lines.push(`  Fotos (${photoUrls.length} arquivo${photoUrls.length > 1 ? 's' : ''})`);
    lines.push('───────────────────────────────────────────────────────');
    photoUrls.forEach((url, i) => {
      lines.push(`  foto-${String(i + 1).padStart(2, '0')}: ${url.split('?')[0]}`);
    });
    lines.push('');

    lines.push('══════════════════════════════════════════════════════');
    lines.push(`  Gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    lines.push('  SMART PARTS IMPORT - smartpartsimport.com.br');
    lines.push('  WhatsApp: (44) 99726-0058');
    lines.push('═══════════════════════════════════════════════════════');

    return lines.join('\n');
  };

  /**
   * Download ZIP com TODAS as fotos + info.txt.
   * Usa Promise.all com batches de 4 para download paralelo.
   */
  const handleDownloadImages = async () => {
    if (isDownloading) return;
    
    const photoUrls = images.filter(url => !url.includes('.mp4'));
    
    if (photoUrls.length === 0) {
      toast.error('Nenhuma foto disponível para download.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      
      const sanitizedName = product.name.replace(/[<>:"/\\|?*]/g, '-').trim();
      const folderName = `${product.sku} - ${sanitizedName}`;
      const folder = zip.folder(folderName)!;

      // Adicionar info.txt com dados do produto
      folder.file('info.txt', generateInfoTxt());

      // Preparar tarefas de download
      let completed = 0;
      const BATCH_SIZE = 4; // Downloads paralelos simultâneos

      // Processar em batches para não sobrecarregar o browser
      for (let batchStart = 0; batchStart < photoUrls.length; batchStart += BATCH_SIZE) {
        const batch = photoUrls.slice(batchStart, batchStart + BATCH_SIZE);
        
        const results = await Promise.allSettled(
          batch.map(async (url, batchIndex) => {
            const i = batchStart + batchIndex;
            const urlPath = url.split('?')[0];
            const ext = urlPath.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i)?.[1] || 'jpg';
            const fileName = `foto-${String(i + 1).padStart(2, '0')}-${product.sku}.${ext}`;

            const blob = await fetchImageBlob(url);
            if (!blob) throw new Error(`Falha na foto ${i + 1}`);

            folder.file(fileName, blob);
            return { index: i, fileName };
          })
        );

        // Atualizar progresso após cada batch
        results.forEach((result, batchIndex) => {
          completed++;
          if (result.status === 'rejected') {
            const i = batchStart + batchIndex;
            toast.error(`Falha ao baixar foto ${i + 1}`, {
              description: 'A imagem será ignorada no ZIP.',
            });
          }
        });

        setDownloadProgress((completed / photoUrls.length) * 100);
      }

      // Gera o ZIP
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      saveAs(content, `${folderName}.zip`);

      const successCount = photoUrls.length;
      toast.success('Download concluído!', {
        description: `${successCount} foto${successCount > 1 ? 's' : ''} + info.txt baixados com sucesso.`,
      });
    } catch (error) {
      toast.error('Erro ao preparar download', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  /**
   * Download individual de TODAS as fotos (uma por uma, sem ZIP).
   * Cada foto é salva separadamente com nome organizado.
   */
  const handleDownloadIndividual = async () => {
    if (isDownloading) return;

    const photoUrls = images.filter(url => !url.includes('.mp4'));

    if (photoUrls.length === 0) {
      toast.error('Nenhuma foto disponível para download.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    const BATCH_SIZE = 2; // Menos paralelo para não abrir muitos diálogos de save
    let completed = 0;

    try {
      for (let batchStart = 0; batchStart < photoUrls.length; batchStart += BATCH_SIZE) {
        const batch = photoUrls.slice(batchStart, batchStart + BATCH_SIZE);

        await Promise.allSettled(
          batch.map(async (url, batchIndex) => {
            const i = batchStart + batchIndex;
            const urlPath = url.split('?')[0];
            const ext = urlPath.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i)?.[1] || 'jpg';
            const fileName = `${product.sku}-foto-${String(i + 1).padStart(2, '0')}.${ext}`;

            const blob = await fetchImageBlob(url);
            if (!blob) throw new Error(`Falha na foto ${i + 1}`);

            saveAs(blob, fileName);
          })
        );

        completed += batch.length;
        setDownloadProgress((completed / photoUrls.length) * 100);

        // Pequeno delay entre batches para evitar bloqueio do browser
        if (batchStart + BATCH_SIZE < photoUrls.length) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      toast.success('Download concluído!', {
        description: `${photoUrls.length} foto${photoUrls.length > 1 ? 's' : ''} salva${photoUrls.length > 1 ? 's' : ''} individualmente.`,
      });
    } catch {
      toast.error('Erro durante o download', {
        description: 'Algumas fotos podem não ter sido baixadas.',
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  /**
   * Gera a mensagem formatada para compartilhar o produto.
   * Usa a URL limpa do site (importadorasmart.com.br/produto/ID) em vez de
   * URLs cruas do Supabase. O cliente clica e vê fotos, specs, download — tudo.
   */
  const buildShareMessage = (photoUrls: string[]): string => {
    // URL limpa da página do produto no domínio de produção
    const SITE_DOMAIN = 'https://importadorasmart.com.br';
    const productPageUrl = `${SITE_DOMAIN}/produto/${product.id}`;
    const totalFotos = photoUrls.length;

    return [
      `*${product.name}*`,
      `SKU: ${product.sku}`,
      `Categoria: ${product.category}`,
      '',
      product.description || '',
      '',
      `📸 *${totalFotos} foto${totalFotos > 1 ? 's' : ''} disponíve${totalFotos > 1 ? 'is' : 'l'}*`,
      '',
      `👉 *Veja o produto completo:*`,
      productPageUrl,
      '',
      `_Na página do produto você pode ver todas as fotos, especificações técnicas e fazer download._`,
      '',
      `_Smart Parts Import_`,
    ].join('\n');
  };

  /**
   * Compartilhar fotos via WhatsApp.
   * - Mobile: usa Web Share API (navigator.share) para o usuário escolher o contato/app.
   * - Desktop/fallback: abre WhatsApp Web SEM número fixo — o usuário escolhe o contato.
   */
  const handleShareWhatsApp = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const photoUrls = images.filter(url => !url.includes('.mp4'));

    if (photoUrls.length === 0) {
      toast.error('Nenhuma foto disponível para compartilhar.');
      setIsSharing(false);
      return;
    }

    // Tentar Web Share API (funciona em mobile — abre seletor de app/contato)
    if (navigator.share && navigator.canShare) {
      const toastId = toast.loading('Preparando fotos para compartilhar...');

      try {
        const BATCH_SIZE = 4;
        const files: File[] = [];

        for (let batchStart = 0; batchStart < photoUrls.length; batchStart += BATCH_SIZE) {
          const batch = photoUrls.slice(batchStart, batchStart + BATCH_SIZE);

          const results = await Promise.allSettled(
            batch.map(async (url, batchIndex) => {
              const i = batchStart + batchIndex;
              const blob = await fetchImageBlob(url);
              if (!blob) throw new Error(`Falha na foto ${i + 1}`);

              const urlPath = url.split('?')[0];
              const ext = urlPath.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i)?.[1] || 'jpg';
              const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
              const fileName = `${product.sku}-foto-${String(i + 1).padStart(2, '0')}.${ext}`;

              return new File([blob], fileName, { type: mimeType });
            })
          );

          results.forEach(result => {
            if (result.status === 'fulfilled') {
              files.push(result.value);
            }
          });
        }

        if (files.length === 0) {
          throw new Error('Nenhuma foto carregada');
        }

        const shareData: ShareData = {
          title: `${product.name} - Smart Parts Import`,
          text: `${product.name}\nSKU: ${product.sku}\n${product.description || ''}`,
          files,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Fotos compartilhadas!', { id: toastId });
        } else {
          throw new Error('canShare retornou false');
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          toast.dismiss(toastId);
        } else {
          toast.dismiss(toastId);
          // Fallback: abre WhatsApp sem número fixo
          openWhatsAppChooser(photoUrls);
        }
      }
    } else {
      // Desktop: abre WhatsApp Web sem número — usuário escolhe o contato
      openWhatsAppChooser(photoUrls);
    }

    setIsSharing(false);
  };

  /**
   * Abre WhatsApp Web/App SEM número pré-definido.
   * O usuário escolhe para quem enviar.
   */
  const openWhatsAppChooser = (photoUrls: string[]) => {
    const message = buildShareMessage(photoUrls);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    toast.success('WhatsApp aberto!', {
      description: 'Escolha o contato para enviar as fotos.',
    });
  };

  /**
   * Copia a mensagem com link do produto para a área de transferência.
   */
  const handleCopyShareLink = async () => {
    const photoUrls = images.filter(url => !url.includes('.mp4'));

    if (photoUrls.length === 0) {
      toast.error('Nenhuma foto disponível para copiar.');
      return;
    }

    const message = buildShareMessage(photoUrls);

    try {
      await navigator.clipboard.writeText(message);
      toast.success('Link copiado!', {
        description: 'Texto com link do produto copiado para a área de transferência.',
      });
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Link copiado!', {
        description: 'Texto com link do produto copiado.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('category', product.categorySlug)}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400">{product.category}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Main Image */}
            <div
              className="relative aspect-square flex items-center justify-center bg-white p-8 overflow-hidden cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatePresence mode="wait">
                {images[currentImageIndex]?.includes('.mp4') ? (
                  <motion.video
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[currentImageIndex]}
                    autoPlay loop muted playsInline controls
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                ) : (
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: isZoomed ? 2.5 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, scale: { duration: 0.3 } }}
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    style={{
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      cursor: isZoomed ? 'zoom-out' : 'zoom-in'
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Setas dentro da foto */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-xs font-bold z-10">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Download */}
              {!images[currentImageIndex]?.includes('.mp4') && (
                <button
                  onClick={handleDownloadSingleImage}
                  className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg z-10 transition"
                  title="Baixar esta foto"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Thumbnails — linha única dentro do card */}
            {images.length > 1 && (
              <div className="border-t border-gray-100 p-3">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        currentImageIndex === index
                          ? 'border-red-600'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-white p-0.5">
                        {image.includes('.mp4') ? (
                          <div className="relative w-full h-full">
                            <video src={image} className="w-full h-full object-contain" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-gray-800 border-b-[4px] border-b-transparent ml-0.5"></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`${product.name} - ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={createImageFallback(image)}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
              {/* SKU Badge + Verified */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mb-3"
              >
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-md flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  SKU: {product.sku}
                </div>
                {product.verified && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center" title="Verificado">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>

              {/* Product Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-black mb-3 text-gray-900 leading-tight"
              >
                {product.name}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 mb-6 leading-relaxed text-sm border-l-4 border-red-600 pl-3 italic"
              >
                {product.description}
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-3 gap-3 mb-6"
              >
                {[
                  { icon: Shield, text: 'Garantia', color: 'from-blue-500 to-blue-600' },
                  { icon: Truck, text: 'Entrega', color: 'from-green-500 to-green-600' },
                  { icon: Check, text: 'Qualidade', color: 'from-red-500 to-red-600' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="relative group"
                  >
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-lg blur opacity-20 group-hover:opacity-40 transition`}></div>
                    <div className="relative flex flex-col items-center gap-1.5 bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-200 group-hover:border-transparent transition">
                      <div className={`w-7 h-7 bg-gradient-to-br ${item.color} rounded-md flex items-center justify-center`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{item.text}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* WhatsApp Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsApp}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg transition font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com Vendedor
              </motion.button>

              {/* Info Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
              >
                <p className="text-xs text-gray-700 text-center">
                  <span className="font-bold">💼 Vendas B2B:</span> Produto exclusivo para revendedores
                </p>
              </motion.div>

              {/* Download Images Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-3"
              >
                {/* Mode Toggle: ZIP vs Individual */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-2">
                  <button
                    onClick={() => setDownloadMode('zip')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-[11px] font-bold transition-all ${
                      downloadMode === 'zip'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileArchive className="w-3.5 h-3.5" />
                    ZIP
                  </button>
                  <button
                    onClick={() => setDownloadMode('individual')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-[11px] font-bold transition-all ${
                      downloadMode === 'individual'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Files className="w-3.5 h-3.5" />
                    Individual
                  </button>
                </div>

                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadMode === 'zip' ? handleDownloadImages : handleDownloadIndividual}
                  disabled={isDownloading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white py-3 rounded-lg transition font-bold text-sm flex items-center justify-center gap-2 shadow-md relative overflow-hidden"
                >
                  {/* Progress bar background */}
                  {isDownloading && (
                    <div 
                      className="absolute inset-0 bg-blue-800/40 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  )}
                  <div className="relative flex items-center gap-2">
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Baixando... {Math.round(downloadProgress)}%</span>
                      </>
                    ) : (
                      <>
                        {downloadMode === 'zip' ? <FileArchive className="w-4 h-4" /> : <Files className="w-4 h-4" />}
                        <span>
                          {downloadMode === 'zip' 
                            ? `Baixar ZIP (${images.filter(u => !u.includes('.mp4')).length} fotos)`
                            : `Baixar ${images.filter(u => !u.includes('.mp4')).length} fotos`
                          }
                        </span>
                      </>
                    )}
                  </div>
                </motion.button>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">
                  {downloadMode === 'zip' 
                    ? 'ZIP com info.txt organizado por SKU em alta qualidade'
                    : 'Cada foto salva individualmente com nome do SKU'
                  }
                </p>

              </motion.div>
            </div>

          </motion.div>
        </div>

        {/* Specifications - Full width abaixo do grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-red-600" />
              </div>
              Especificações Técnicas
            </h2>
            {product.specifications && (Array.isArray(product.specifications) ? product.specifications.length > 0 : Object.keys(product.specifications).length > 0) && (
              <button
                onClick={() => {
                  const specs = Array.isArray(product.specifications)
                    ? product.specifications
                    : Object.entries(product.specifications).map(([key, value]) => ({ key, value: value as string }));
                  const text = `${product.name}\n\n` + specs.map(s => `${s.key}: ${s.value}`).join('\n');
                  navigator.clipboard.writeText(text);
                  toast.success('Ficha técnica copiada!');
                }}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            )}
          </div>
          <div className="space-y-4">
            {product.specifications && (Array.isArray(product.specifications) ? product.specifications.length > 0 : Object.keys(product.specifications).length > 0) ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <tbody>
                    {Array.isArray(product.specifications) ? (
                      product.specifications.map((spec, index) => (
                        <tr key={spec.id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-200 w-1/3">
                            {spec.key}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {spec.value}
                          </td>
                        </tr>
                      ))
                    ) : (
                      Object.entries(product.specifications).map(([key, value], index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-200 w-1/3">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {value as string}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Entre em contato para mais informações técnicas
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ProductDetail;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Save,
  X,
  Image as ImageIcon,
  XCircle,
  Filter,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  sku: string;
  description: string;
  image: string;
  images?: string[]; // Multiple images support
  verified?: boolean; // Flag de verificação (somente admin)
  specifications: Array<{ id: string; key: string; value: string }>;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface ProductManagerProps {
  accessToken: string;
  onUpdate?: () => void;
}

export default function ProductManager({ accessToken, onUpdate }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    categorySlug: '',
    sku: '',
    description: '',
    image: '',
    images: [] as string[],
    verified: false,
    specifications: [] as Array<{ id: string; key: string; value: string }>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[ProductManager] Iniciando carregamento de dados...');
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/admin/categories`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      ]);

      console.log('[ProductManager] Status das respostas:', {
        products: productsRes.status,
        categories: categoriesRes.status
      });

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Erro ao buscar dados do servidor');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      console.log('[ProductManager] Categorias carregadas:', categoriesData);
      console.log('[ProductManager] Total de categorias:', categoriesData.categories?.length || 0);
      console.log('[ProductManager] Produtos carregados:', productsData);
      console.log('[ProductManager] Total de produtos:', productsData.products?.length || 0);

      // Converter especificações antigas (objeto) para novo formato (array)
      const convertedProducts = (productsData.products || []).map((product: any) => {
        let specifications = product.specifications || [];
        
        // Se specifications for um objeto, converter para array
        if (!Array.isArray(specifications)) {
          console.log('[ProductManager] Convertendo especificações do produto:', product.name);
          const specsObj = specifications as Record<string, string>;
          specifications = Object.entries(specsObj).map(([key, value]) => ({
            id: `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            key,
            value
          }));
        }
        
        return {
          ...product,
          specifications
        };
      });

      console.log('[ProductManager] Produtos convertidos:', convertedProducts.length);
      
      setProducts(convertedProducts);
      setCategories(categoriesData.categories || []);
      
      console.log('[ProductManager] ✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('[ProductManager] ❌ Error loading data:', error);
      toast.error('Erro ao carregar dados. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMainImage: boolean = true) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar número máximo de imagens adicionais (10)
    if (!isMainImage) {
      const totalImages = formData.images.length + files.length;
      if (totalImages > 10) {
        toast.error(`Você pode adicionar no máximo 10 imagens adicionais. Atualmente você tem ${formData.images.length} imagens.`);
        return;
      }
    }

    // Para imagem principal, aceitar apenas um arquivo
    if (isMainImage && files.length > 1) {
      toast.error('Selecione apenas uma imagem principal');
      return;
    }

    // Validar tipo e tamanho dos arquivos
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Aceitar imagens estáticas, GIFs e vídeos MP4
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type === 'video/mp4';
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name} não é uma imagem ou vídeo válido. Formatos aceitos: imagens e MP4`);
        continue;
      }

      // Limite de tamanho: GIFs (10MB), Imagens (5MB), Vídeos (50MB)
      let maxSize = 5 * 1024 * 1024; // Default: 5MB para imagens
      if (file.type === 'image/gif') {
        maxSize = 10 * 1024 * 1024; // 10MB para GIFs
      } else if (isVideo) {
        maxSize = 50 * 1024 * 1024; // 50MB para vídeos
      }
      
      if (file.size > maxSize) {
        const maxSizeMB = file.type === 'image/gif' ? '10MB' : isVideo ? '50MB' : '5MB';
        toast.error(`${file.name} excede o tamanho máximo de ${maxSizeMB}`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Upload em massa
      toast.info(`Enviando ${validFiles.length} imagem(ns)...`);
      
      for (const file of validFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const res = await fetch(`${API_URL}/admin/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formDataUpload
        });

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Erro ao enviar ${file.name}`);
        }
      }

      // Atualizar o estado com as imagens enviadas
      if (uploadedUrls.length > 0) {
        if (isMainImage) {
          setFormData({ ...formData, image: uploadedUrls[0] });
          toast.success('Imagem principal enviada com sucesso!');
        } else {
          setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
          toast.success(`${uploadedUrls.length} imagem(ns) adicionada(s) com sucesso!`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagens');
    } finally {
      setUploading(false);
      // Limpar o input para permitir selecionar os mesmos arquivos novamente
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleCategoryChange = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug);
    if (category) {
      setFormData({
        ...formData,
        category: category.name,
        categorySlug: category.slug
      });
    } else {
      // Reset category fields if no category is selected
      setFormData({
        ...formData,
        category: '',
        categorySlug: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('========================================');
    console.log('🚀 INICIANDO SUBMIT DO PRODUTO');
    console.log('========================================');

    // Validação básica
    console.log('📋 Validação de campos obrigatórios:');
    console.log('  - Nome:', formData.name || '❌ VAZIO');
    console.log('  - Categoria:', formData.category || '❌ VAZIO');
    console.log('  - Imagem:', formData.image || '❌ VAZIO');

    if (!formData.name || !formData.category || !formData.image) {
      console.error('❌ Validação falhou! Campos obrigatórios vazios');
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    console.log('✅ Validação passou!');

    try {
      console.log('📦 Dados completos do formulário:');
      console.log(JSON.stringify(formData, null, 2));

      const url = editingProduct
        ? `${API_URL}/admin/products/${editingProduct.id}`
        : `${API_URL}/admin/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      console.log('🌐 Configuração da requisição:');
      console.log('  - URL:', url);
      console.log('  - Método:', method);
      console.log('  - Token:', accessToken ? '✅ Presente' : '❌ Ausente');
      console.log('  - Headers:', {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken.substring(0, 20)}...` : 'NONE'
      });

      console.log('📤 Enviando requisição...');

      // Primeiro vamos testar se conseguimos fazer uma requisição simples
      console.log('🧪 TESTE 1: Health check rápido...');
      try {
        const healthRes = await fetch(`${API_URL}/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        console.log('✅ Health check OK:', healthRes.status);
      } catch (healthError) {
        console.error('❌ Health check falhou:', healthError);
        toast.error('Servidor inacessível. Verifique sua conexão.');
        return;
      }

      console.log('🧪 TESTE 2: Enviando produto...');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      const responseText = await res.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        toast.error(`Erro ao processar resposta: ${responseText.substring(0, 100)}`);
        return;
      }

      if (data.success) {
        toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
        loadData();
        resetForm();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || 'Erro ao salvar produto');
      }
    } catch (error) {
      // Verificar se é erro de CORS ou rede
      if (error instanceof TypeError) {
        toast.error('Erro de conexão. Verifique se o servidor está acessível.');
      } else {
        toast.error(`Erro: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log('========================================');
    console.log('🏁 FIM DO SUBMIT');
    console.log('========================================');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Converter especificações antigas (objeto) para o novo formato (array)
    let specifications = product.specifications || [];
    if (!Array.isArray(specifications)) {
      // Se for um objeto do formato antigo Record<string, string>
      const specsObj = specifications as any;
      specifications = Object.entries(specsObj).map(([key, value]) => ({
        id: `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        key,
        value: value as string
      }));
    }
    
    setFormData({
      name: product.name,
      category: product.category,
      categorySlug: product.categorySlug,
      sku: product.sku || '',
      description: product.description || '',
      image: product.image,
      images: product.images || [],
      verified: product.verified || false,
      specifications
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (res.ok) {
        toast.success('Produto excluído!');
        loadData();
        if (onUpdate) onUpdate();
      } else {
        toast.error('Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      categorySlug: '',
      sku: '',
      description: '',
      image: '',
      images: [],
      verified: false,
      specifications: []
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || product.categorySlug === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Ordenar produtos filtrados por SKU numérico (crescente)
  const sortedFilteredProducts = [...filteredProducts].sort((a, b) => {
    const skuA = parseInt(a.sku) || 0;
    const skuB = parseInt(b.sku) || 0;
    return skuA - skuB;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Package className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Produtos</h2>
            <p className="text-gray-400 text-sm">
              {categoryFilter || searchQuery
                ? `${sortedFilteredProducts.length} de ${products.length} produtos`
                : `${products.length} produtos cadastrados`
              }
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-52 appearance-none cursor-pointer [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              Novo Produto
            </motion.button>
          )}
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Geladeira Portátil 12V"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria * {categories.length === 0 && <span className="text-yellow-400 text-xs">(Nenhuma categoria cadastrada)</span>}
                  </label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-gray-800 [&>option]:text-white"
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="" className="bg-gray-800 text-white">
                      {categories.length === 0 ? 'Cadastre categorias primeiro' : 'Selecione uma categoria'}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug} className="bg-gray-800 text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Você precisa criar pelo menos uma categoria antes de adicionar produtos.
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SKU / Código
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: GEL-12V-45L"
                  />
                </div>

                {/* Verified Flag */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg border transition-all ${
                      formData.verified
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 ${formData.verified ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <span className="font-medium text-sm">VERIFICADO</span>
                    <div className={`ml-auto w-10 h-5 rounded-full transition-all relative ${
                      formData.verified ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}>
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: formData.verified ? '22px' : '2px' }}
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição detalhada do produto..."
                />
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagem/GIF/Vídeo Principal *
                </label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">
                        {uploading ? 'Enviando...' : 'Escolher Mídia'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/mp4"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {formData.image && (
                      <span className="text-green-400 text-sm">✓ Arquivo carregado</span>
                    )}
                  </div>
                  {formData.image && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                      {formData.image.includes('.mp4') ? (
                        <video
                          src={formData.image}
                          className="w-full h-full object-cover"
                          controls
                          muted
                        />
                      ) : (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Galeria Adicional (opcional)
                  </label>
                  <span className="text-xs text-gray-400">
                    {formData.images.length}/10 arquivos
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors w-fit ${formData.images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">
                        {uploading ? 'Enviando...' : 'Adicionar Imagens/GIFs/Vídeos'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/mp4"
                        multiple
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                        disabled={uploading || formData.images.length >= 10}
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      Você pode selecionar múltiplos arquivos de uma vez. Limite: 10 arquivos (max 5MB para imagens, 10MB para GIFs, 50MB para vídeos MP4)
                    </p>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5">
                            {img.includes('.mp4') ? (
                              <video
                                src={img}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                              />
                            ) : (
                              <img
                                src={img}
                                alt={`Mídia ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-xs text-white text-center">{index + 1}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            title="Remover arquivo"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.images.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">
                        Nenhum arquivo adicional
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Clique no botão acima para adicionar até 10 imagens/GIFs/vídeos
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Especificações Técnicas
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                      setFormData({
                        ...formData,
                        specifications: [
                          ...formData.specifications,
                          { id: newId, key: '', value: '' }
                        ]
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Linha
                  </button>
                </div>
                <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">
                  {formData.specifications.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Nenhuma especificação adicionada. Clique em "Adicionar Linha" para começar.
                    </p>
                  ) : (
                    formData.specifications.map((spec) => (
                      <div key={spec.id} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = formData.specifications.map(s => 
                                s.id === spec.id ? { ...s, key: e.target.value } : s
                              );
                              setFormData({ ...formData, specifications: newSpecs });
                            }}
                            placeholder="Nome (ex: Voltagem)"
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = formData.specifications.map(s => 
                                s.id === spec.id ? { ...s, value: e.target.value } : s
                              );
                              setFormData({ ...formData, specifications: newSpecs });
                            }}
                            placeholder="Valor (ex: 12V/24V)"
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newSpecs = formData.specifications.filter(s => s.id !== spec.id);
                            setFormData({ ...formData, specifications: newSpecs });
                          }}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingProduct ? 'Atualizar' : 'Criar'} Produto
                </motion.button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid gap-4">
        {sortedFilteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {searchQuery ? 'Tente outra busca' : 'Clique em "Novo Produto" para começar'}
            </p>
          </div>
        ) : (
          sortedFilteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{product.name}</h4>
                    {product.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{product.category}</p>
                  {product.sku && (
                    <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                  )}
                  {product.images && product.images.length > 0 && (
                    <p className="text-xs text-blue-400 mt-1">
                      +{product.images.length} {product.images.length === 1 ? 'imagem' : 'imagens'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
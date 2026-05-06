import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bug,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Play,
  RefreshCw,
  Server,
  Database,
  Image as ImageIcon,
  Lock,
  FileText,
  ShoppingBag,
  Tag,
  Calendar,
  Activity,
  Zap,
  Download,
  Package,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useData } from '../context/DataContext';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  duration?: number;
  error?: any;
}

interface DebugProps {
  onNavigate: (page: string) => void;
}

export default function Debug({ onNavigate }: DebugProps) {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const dataContext = useData();

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests((prev) => {
      const existing = prev.find((t) => t.name === name);
      if (existing) {
        return prev.map((t) => (t.name === name ? { ...t, ...updates } : t));
      }
      return [...prev, { name, status: 'pending', message: '', ...updates } as TestResult];
    });
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTest(name, { status: 'running', message: 'Executando...' });

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, {
        status: 'success',
        message: 'Teste passou com sucesso',
        data: result,
        duration,
      });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(name, {
        status: 'error',
        message: error.message || 'Teste falhou',
        error: error,
        duration,
      });
      throw error;
    }
  };

  // Test 1: Verificar configuração do Supabase
  const testSupabaseConfig = async () => {
    return runTest('Configuração Supabase', async () => {
      if (!projectId || !publicAnonKey) {
        throw new Error('ProjectId ou PublicAnonKey não configurados');
      }
      if (!projectId.includes('supabase.co')) {
        return {
          projectId,
          publicAnonKey: publicAnonKey.substring(0, 20) + '...',
          warning: 'ProjectId não parece ser um URL do Supabase',
        };
      }
      return {
        projectId,
        publicAnonKey: publicAnonKey.substring(0, 20) + '...',
        apiUrl: API_URL,
      };
    });
  };

  // Test 2: Verificar servidor health check
  const testServerHealth = async () => {
    return runTest('Servidor Health Check', async () => {
      console.log('[DEBUG] Testando servidor em:', `${API_URL}/health`);

      const response = await fetch(`${API_URL}/health`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      console.log('[DEBUG] Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[DEBUG] Resposta do servidor:', data);

      return data;
    });
  };

  // Test 3: Carregar categorias públicas
  const testPublicCategories = async () => {
    return runTest('Categorias Públicas', async () => {
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('Formato de resposta inválido');
      }

      // Truncar ícones base64 para não sobrecarregar o JSON - NÃO INCLUIR O ÍCONE!
      const categoriesSummary = data.categories.map((cat: any) => ({
        name: cat.name,
        slug: cat.slug,
        hasIcon: !!cat.icon,
        iconSize: cat.icon ? `${(cat.icon.length / 1024).toFixed(2)} KB` : '0 KB',
        createdAt: cat.createdAt,
        // NÃO INCLUIR cat.icon aqui!
      }));

      return {
        total: data.categories.length,
        categories: categoriesSummary.slice(0, 5), // Apenas 5 primeiras
        allSlugs: data.categories.map((c: any) => c.slug),
      };
    });
  };

  // Test 4: Carregar produtos públicos
  const testPublicProducts = async () => {
    return runTest('Produtos Públicos', async () => {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('Formato de resposta inválido');
      }
      return {
        total: data.products.length,
        products: data.products,
        sample: data.products.slice(0, 3),
        porCategoria: data.products.reduce((acc: any, p: any) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {}),
      };
    });
  };

  // Test 5: Carregar banners
  const testBanners = async () => {
    return runTest('Banners', async () => {
      const response = await fetch(`${API_URL}/banners`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.banners || !Array.isArray(data.banners)) {
        throw new Error('Formato de resposta inválido');
      }
      return {
        total: data.banners.length,
        banners: data.banners,
      };
    });
  };

  // Test 6: Verificar DataContext
  const testDataContext = async () => {
    return runTest('DataContext', async () => {
      const { categories, products, loading, error } = dataContext;

      if (error) {
        throw new Error(`DataContext em erro: ${error}`);
      }

      if (loading) {
        return {
          status: 'loading',
          warning: 'DataContext ainda está carregando',
        };
      }

      return {
        categoriesCount: categories.length,
        productsCount: products.length,
        categories: categories.slice(0, 3),
        products: products.slice(0, 3),
      };
    });
  };

  // Test 7: Testar produto específico
  const testSpecificProduct = async () => {
    return runTest('Produto Específico', async () => {
      // Primeiro pega a lista de produtos
      const productsRes = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const productsData = await productsRes.json();

      if (!productsData.products || productsData.products.length === 0) {
        throw new Error('Nenhum produto disponível para testar');
      }

      const firstProduct = productsData.products[0];

      // Tenta buscar o produto específico
      const response = await fetch(`${API_URL}/products/${firstProduct.id}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        productId: firstProduct.id,
        productName: firstProduct.name,
        data: data.product,
        hasSpecifications: !!data.product?.specifications,
        hasImages: !!data.product?.images,
        specificationsType: Array.isArray(data.product?.specifications) ? 'array' : 'object',
      };
    });
  };

  // Test 8: Verificar produtos por categoria
  const testProductsByCategory = async () => {
    return runTest('Produtos por Categoria', async () => {
      // Primeiro pega categorias
      const categoriesRes = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const categoriesData = await categoriesRes.json();

      if (!categoriesData.categories || categoriesData.categories.length === 0) {
        throw new Error('Nenhuma categoria disponível');
      }

      const firstCategory = categoriesData.categories[0];

      // Busca produtos da categoria usando a rota correta
      const response = await fetch(`${API_URL}/products/category/${firstCategory.slug}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        categorySlug: firstCategory.slug,
        categoryName: firstCategory.name,
        total: data.products?.length || 0,
        products: data.products?.slice(0, 3),
      };
    });
  };

  // Test 9: Verificar imagens
  const testImageLoading = async () => {
    return runTest('Carregamento de Imagens', async () => {
      const productsRes = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const productsData = await productsRes.json();

      if (!productsData.products || productsData.products.length === 0) {
        throw new Error('Nenhum produto com imagens para testar');
      }

      const productsWithImages = productsData.products.filter((p: any) => p.image);
      if (productsWithImages.length === 0) {
        throw new Error('Nenhum produto tem imagens');
      }

      const imageUrl = productsWithImages[0].image;

      // Testa se a imagem carrega
      const imageTest = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ success: true, url: imageUrl });
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = imageUrl;
        setTimeout(() => reject(new Error('Timeout ao carregar imagem')), 10000);
      });

      return {
        totalProducts: productsData.products.length,
        productsWithImages: productsWithImages.length,
        testedImageUrl: imageUrl,
        imageTest,
      };
    });
  };

  // Test 10: Verificar performance
  const testPerformance = async () => {
    return runTest('Performance', async () => {
      const tests = [];

      // Teste 1: Latência da API
      const apiStart = performance.now();
      await fetch(`${API_URL}/health`);
      const apiLatency = performance.now() - apiStart;
      tests.push({ test: 'API Latency', value: `${apiLatency.toFixed(2)}ms` });

      // Teste 2: Tempo de carregamento de categorias
      const catStart = performance.now();
      await fetch(`${API_URL}/categories`);
      const catLatency = performance.now() - catStart;
      tests.push({ test: 'Categories Load', value: `${catLatency.toFixed(2)}ms` });

      // Teste 3: Tempo de carregamento de produtos
      const prodStart = performance.now();
      await fetch(`${API_URL}/products`);
      const prodLatency = performance.now() - prodStart;
      tests.push({ test: 'Products Load', value: `${prodLatency.toFixed(2)}ms` });

      const avgLatency = (apiLatency + catLatency + prodLatency) / 3;

      return {
        tests,
        averageLatency: `${avgLatency.toFixed(2)}ms`,
        status: avgLatency < 1000 ? 'Excelente' : avgLatency < 3000 ? 'Bom' : 'Lento',
      };
    });
  };

  // Test 11: Verificar estrutura de dados
  const testDataStructure = async () => {
    return runTest('Estrutura de Dados', async () => {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/products`),
      ]);

      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();

      const issues = [];

      // Verificar categorias
      if (!categoriesData.categories) issues.push('categories.categories não existe');
      if (!Array.isArray(categoriesData.categories))
        issues.push('categories.categories não é array');

      // Verificar produtos
      if (!productsData.products) issues.push('products.products não existe');
      if (!Array.isArray(productsData.products)) issues.push('products.products não é array');

      // Verificar estrutura de cada categoria
      if (categoriesData.categories && categoriesData.categories.length > 0) {
        const cat = categoriesData.categories[0];
        if (!cat.name) issues.push('Categoria sem campo name');
        if (!cat.slug) issues.push('Categoria sem campo slug');
        if (!cat.icon) issues.push('Categoria sem campo icon');
      }

      // Verificar estrutura de cada produto
      if (productsData.products && productsData.products.length > 0) {
        const prod = productsData.products[0];
        if (!prod.id) issues.push('Produto sem campo id');
        if (!prod.name) issues.push('Produto sem campo name');
        if (!prod.category) issues.push('Produto sem campo category');
        if (!prod.categorySlug) issues.push('Produto sem campo categorySlug');

        // Verificar especificações
        if (prod.specifications) {
          const isArray = Array.isArray(prod.specifications);
          if (!isArray) {
            issues.push('Produto com specifications como objeto (deveria ser array)');
          }
        }
      }

      return {
        issues: issues.length > 0 ? issues : ['Nenhum problema encontrado'],
        categoriesStructure: categoriesData.categories?.[0],
        productsStructure: productsData.products?.[0],
      };
    });
  };

  // Test 12: Verificar cache
  const testCache = async () => {
    return runTest('Sistema de Cache', async () => {
      const cacheKey = 'debug-cache-test';
      const testData = { test: true, timestamp: Date.now() };

      // Testa localStorage
      try {
        localStorage.setItem(cacheKey, JSON.stringify(testData));
        const retrieved = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        localStorage.removeItem(cacheKey);

        if (retrieved.test !== testData.test) {
          throw new Error('Cache não funciona corretamente');
        }
      } catch (e) {
        throw new Error('localStorage não disponível ou bloqueado');
      }

      return {
        localStorageAvailable: true,
        testPassed: true,
        dataContextCache: {
          categoriesCount: dataContext.categories.length,
          productsCount: dataContext.products.length,
          loading: dataContext.loading,
        },
      };
    });
  };

  // Test 13: Testar criação de produto com especificações
  const testCreateProductWithSpecs = async () => {
    return runTest('Criar Produto com Especificações (Admin)', async () => {
      // Primeiro verifica se tem categorias
      const categoriesRes = await fetch(`${API_URL}/categories`);
      const categoriesData = await categoriesRes.json();

      if (!categoriesData.categories || categoriesData.categories.length === 0) {
        throw new Error('Nenhuma categoria disponível. Crie uma categoria primeiro.');
      }

      const firstCategory = categoriesData.categories[0];

      // Dados de teste para criar produto
      const testProduct = {
        name: `TESTE DEBUG - ${Date.now()}`,
        category: firstCategory.name,
        categorySlug: firstCategory.slug,
        sku: `TEST-${Date.now()}`,
        description: 'Produto criado automaticamente pelo sistema de debug',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        images: [],
        specifications: [
          { id: 'spec-1', key: 'Voltagem', value: '12V/24V' },
          { id: 'spec-2', key: 'Capacidade', value: '45L' },
          { id: 'spec-3', key: 'Peso', value: '15kg' },
        ],
      };

      console.log('[DEBUG TEST] Tentando criar produto:', testProduct);

      // IMPORTANTE: Este teste precisa de um token de admin válido
      // Por enquanto, vamos apenas testar se a rota está acessível
      const response = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`, // Vai falhar mas vamos ver o erro
        },
        body: JSON.stringify(testProduct),
      });

      const responseText = await response.text();
      console.log('[DEBUG TEST] Resposta do servidor (texto):', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Erro ao fazer parse da resposta: ${responseText}`);
      }

      console.log('[DEBUG TEST] Resposta do servidor (JSON):', data);

      return {
        status: response.status,
        ok: response.ok,
        response: data,
        note: 'Este teste precisa de um token de admin válido. Se retornar 401 é esperado.',
      };
    });
  };

  const runAllTests = async () => {
    setRunning(true);
    setTests([]);

    try {
      // Testes básicos
      await testSupabaseConfig();
      await testServerHealth();

      // Testes de dados
      await testPublicCategories();
      await testPublicProducts();
      await testBanners();
      await testDataContext();

      // Testes específicos
      await testSpecificProduct();
      await testProductsByCategory();

      // Testes avançados
      await testImageLoading();
      await testDataStructure();
      await testCache();
      await testPerformance();
      await testCreateProductWithSpecs();
    } catch (error) {
      console.error('Erro ao executar testes:', error);
    } finally {
      setRunning(false);
    }
  };

  const downloadResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      projectId,
      tests,
      dataContext: {
        categoriesCount: dataContext.categories.length,
        productsCount: dataContext.products.length,
        loading: dataContext.loading,
        error: dataContext.error,
      },
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-results-${Date.now()}.json`;
    a.click();
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'running':
        return 'border-blue-500/30 bg-blue-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const successCount = tests.filter((t) => t.status === 'success').length;
  const errorCount = tests.filter((t) => t.status === 'error').length;
  const warningCount = tests.filter((t) => t.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-full mb-6"
          >
            <Bug className="w-6 h-6" />
            <span className="font-bold text-lg">Debug Tool</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Sistema de Debug Completo
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Teste todas as funcionalidades do site e identifique problemas em tempo real
          </p>

          {/* Stats */}
          {tests.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-white font-semibold">{successCount} Passou</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-white font-semibold">{errorCount} Falhou</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-semibold">{warningCount} Avisos</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAllTests}
            disabled={running}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {running ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Executar Todos os Testes
              </>
            )}
          </motion.button>

          {tests.length > 0 && !running && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTests([])}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Limpar Resultados
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadResults}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg"
              >
                <Download className="w-5 h-5" />
                Baixar Resultados
              </motion.button>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-lg"
          >
            Voltar ao Site
          </motion.button>
        </div>

        {/* Individual Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {[
            { name: 'Supabase Config', fn: testSupabaseConfig, icon: Server },
            { name: 'Server Health', fn: testServerHealth, icon: Activity },
            { name: 'Categorias', fn: testPublicCategories, icon: Tag },
            { name: 'Produtos', fn: testPublicProducts, icon: ShoppingBag },
            { name: 'Banners', fn: testBanners, icon: FileText },
            { name: 'DataContext', fn: testDataContext, icon: Database },
            { name: 'Produto Específico', fn: testSpecificProduct, icon: Package },
            { name: 'Por Categoria', fn: testProductsByCategory, icon: Tag },
            { name: 'Imagens', fn: testImageLoading, icon: ImageIcon },
            { name: 'Estrutura', fn: testDataStructure, icon: Database },
            { name: 'Cache', fn: testCache, icon: Zap },
            { name: 'Performance', fn: testPerformance, icon: Activity },
            { name: 'Criar Produto com Specs', fn: testCreateProductWithSpecs, icon: Package },
          ].map((test) => {
            const Icon = test.icon;
            const testResult = tests.find((t) => t.name === test.name);

            return (
              <motion.button
                key={test.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => test.fn()}
                disabled={running}
                className={`p-4 rounded-xl border-2 transition-all ${
                  testResult
                    ? getStatusColor(testResult.status)
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                } disabled:opacity-50`}
              >
                <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white text-sm font-semibold text-center">{test.name}</div>
                {testResult && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {getStatusIcon(testResult.status)}
                    {testResult.duration && (
                      <span className="text-xs text-gray-400">{testResult.duration}ms</span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Test Results */}
        {tests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Resultados dos Testes</h2>

            {tests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border-2 overflow-hidden ${getStatusColor(test.status)}`}
              >
                <div
                  onClick={() => setExpandedTest(expandedTest === test.name ? null : test.name)}
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{test.name}</h3>
                        <p className="text-gray-400 text-sm">{test.message}</p>
                        {test.duration && (
                          <p className="text-gray-500 text-xs mt-1">Tempo: {test.duration}ms</p>
                        )}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedTest === test.name ? 180 : 0 }}
                      className="text-gray-400"
                    >
                      ▼
                    </motion.div>
                  </div>
                </div>

                {expandedTest === test.name && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-6 bg-black/20">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Dados Completos:</h4>
                      <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-xs text-gray-300">
                        {JSON.stringify(test.data || test.error || {}, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* System Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Configuração
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Project ID:</span>
                <span className="text-white font-mono text-xs">{projectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">API URL:</span>
                <span className="text-white font-mono text-xs truncate max-w-[200px]">
                  {API_URL}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              DataContext
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Categorias:</span>
                <span className="text-white">{dataContext.categories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Produtos:</span>
                <span className="text-white">{dataContext.products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Loading:</span>
                <span className={dataContext.loading ? 'text-yellow-400' : 'text-green-400'}>
                  {dataContext.loading ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error:</span>
                <span className={dataContext.error ? 'text-red-400' : 'text-green-400'}>
                  {dataContext.error || 'Nenhum'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status Geral
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Testes Executados:</span>
                <span className="text-white">{tests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Passou:</span>
                <span className="text-green-400">{successCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Falhou:</span>
                <span className="text-red-400">{errorCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={errorCount === 0 ? 'text-green-400' : 'text-red-400'}>
                  {errorCount === 0 ? '✓ Tudo OK' : '✗ Problemas'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  LogOut,
  Image as ImageIcon,
  FolderTree,
  FileImage,
  BarChart3,
  Settings as SettingsIcon,
  Home,
  Book,
  ShoppingCart,
  Users,
  Archive,
  Activity,
  Upload,
} from 'lucide-react';
import ProductManager from './ProductManager';
import BannerManager from './BannerManager';
import CategoryManager from './CategoryManager';
import Analytics from './Analytics';
import Settings from './Settings';
import OrderManager from './OrderManager';
import CustomerManager from './CustomerManager';
import BackupManager from './BackupManager';
import ConnectionStatus from './ConnectionStatus';
import UploadAssets from './UploadAssets';
import CatalogManager from './CatalogManager';
import { projectId } from '../../../../utils/supabase/info';

interface AdminDashboardProps {
  accessToken: string;
  onLogout: () => void;
  onNavigateHome?: () => void;
}

interface Product {
  id: string;
  name: string;
  image: string;
  images?: string[];
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
}

interface Category {
  slug: string;
  name: string;
}

export default function AdminDashboard({ accessToken, onLogout, onNavigateHome }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'banners' | 'analytics' | 'settings' | 'orders' | 'customers' | 'backup' | 'status' | 'upload-assets' | 'catalogs'>('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBanners: 0,
    totalProductImages: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, bannersRes, ordersRes, customersRes] = await Promise.all([
        fetch(`${API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/admin/categories`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/admin/banners`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/admin/orders`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/admin/customers`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const bannersData = await bannersRes.json();
      const ordersData = await ordersRes.json();
      const customersData = await customersRes.json();

      console.log('Stats loaded:', { productsData, categoriesData, bannersData, ordersData, customersData });

      const products = productsData.products || [];
      const categories = categoriesData.categories || [];
      const banners = bannersData.banners || [];
      const orders = ordersData.orders || [];
      const customers = customersData.customers || [];

      // Count total product images (main image + additional images)
      const totalProductImages = products.reduce((total: number, product: Product) => {
        let count = 1; // Main image
        if (product.images && product.images.length > 0) {
          count += product.images.length;
        }
        return total + count;
      }, 0);

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalBanners: banners.length,
        totalProductImages: totalProductImages,
        totalOrders: orders.length,
        totalCustomers: customers.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats when tab changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as const, label: 'Produtos', icon: Package },
    { id: 'categories' as const, label: 'Categorias', icon: FolderTree },
    { id: 'banners' as const, label: 'Banners', icon: ImageIcon },
    { id: 'orders' as const, label: 'Pedidos', icon: ShoppingCart },
    { id: 'customers' as const, label: 'Clientes', icon: Users },
    { id: 'analytics' as const, label: 'Análise', icon: BarChart3 },
    { id: 'backup' as const, label: 'Backup', icon: Archive },
    { id: 'status' as const, label: 'Status', icon: Activity },
    { id: 'catalogs' as const, label: 'Catálogos', icon: Book },
    { id: 'upload-assets' as const, label: 'Assets', icon: Upload },
    { id: 'settings' as const, label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SMART PARTS IMPORT</h1>
                <p className="text-sm text-gray-400">Painel Administrativo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onNavigateHome && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onNavigateHome}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
                  title="Voltar para o site"
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden md:inline">Voltar ao Site</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Sair</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-2 border border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Bem-vindo ao Dashboard</h2>
                <p className="text-gray-400 mb-6">
                  Gerencie os produtos e banners do seu site de forma fácil e intuitiva.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                    <Package className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Produtos</h3>
                    <p className="text-gray-400 text-sm">
                      Adicione, edite e gerencie todos os produtos do catálogo
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                    <ImageIcon className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Banners</h3>
                    <p className="text-gray-400 text-sm">
                      Personalize os banners do carrossel da página inicial
                    </p>
                  </div>
                  <div 
                    onClick={() => setActiveTab('status')}
                    className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Activity className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                    <p className="text-gray-400 text-sm">
                      Verifique a integridade da conexão com o Supabase
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">Estatísticas</h3>
                  
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                          <div className="w-8 h-8 bg-white/10 rounded-lg mb-3"></div>
                          <div className="h-5 bg-white/10 rounded w-24 mb-2"></div>
                          <div className="h-4 bg-white/10 rounded w-32"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Package className="w-8 h-8 text-green-400" />
                          <span className="text-3xl font-black text-green-400">{stats.totalProducts}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">Produtos</h4>
                        <p className="text-gray-400 text-sm">
                          {stats.totalProducts === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <FolderTree className="w-8 h-8 text-purple-400" />
                          <span className="text-3xl font-black text-purple-400">{stats.totalCategories}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">Categorias</h4>
                        <p className="text-gray-400 text-sm">
                          {stats.totalCategories === 1 ? 'categoria cadastrada' : 'categorias cadastradas'}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-6 hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <FileImage className="w-8 h-8 text-red-400" />
                          <span className="text-3xl font-black text-red-400">{stats.totalProductImages}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">Imagens de Produtos</h4>
                        <p className="text-gray-400 text-sm">
                          {stats.totalProductImages === 1 ? 'imagem cadastrada' : 'imagens cadastradas'}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6 hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <ImageIcon className="w-8 h-8 text-yellow-400" />
                          <span className="text-3xl font-black text-yellow-400">{stats.totalBanners}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">Banners</h4>
                        <p className="text-gray-400 text-sm">
                          {stats.totalBanners === 1 ? 'banner no carrossel' : 'banners no carrossel'}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-xl p-6 hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <ShoppingCart className="w-8 h-8 text-cyan-400" />
                          <span className="text-3xl font-black text-cyan-400">{stats.totalOrders}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">Pedidos</h4>
                        <p className="text-gray-400 text-sm">
                          {stats.totalOrders === 1 ? 'pedido realizado' : 'pedidos realizados'}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-6 hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Users className="w-8 h-8 text-pink-400" />
                          <span className="text-3xl font-black text-pink-400">{stats.totalCustomers}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">Clientes</h4>
                        <p className="text-gray-400 text-sm">
                          {stats.totalCustomers === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
                        </p>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && <ProductManager accessToken={accessToken} onUpdate={loadStats} />}
          {activeTab === 'categories' && <CategoryManager accessToken={accessToken} onUpdate={loadStats} />}
          {activeTab === 'banners' && <BannerManager accessToken={accessToken} onUpdate={loadStats} />}
          {activeTab === 'analytics' && <Analytics accessToken={accessToken} />}
          {activeTab === 'settings' && <Settings accessToken={accessToken} />}
          {activeTab === 'orders' && <OrderManager accessToken={accessToken} />}
          {activeTab === 'customers' && <CustomerManager accessToken={accessToken} />}
          {activeTab === 'backup' && <BackupManager accessToken={accessToken} />}
          {activeTab === 'status' && <ConnectionStatus accessToken={accessToken} />}
          {activeTab === 'catalogs' && <CatalogManager accessToken={accessToken} onUpdate={loadStats} />}
          {activeTab === 'upload-assets' && <UploadAssets />}
        </motion.div>
      </div>
    </div>
  );
}
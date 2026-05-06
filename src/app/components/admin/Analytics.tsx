import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Eye,
  MousePointer,
  MessageCircle,
  Package,
  TrendingUp,
  Users,
  Calendar,
  Clock,
} from 'lucide-react';
import { projectId } from '../../../../utils/supabase/info';

interface AnalyticsProps {
  accessToken: string;
}

interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userAgent: string;
  ip: string;
  page?: string;
  productId?: string;
  productName?: string;
  categorySlug?: string;
  categoryName?: string;
  location?: string;
  action?: string;
}

export default function Analytics({ accessToken }: AnalyticsProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByTimeRange = (events: AnalyticsEvent[]) => {
    if (timeRange === 'all') return events;

    const now = new Date();
    const cutoff = new Date(now);

    switch (timeRange) {
      case '24h':
        cutoff.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
    }

    return events.filter((e) => new Date(e.timestamp) >= cutoff);
  };

  const filteredEvents = filterEventsByTimeRange(events);

  // Statistics
  const stats = {
    totalPageViews: filteredEvents.filter((e) => e.event === 'page_view').length,
    uniqueVisitors: new Set(filteredEvents.map((e) => e.ip)).size,
    productViews: filteredEvents.filter((e) => e.event === 'product_view').length,
    whatsappClicks: filteredEvents.filter((e) => e.event === 'whatsapp_click').length,
    catalogOpens: filteredEvents.filter((e) => e.event === 'catalog_open').length,
    categoryViews: filteredEvents.filter((e) => e.event === 'category_view').length,
  };

  // Most viewed products
  const productViews = filteredEvents.filter((e) => e.event === 'product_view');
  const productViewCounts = productViews.reduce((acc: any, e) => {
    const key = `${e.productId}:${e.productName}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topProducts = Object.entries(productViewCounts)
    .map(([key, count]) => {
      const [id, name] = key.split(':');
      return { id, name, views: count as number };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Most viewed categories
  const categoryViews = filteredEvents.filter((e) => e.event === 'category_view');
  const categoryViewCounts = categoryViews.reduce((acc: any, e) => {
    const key = `${e.categorySlug}:${e.categoryName}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryViewCounts)
    .map(([key, count]) => {
      const [slug, name] = key.split(':');
      return { slug, name, views: count as number };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // WhatsApp clicks by location
  const whatsappByLocation = filteredEvents
    .filter((e) => e.event === 'whatsapp_click')
    .reduce((acc: any, e) => {
      const location = e.location || 'Desconhecido';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

  // Recent events
  const recentEvents = [...filteredEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

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
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <BarChart3 className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics & Inteligência</h2>
            <p className="text-gray-400 text-sm">{filteredEvents.length} eventos registrados</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
          {[
            { value: '24h', label: '24h' },
            { value: '7d', label: '7 dias' },
            { value: '30d', label: '30 dias' },
            { value: 'all', label: 'Tudo' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range.value
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Eye, label: 'Visualizações', value: stats.totalPageViews, color: 'blue' },
          { icon: Users, label: 'Visitantes Únicos', value: stats.uniqueVisitors, color: 'green' },
          {
            icon: Package,
            label: 'Produtos Visualizados',
            value: stats.productViews,
            color: 'purple',
          },
          {
            icon: MessageCircle,
            label: 'Cliques WhatsApp',
            value: stats.whatsappClicks,
            color: 'emerald',
          },
          {
            icon: MousePointer,
            label: 'Categorias Visitadas',
            value: stats.categoryViews,
            color: 'orange',
          },
          { icon: TrendingUp, label: 'Catálogo Aberto', value: stats.catalogOpens, color: 'red' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            Produtos Mais Visualizados
          </h3>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-black">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{product.name}</p>
                    <p className="text-gray-500 text-sm">{product.views} visualizações</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(product.views / topProducts[0].views) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-orange-400" />
            Categorias Mais Acessadas
          </h3>
          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
            ) : (
              topCategories.map((category, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-orange-400 font-black">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{category.name}</p>
                    <p className="text-gray-500 text-sm">{category.views} visualizações</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(category.views / topCategories[0].views) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Clicks by Location */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          Cliques no WhatsApp por Localização
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(whatsappByLocation).length === 0 ? (
            <p className="text-gray-500 text-center py-8 col-span-3">Nenhum dado disponível</p>
          ) : (
            Object.entries(whatsappByLocation).map(([location, count], index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">{location}</p>
                <p className="text-2xl font-black text-white">{count as number}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Atividade Recente
        </h3>
        <div className="space-y-3">
          {recentEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma atividade registrada</p>
          ) : (
            recentEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  {event.event === 'page_view' && <Eye className="w-5 h-5 text-blue-400" />}
                  {event.event === 'product_view' && (
                    <Package className="w-5 h-5 text-purple-400" />
                  )}
                  {event.event === 'category_view' && (
                    <MousePointer className="w-5 h-5 text-orange-400" />
                  )}
                  {event.event === 'whatsapp_click' && (
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                  )}
                  {event.event === 'catalog_open' && (
                    <TrendingUp className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">
                    {event.event === 'page_view' && `Página visualizada: ${event.page}`}
                    {event.event === 'product_view' && `Produto visualizado: ${event.productName}`}
                    {event.event === 'category_view' &&
                      `Categoria visualizada: ${event.categoryName}`}
                    {event.event === 'whatsapp_click' && `WhatsApp clicado em: ${event.location}`}
                    {event.event === 'catalog_open' && 'Catálogo aberto'}
                    {event.event === 'cart_action' && `Ação no carrinho: ${event.action}`}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

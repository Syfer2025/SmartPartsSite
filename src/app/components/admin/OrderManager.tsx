import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Filter,
  MessageSquare,
  CheckSquare,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../../../../utils/supabase/info';

interface Order {
  id: string;
  customer: {
    cnpj: string;
    nomeCompleto: string;
    telefone: string;
    email: string;
  };
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
  }>;
  totalItems: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

interface OrderManagerProps {
  accessToken: string;
}

export default function OrderManager({ accessToken }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all'
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar pedidos');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir pedido');
      }

      toast.success('Pedido excluído com sucesso');
      loadOrders();
      setShowDetails(false);
      setSelectedOrders([]);
    } catch (error: any) {
      console.error('Erro ao excluir pedido:', error);
      toast.error('Erro ao excluir pedido');
    }
  };

  const deleteBulkOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Nenhum pedido selecionado');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir ${selectedOrders.length} pedido(s)?`)) return;

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const orderId of selectedOrders) {
        try {
          const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} pedido(s) excluído(s) com sucesso`);
      }
      if (errorCount > 0) {
        toast.error(`Erro ao excluir ${errorCount} pedido(s)`);
      }

      loadOrders();
      setSelectedOrders([]);
    } catch (error: any) {
      console.error('Erro ao excluir pedidos em massa:', error);
      toast.error('Erro ao excluir pedidos em massa');
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    try {
      console.log(`[OrderManager] Atualizando status do pedido ${orderId} para ${status}`);

      const url = `${API_URL}/admin/orders/${orderId}/status`;
      console.log(`[OrderManager] URL: ${url}`);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      console.log(`[OrderManager] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[OrderManager] Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao atualizar status');
      }

      const data = await response.json();
      console.log('[OrderManager] Status atualizado com sucesso:', data);

      toast.success('Status atualizado com sucesso');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error: any) {
      console.error('[OrderManager] Erro ao atualizar status:', error);
      console.error('[OrderManager] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      if (error.message === 'Failed to fetch') {
        toast.error('Erro de conexão. Verifique se o servidor está acessível.');
      } else {
        toast.error(`Erro ao atualizar status: ${error.message}`);
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.cnpj.includes(searchTerm) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Contadores por status
  const pendingCount = orders.filter((order) => order.status === 'pending').length;
  const approvedCount = orders.filter((order) => order.status === 'approved').length;
  const rejectedCount = orders.filter((order) => order.status === 'rejected').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            <XCircle className="w-3 h-3" />
            Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Pedidos</h2>
          <p className="text-gray-500">Gerencie todos os pedidos recebidos</p>
        </div>
        <button
          onClick={loadOrders}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
        >
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por ID, nome, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none appearance-none bg-white"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{filteredOrders.length}</span> pedidos
            encontrados
          </p>
        </div>
      </div>

      {/* Contadores de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pendentes */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Pedidos Pendentes</p>
              <p className="text-3xl font-black text-yellow-600 mt-2">{pendingCount}</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-full">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Aprovados */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Pedidos Aprovados</p>
              <p className="text-3xl font-black text-green-600 mt-2">{approvedCount}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Rejeitados */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Pedidos Rejeitados</p>
              <p className="text-3xl font-black text-red-600 mt-2">{rejectedCount}</p>
            </div>
            <div className="p-4 bg-red-100 rounded-full">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Ações em Massa */}
      {selectedOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 text-white rounded-2xl shadow-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5" />
              <span className="font-bold">{selectedOrders.length} pedido(s) selecionado(s)</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedOrders([])}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition"
              >
                Limpar Seleção
              </button>
              <button
                onClick={deleteBulkOrders}
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Selecionados
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title={
                        selectedOrders.length === filteredOrders.length
                          ? 'Desmarcar todos'
                          : 'Selecionar todos'
                      }
                    >
                      {selectedOrders.length === filteredOrders.length ? (
                        <CheckSquare className="w-5 h-5 text-red-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    ID / Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Itens
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelectOrder(order.id)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        {selectedOrders.includes(order.id) ? (
                          <CheckSquare className="w-5 h-5 text-red-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm font-bold text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{order.customer.nomeCompleto}</p>
                        <p className="text-xs text-gray-500">{order.customer.cnpj}</p>
                        <p className="text-xs text-gray-500">{order.customer.telefone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-red-600">{order.totalItems} itens</p>
                      <p className="text-xs text-gray-500">{order.items.length} produtos</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {showDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black mb-2">Detalhes do Pedido</h3>
                    <p className="font-mono text-sm opacity-90">ID: {selectedOrder.id}</p>
                    <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-black text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    Dados do Cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">CNPJ</p>
                        <p className="font-bold text-gray-900">{selectedOrder.customer.cnpj}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Nome</p>
                        <p className="font-bold text-gray-900">
                          {selectedOrder.customer.nomeCompleto}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Telefone</p>
                        <p className="font-bold text-gray-900">{selectedOrder.customer.telefone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">E-mail</p>
                        <p className="font-bold text-gray-900">{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="font-black text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-red-600" />
                    Produtos
                  </h4>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-black text-gray-700">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-black text-gray-700">
                            Produto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-black text-gray-700">
                            SKU
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-700">
                            Qtd
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                            <td className="px-4 py-3 text-right font-bold text-red-600">
                              {item.quantity}x
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 bg-red-50 rounded-xl p-4 flex justify-between items-center border-2 border-red-200">
                    <span className="font-bold text-gray-700">Total de Itens:</span>
                    <span className="text-2xl font-black text-red-600">
                      {selectedOrder.totalItems}
                    </span>
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <h4 className="font-black text-lg text-gray-900 mb-4">Status do Pedido</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
                        selectedOrder.status === 'pending'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Pendente
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'approved')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
                        selectedOrder.status === 'approved'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => {
                        setRejectingOrderId(selectedOrder.id);
                        setShowRejectModal(true);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
                        selectedOrder.status === 'rejected'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Pedido
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Order Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black mb-2">Rejeitar Pedido</h3>
                    <p className="font-mono text-sm opacity-90">ID: {rejectingOrderId}</p>
                  </div>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Rejection Reason */}
                <div>
                  <h4 className="font-black text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-red-600" />
                    Motivo da Rejeição
                  </h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Digite o motivo da rejeição..."
                    className="w-full h-24 pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (rejectingOrderId) {
                        updateOrderStatus(rejectingOrderId, 'rejected');
                        setShowRejectModal(false);
                      }
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeitar Pedido
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

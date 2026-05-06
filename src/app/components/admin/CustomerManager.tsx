import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Mail, Phone, Building2, ShoppingCart, Calendar, Loader2 } from 'lucide-react';
import { projectId } from '../../../../utils/supabase/info';

interface Customer {
  cnpj: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
  totalOrders: number;
}

interface CustomerManagerProps {
  accessToken: string;
}

export default function CustomerManager({ accessToken }: CustomerManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.nomeCompleto.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      customer.cnpj.includes(search) ||
      customer.telefone.includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-pink-400" />
          Clientes
        </h2>
        <div className="text-gray-400 text-sm">
          Total: <span className="font-bold text-white">{customers.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, email, CNPJ ou telefone..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.cnpj}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{customer.nomeCompleto}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <ShoppingCart className="w-3 h-3" />
                      <span>
                        {customer.totalOrders} pedido{customer.totalOrders !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-500 text-xs block">CNPJ</span>
                    <p className="text-gray-300 font-mono text-sm">{customer.cnpj}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-500 text-xs block">Email</span>
                    <p className="text-gray-300 text-sm break-all">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-500 text-xs block">Telefone</span>
                    <p className="text-gray-300 text-sm">{customer.telefone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-gray-500 text-xs block">Cadastrado em</span>
                    <p className="text-gray-300 text-sm">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>

                {customer.updatedAt && customer.updatedAt !== customer.createdAt && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs block">Último pedido</span>
                      <p className="text-gray-300 text-sm">{formatDate(customer.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

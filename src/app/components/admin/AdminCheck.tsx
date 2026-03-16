import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, User, Mail, Key } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface AdminCheckProps {
  accessToken: string;
  onAdminVerified: () => void;
  onNotAdmin: () => void;
}

export default function AdminCheck({ accessToken, onAdminVerified, onNotAdmin }: AdminCheckProps) {
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [promoting, setPromoting] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ token: accessToken })
      });

      const data = await res.json();
      setAdminStatus(data);

      if (data.isAdmin) {
        onAdminVerified();
      }
    } catch (error) {
      toast.error('Erro ao verificar status de admin');
      onNotAdmin();
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    setPromoting(true);
    try {
      const res = await fetch(`${API_URL}/admin/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          token: accessToken,
          name: adminStatus?.email || 'Admin',
          force: false
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Você foi promovido a administrador!');
        onAdminVerified();
      } else {
        toast.error(data.error || 'Erro ao promover usuário');
      }
    } catch (error) {
      toast.error('Erro ao promover usuário');
    } finally {
      setPromoting(false);
    }
  };

  const handleForcePromote = async () => {
    if (!confirm('Isso irá promover você a admin MESMO que existam outros admins. Continuar?')) {
      return;
    }

    setPromoting(true);
    try {
      const res = await fetch(`${API_URL}/admin/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          token: accessToken,
          name: adminStatus?.email || 'Admin',
          force: true
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Você foi promovido a administrador!');
        onAdminVerified();
      } else {
        toast.error(data.error || 'Erro ao promover usuário');
      }
    } catch (error) {
      toast.error('Erro ao promover usuário');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!adminStatus) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Erro ao Verificar Permissões
          </h2>
          <button
            onClick={onNotAdmin}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  if (!adminStatus.isAdmin && !adminStatus.canPromote) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-8 max-w-md w-full"
        >
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Acesso Negado
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Usuário</span>
              </div>
              <p className="text-white font-mono text-sm break-all">{adminStatus.userId}</p>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="text-white">{adminStatus.email}</p>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">
                <strong>Motivo:</strong> Já existe um administrador cadastrado no sistema.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Total de admins: {adminStatus.totalAdmins}
              </p>
            </div>

            {/* DEBUG INFO */}
            <details className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
              <summary className="text-yellow-400 text-sm font-mono cursor-pointer">
                🔍 DEBUG: Ver dados completos
              </summary>
              <pre className="text-xs text-gray-300 mt-3 overflow-auto max-h-60">
                {JSON.stringify(adminStatus, null, 2)}
              </pre>
            </details>
          </div>

          <button
            onClick={onNotAdmin}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar ao Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (!adminStatus.isAdmin && adminStatus.canPromote) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-8 max-w-md w-full"
        >
          <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Primeiro Acesso Administrativo
          </h2>
          <p className="text-gray-400 text-center mb-6">
            Nenhum administrador foi configurado ainda. Você pode se tornar o primeiro admin do sistema.
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Seu ID</span>
              </div>
              <p className="text-white font-mono text-sm break-all">{adminStatus.userId}</p>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Seu Email</span>
              </div>
              <p className="text-white">{adminStatus.email}</p>
            </div>

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Key className="w-4 h-4" />
                <span className="text-sm font-semibold">Permissões Admin</span>
              </div>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Gerenciar produtos e categorias</li>
                <li>• Gerenciar banners e catálogo</li>
                <li>• Acesso total ao dashboard</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handlePromote}
            disabled={promoting}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {promoting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Promovendo...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Tornar-me Administrador
              </>
            )}
          </button>

          <button
            onClick={handleForcePromote}
            disabled={promoting}
            className="w-full mt-3 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Promover Forçadamente
          </button>

          <button
            onClick={onNotAdmin}
            disabled={promoting}
            className="w-full mt-3 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </motion.div>
      </div>
    );
  }

  // Should not reach here (isAdmin = true)
  return null;
}
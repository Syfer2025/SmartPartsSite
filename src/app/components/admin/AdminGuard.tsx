import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, ArrowLeft } from 'lucide-react';
import { supabase } from '../../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface AdminGuardProps {
  children: React.ReactNode;
  onNavigate?: (page: string) => void;
}

/**
 * AdminGuard - Componente de proteção de rotas administrativas.
 * Verifica se o usuário está autenticado E se é admin antes de renderizar o conteúdo.
 * Usado para proteger rotas como /debug, /seed e /docs.
 */
export default function AdminGuard({ children, onNavigate }: AdminGuardProps) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'denied'>('loading');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // 1. Verificar se tem sessão ativa
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setStatus('denied');
        return;
      }

      // 2. Verificar se é admin no backend
      const res = await fetch(`${API_URL}/admin/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ token: session.access_token })
      });

      const data = await res.json();

      if (data.isAdmin) {
        setStatus('authenticated');
      } else {
        setStatus('denied');
      }
    } catch (error) {
      setStatus('denied');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full mx-auto mb-4"
          />
          <div className="flex items-center gap-2 justify-center mb-2">
            <Shield className="w-5 h-5 text-red-500" />
            <p className="text-white font-semibold">Verificando permissões...</p>
          </div>
          <p className="text-gray-500 text-sm">Autenticação necessária para acessar esta página</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <ShieldAlert className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-black text-white mb-3">
              Acesso Restrito
            </h2>
            <p className="text-gray-400 mb-2">
              Esta página requer autenticação de administrador.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Faça login no painel administrativo para acessar esta funcionalidade.
            </p>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('admin');
                  } else {
                    window.location.href = '/admin';
                  }
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Ir para o Login Admin
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('home');
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar ao Site
              </motion.button>
            </div>
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            SMART PARTS IMPORT - Área Administrativa Protegida
          </p>
        </motion.div>
      </div>
    );
  }

  // Autenticado como admin - renderiza o conteúdo protegido
  return <>{children}</>;
}

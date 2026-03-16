import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../../../../utils/supabase/info';

export default function AdminReset() {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [adminList, setAdminList] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  const handleListAdmins = async () => {
    setLoadingList(true);
    try {
      console.log('[List] 📋 Buscando lista de admins...');
      
      const res = await fetch(`${API_URL}/admin/list-all`, {
        method: 'GET',
      });

      const data = await res.json();
      console.log('[List] Resultado:', data);
      
      setAdminList(data);
      toast.success(`${data.total} admin(s) encontrado(s)`);
    } catch (error) {
      console.error('[List] Erro:', error);
      toast.error('Erro ao listar admins');
    } finally {
      setLoadingList(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      console.log('[Delete] 🗑️ Deletando admin:', adminId);
      
      const res = await fetch(`${API_URL}/admin/delete-by-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId })
      });

      const data = await res.json();
      console.log('[Delete] Resultado:', data);
      
      if (data.wasDeleted) {
        toast.success('Admin deletado com sucesso!');
        handleListAdmins(); // Refresh list
      } else {
        toast.error('Erro ao deletar admin');
      }
    } catch (error) {
      console.error('[Delete] Erro:', error);
      toast.error('Erro ao deletar admin');
    }
  };

  const handleReset = async () => {
    if (!confirmed) {
      toast.error('Confirme que deseja resetar o sistema');
      return;
    }

    setLoading(true);
    try {
      console.log('[Reset] 🚨 Iniciando reset de admins...');
      
      const res = await fetch(`${API_URL}/admin/reset-all-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();
      console.log('[Reset] Resultado:', data);
      
      setResult(data);

      if (data.success) {
        toast.success(`✅ ${data.removedCount} admin(s) removido(s)!`);
      } else {
        toast.error('Erro ao resetar admins');
      }
    } catch (error) {
      console.error('[Reset] Erro:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-8 max-w-md w-full border-2 border-red-600/30"
      >
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Reset do Sistema Admin
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Esta ação irá remover <strong className="text-red-400">TODOS</strong> os administradores cadastrados no sistema.
        </p>

        {result && (
          <div className="mb-6 bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Reset Concluído!</span>
            </div>
            <p className="text-sm text-gray-300">
              • Admins removidos: <strong>{result.removedCount}</strong>
            </p>
            <p className="text-sm text-gray-300">
              • Admins restantes: <strong>{result.remainingCount}</strong>
            </p>
            <p className="text-sm text-green-400 mt-3">
              Agora você pode criar uma nova conta admin!
            </p>
          </div>
        )}

        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-2">⚠️ Aviso Importante</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Todos os admins serão removidos</li>
            <li>• Você precisará criar um novo admin</li>
            <li>• Esta ação não pode ser desfeita</li>
          </ul>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-2 focus:ring-red-600"
            />
            <span className="text-white">
              Confirmo que desejo resetar o sistema
            </span>
          </label>
        </div>

        <button
          onClick={handleReset}
          disabled={loading || !confirmed}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Resetando...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              Resetar Sistema Admin
            </>
          )}
        </button>

        <a
          href="/admin"
          className="block w-full text-center bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Voltar ao Admin
        </a>

        {/* Lista de Admins */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleListAdmins}
            disabled={loadingList}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mb-4 flex items-center justify-center gap-2"
          >
            {loadingList ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Carregando...
              </>
            ) : (
              'Ver Lista de Admins no Banco'
            )}
          </button>

          {adminList && (
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-3">
                📋 Admins Encontrados: {adminList.total}
              </h3>
              
              {adminList.total === 0 ? (
                <p className="text-green-400 text-sm">
                  ✅ Nenhum admin encontrado! Você pode criar uma conta nova.
                </p>
              ) : (
                <div className="space-y-3">
                  {adminList.admins.map((admin: any, idx: number) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{admin.email}</p>
                          <p className="text-xs text-gray-400 font-mono truncate">{admin.id}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Criado: {new Date(admin.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-white font-semibold mb-2">📋 Próximos Passos:</h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Clique em "Resetar Sistema Admin"</li>
            <li>Volte para a tela de login</li>
            <li>Clique em "Criar Conta"</li>
            <li>Preencha seus dados</li>
            <li>Você será o novo admin! 🎉</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
}
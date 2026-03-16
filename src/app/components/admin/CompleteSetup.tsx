import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export default function CompleteSetup() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  const handleSetup = async () => {
    setLoading(true);
    try {
      console.log('[CompleteSetup] 🚀 Iniciando setup completo...');
      
      const res = await fetch(`${API_URL}/admin/complete-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        },
        body: JSON.stringify({
          email: 'alexmeira@protonmail.com',
          password: 'Gouranga22',
          name: 'Alex Meira'
        })
      });

      const data = await res.json();
      console.log('[CompleteSetup] Resultado completo:', data);
      console.log('[CompleteSetup] Status HTTP:', res.status);
      
      setResult({
        ...data,
        httpStatus: res.status,
        httpStatusText: res.statusText,
        fullResponse: JSON.stringify(data, null, 2)
      });

      if (data.success) {
        console.log('[CompleteSetup] ✅ Setup completo!');
        toast.success('Admin criado com sucesso!');
        setSuccess(true);
      } else {
        console.error('[CompleteSetup] ❌ Erro:', data.error);
        toast.error(data.error || 'Erro no setup');
        setResult({ ...data, fullError: JSON.stringify(data, null, 2) });
      }
    } catch (error) {
      console.error('[CompleteSetup] ❌ Erro ao conectar:', error);
      toast.error('Erro ao conectar com servidor: ' + (error instanceof Error ? error.message : String(error)));
      setResult({ error: 'Erro de conexão', details: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-8 max-w-md w-full border-2 border-blue-600/30"
      >
        {success ? (
          <>
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Setup Completo! ✅
            </h1>
            <p className="text-gray-400 text-center mb-6">
              Sua conta admin foi criada com sucesso!
            </p>

            {result && (
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-300">
                  <strong>Email:</strong> {result.email}
                </p>
                <p className="text-sm text-gray-300">
                  <strong>User ID:</strong> {result.userId}
                </p>
                <p className="text-sm text-green-400 mt-2">
                  ✅ Registrado como admin: {result.adminRegistered ? 'SIM' : 'NÃO'}
                </p>
              </div>
            )}

            <a
              href="/admin"
              className="block w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Fazer Login
            </a>
          </>
        ) : (
          <>
            <Rocket className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Setup Inicial do Sistema
            </h1>
            <p className="text-gray-400 text-center mb-6">
              Clique no botão abaixo para criar a conta admin automaticamente.
            </p>

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-6">
              <h3 className="text-blue-400 font-semibold mb-2">📋 O que será feito:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✅ Remover todos os admins antigos</li>
                <li>✅ Criar conta: alexmeira@protonmail.com</li>
                <li>✅ Registrar como admin no sistema</li>
              </ul>
            </div>

            {result && !result.success && (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6 max-h-96 overflow-auto">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">ERRO COMPLETO</span>
                </div>
                <div className="text-xs text-gray-300 space-y-2">
                  <p><strong>Status HTTP:</strong> {result.httpStatus} {result.httpStatusText}</p>
                  <p><strong>Mensagem:</strong> {result.error || 'Sem mensagem'}</p>
                  {result.details && (
                    <div>
                      <strong>Detalhes:</strong>
                      <pre className="bg-black/30 p-2 rounded mt-1 overflow-auto text-xs">
                        {result.details}
                      </pre>
                    </div>
                  )}
                  <div>
                    <strong>Resposta Completa:</strong>
                    <pre className="bg-black/30 p-2 rounded mt-1 overflow-auto text-xs">
                      {result.fullResponse || JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Criar Admin Automaticamente
                </>
              )}
            </button>

            <a
              href="/admin"
              className="block w-full text-center bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Voltar ao Admin
            </a>
          </>
        )}
      </motion.div>
    </div>
  );
}
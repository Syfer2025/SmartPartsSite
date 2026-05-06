import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Server, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface ConnectionStatusProps {
  accessToken: string;
}

export default function ConnectionStatus({ accessToken }: ConnectionStatusProps) {
  const [checks, setChecks] = useState<{
    client: 'pending' | 'success' | 'error';
    server: 'pending' | 'success' | 'error';
    database: 'pending' | 'success' | 'error';
  }>({
    client: 'pending',
    server: 'pending',
    database: 'pending',
  });

  const [details, setDetails] = useState<{
    client?: string;
    server?: string;
    database?: string;
  }>({});

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    setChecks({ client: 'pending', server: 'pending', database: 'pending' });
    setDetails({});

    // 1. Check Supabase Client
    try {
      // Use the singleton instance to avoid "Multiple GoTrueClient instances" warning
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      setChecks((prev) => ({ ...prev, client: 'success' }));
    } catch (error: any) {
      console.error('Client check failed:', error);
      setChecks((prev) => ({ ...prev, client: 'error' }));
      setDetails((prev) => ({ ...prev, client: error.message }));
    }

    // 2. Check Backend Server (Edge Function)
    try {
      // Must include Authorization header with publicAnonKey for all Edge Function requests
      const res = await fetch(`${API_URL}/health`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error('Health check returned not ok');
      setChecks((prev) => ({ ...prev, server: 'success' }));
    } catch (error: any) {
      console.error('Server check failed:', error);
      setChecks((prev) => ({ ...prev, server: 'error' }));
      setDetails((prev) => ({ ...prev, server: error.message }));
    }

    // 3. Check Database (via Server)
    try {
      // Use a lightweight endpoint that requires DB access
      const res = await fetch(`${API_URL}/admin/categories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      await res.json(); // Ensure valid JSON
      setChecks((prev) => ({ ...prev, database: 'success' }));
    } catch (error: any) {
      console.error('Database check failed:', error);
      setChecks((prev) => ({ ...prev, database: 'error' }));
      setDetails((prev) => ({ ...prev, database: error.message }));
    }
  };

  const renderStatus = (
    status: 'pending' | 'success' | 'error',
    label: string,
    description: string,
    detail?: string
  ) => {
    return (
      <div
        className={`flex items-start justify-between p-4 rounded-xl border ${
          status === 'success'
            ? 'bg-green-500/5 border-green-500/20'
            : status === 'error'
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-yellow-500/5 border-yellow-500/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {status === 'pending' && <Loader className="w-5 h-5 text-yellow-400 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
            {status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
          </div>
          <div>
            <h4 className="text-white font-medium">{label}</h4>
            <p className="text-gray-400 text-sm mt-0.5">{description}</p>
            {detail && (
              <div className="mt-2 flex items-start gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{detail}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              status === 'success'
                ? 'bg-green-500/20 text-green-400'
                : status === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {status === 'pending' ? 'VERIFICANDO' : status === 'success' ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Server className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Status do Sistema</h2>
            <p className="text-gray-400">Verificação de conectividade com Supabase</p>
          </div>
        </div>
        <button
          onClick={runChecks}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Verificar Novamente
        </button>
      </div>

      <div className="space-y-4">
        {renderStatus(
          checks.client,
          'Cliente Supabase',
          'Conexão direta do navegador com os serviços de Auth do Supabase',
          details.client
        )}
        {renderStatus(
          checks.server,
          'Servidor Backend (Edge Function)',
          'Disponibilidade da API do servidor intermediário',
          details.server
        )}
        {renderStatus(
          checks.database,
          'Banco de Dados (KV Store)',
          'Leitura e escrita no banco de dados via servidor',
          details.database
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Informações de Debug</h4>
        <div className="space-y-1 text-xs font-mono text-gray-500">
          <p>Project ID: {projectId}</p>
          <p>API URL: {API_URL}</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}

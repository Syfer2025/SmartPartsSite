import React, { useState } from 'react';
import { Database, Upload, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// Sample data for seeding
const sampleCategories = [
  {
    name: 'Refrigeração',
    slug: 'refrigeracao',
    description: 'Geladeiras, freezers e componentes de refrigeração para caminhões.',
    icon: '❄️'
  },
  {
    name: 'Climatização',
    slug: 'climatizacao',
    description: 'Ar condicionado, climatizadores e ventiladores.',
    icon: '🌬️'
  },
  {
    name: 'Freios',
    slug: 'freios',
    description: 'Válvulas, cuícas, lonas e tambores de freio.',
    icon: '🛑'
  },
  {
    name: 'Suspensão',
    slug: 'suspensao',
    description: 'Bolsas de ar, amortecedores e molas.',
    icon: '🚛'
  },
  {
    name: 'Iluminação',
    slug: 'iluminacao',
    description: 'Faróis, lanternas, LEDs e lâmpadas.',
    icon: '💡'
  },
  {
    name: 'Acessórios',
    slug: 'acessorios',
    description: 'Acessórios internos e externos para cabine.',
    icon: '🔧'
  }
];

const sampleProducts = [
  {
    name: 'Geladeira Portátil 45L Bivolt',
    category: 'Refrigeração',
    categorySlug: 'refrigeracao',
    sku: 'GEL-45L-001',
    description: 'Geladeira portátil de 45 litros, funciona em 12V e 24V. Ideal para viagens longas. Baixo consumo de energia e congelamento rápido até -20°C.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    specifications: [
      { key: 'Capacidade', value: '45 Litros' },
      { key: 'Voltagem', value: '12V / 24V' },
      { key: 'Temperatura', value: '+20°C a -20°C' },
      { key: 'Consumo', value: '45W' }
    ]
  },
  {
    name: 'Ar Condicionado de Teto 24V',
    category: 'Climatização',
    categorySlug: 'climatizacao',
    sku: 'AC-24V-TETO',
    description: 'Ar condicionado elétrico de teto para caminhões. Funciona com motor desligado. Instalação universal.',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800',
    specifications: [
      { key: 'Voltagem', value: '24V' },
      { key: 'Potência', value: '2500W' },
      { key: 'Gás', value: 'R134a Ecológico' },
      { key: 'Controle Remoto', value: 'Sim' }
    ]
  },
  {
    name: 'Kit Freio a Ar Completo',
    category: 'Freios',
    categorySlug: 'freios',
    sku: 'FRE-KIT-001',
    description: 'Kit completo de freio a ar para carretas. Inclui válvulas, conexões e tubulação. Alta durabilidade e segurança.',
    image: 'https://images.unsplash.com/photo-1486262715619-01b80258e0a5?auto=format&fit=crop&q=80&w=800',
    specifications: [
      { key: 'Compatibilidade', value: 'Universal' },
      { key: 'Material', value: 'Aço / Latão' },
      { key: 'Pressão Max', value: '10 bar' }
    ]
  },
  {
    name: 'Bolsa de Ar Suspensão Dianteira',
    category: 'Suspensão',
    categorySlug: 'suspensao',
    sku: 'SUS-BOL-D01',
    description: 'Bolsa de ar reforçada para suspensão dianteira de caminhões pesados. Maior conforto e estabilidade.',
    image: 'https://images.unsplash.com/photo-1517055729445-41e9200cff0c?auto=format&fit=crop&q=80&w=800',
    specifications: [
      { key: 'Posição', value: 'Dianteira' },
      { key: 'Carga Max', value: '5000 kg' },
      { key: 'Garantia', value: '1 ano' }
    ]
  },
  {
    name: 'Farol de Milha LED 60W',
    category: 'Iluminação',
    categorySlug: 'iluminacao',
    sku: 'LED-MIL-60W',
    description: 'Par de faróis de milha em LED de alta potência. Corpo em alumínio e lente de policarbonato. Resistente à água IP67.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    specifications: [
      { key: 'Potência', value: '60W' },
      { key: 'Voltagem', value: '10V - 30V' },
      { key: 'Temperatura Cor', value: '6000K (Branco Frio)' },
      { key: 'Proteção', value: 'IP67' }
    ]
  },
  {
    name: 'Kit Ferramentas Profissional',
    category: 'Acessórios',
    categorySlug: 'acessorios',
    sku: 'KIT-FER-PRO',
    description: 'Maleta de ferramentas completa para manutenção básica na estrada. 150 peças em aço cromo vanádio.',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=800',
    specifications: [
      { key: 'Peças', value: '150 unidades' },
      { key: 'Material', value: 'Cromo Vanádio' },
      { key: 'Estojo', value: 'Plástico reforçado' }
    ]
  }
];

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleSeed = async () => {
    if (!confirm('ATENÇÃO: Isso irá criar dados de exemplo no banco de dados. Continuar?')) return;

    setLoading(true);
    setLogs([]);
    addLog('🚀 Iniciando processo de seed...');

    try {
      // 1. Criar Categorias
      addLog('📂 Criando categorias...');
      
      // Obter token anônimo para as requisições (assumindo que as rotas admin permitem criação com chave pública ou temos uma rota de seed específica - vamos tentar usar a rota de admin/categories com a chave pública, mas provavelmente falhará se exigir auth. 
      // VAMOS USAR UMA ROTA DE SEED ESPECÍFICA NO BACKEND SE EXISTIR, OU TENTAR CRIAR VIA ENDPOINTS PÚBLICOS SE POSSÍVEL (NÃO É).
      // SOLUÇÃO: Vamos tentar usar a rota /admin/categories e /admin/products. Se falhar por 401, avisaremos o usuário que ele precisa estar logado como admin ou usaremos um "hack" se o backend permitir.
      // DADO O CONTEXTO: O usuário tem o publicAnonKey. Se o backend exigir Bearer token de usuário logado, precisaremos logar primeiro.
      // Mas como é um script de recuperação, vamos tentar a sorte ou instruir o usuário.
      
      // Tentar autenticar anonimamente (ou usar a chave de serviço se estivesse disponível, mas não está).
      // Vamos tentar usar a publicAnonKey como Authorization.
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      };

      // 1. Categorias
      let categoriesCreated = 0;
      for (const cat of sampleCategories) {
        try {
          // Verifica se já existe (opcional, mas bom)
          // Na verdade, vamos apenas tentar criar (POST). Se der erro, logamos.
          const res = await fetch(`${API_URL}/admin/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify(cat)
          });

          if (res.ok) {
            categoriesCreated++;
            addLog(`✅ Categoria criada: ${cat.name}`);
          } else {
            // Se falhar (ex: 401), tentamos uma rota de debug/seed se existir, ou apenas logamos
            const text = await res.text();
            addLog(`❌ Erro ao criar categoria ${cat.name}: ${res.status} - ${text}`);
            if (res.status === 401) {
              throw new Error('Você precisa estar logado como administrador para executar o seed. Faça login primeiro em /admin.');
            }
          }
        } catch (err) {
          addLog(`❌ Exceção na categoria ${cat.name}: ${err}`);
          if ((err as Error).message.includes('logado')) throw err;
        }
      }

      // 2. Produtos
      addLog(`📦 Criando produtos para ${categoriesCreated} categorias...`);
      let productsCreated = 0;
      
      // Transformar specs para o formato esperado pelo backend (array de objetos {key, value} -> Backend espera {id, key, value} ou algo assim?)
      // O ProductManager envia { key, value } no array specs?
      // O ProductManager envia `specifications` como array de {id, key, value}.
      
      for (const prod of sampleProducts) {
        try {
          const productData = {
            ...prod,
            specifications: prod.specifications.map(s => ({
              id: `spec-${Date.now()}-${Math.random()}`,
              ...s
            }))
          };

          const res = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(productData)
          });

          if (res.ok) {
            productsCreated++;
            addLog(`✅ Produto criado: ${prod.name}`);
          } else {
            const text = await res.text();
            addLog(`❌ Erro ao criar produto ${prod.name}: ${res.status} - ${text}`);
          }
        } catch (err) {
          addLog(`❌ Exceção no produto ${prod.name}: ${err}`);
        }
      }

      addLog(`✨ Processo finalizado! Categorias: ${categoriesCreated}, Produtos: ${productsCreated}`);
      toast.success('Seed finalizado!');

    } catch (error: any) {
      addLog(`🛑 ERRO CRÍTICO: ${error.message}`);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Database className="w-10 h-10 text-green-500" />
          <h1 className="text-3xl font-bold">Database Seeder</h1>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" />
            Atenção
          </h2>
          <p className="text-gray-300 mb-4">
            Esta ferramenta irá tentar popular o banco de dados com categorias e produtos de exemplo.
            Use apenas se o banco estiver vazio ou para restaurar dados perdidos.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Nota: É necessário permissão de administrador. Se falhar com erro 401, faça login no /admin primeiro.
          </p>

          <button
            onClick={handleSeed}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Popular Banco de Dados
              </>
            )}
          </button>
        </div>

        <div className="bg-black/50 rounded-xl p-6 border border-gray-800 h-96 overflow-y-auto font-mono text-sm">
          <h3 className="text-gray-500 mb-2 uppercase tracking-wider text-xs">Logs de Execução</h3>
          {logs.length === 0 ? (
            <p className="text-gray-600 italic">Aguardando início...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className={`${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-300'}`}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
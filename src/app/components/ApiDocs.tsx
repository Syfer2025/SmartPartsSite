import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code, 
  Book, 
  Lock, 
  Database, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';

interface EndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth?: boolean;
  params?: { name: string; type: string; required: boolean; description: string; }[];
  requestBody?: string;
  responseExample?: string;
}

const Endpoint = ({ method, path, description, auth, params, requestBody, responseExample }: EndpointProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const methodColors = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500'
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className={`${methodColors[method]} text-white px-3 py-1 rounded text-sm font-semibold min-w-[70px] text-center`}>
            {method}
          </span>
          <code className="text-sm font-mono text-gray-700">{path}</code>
          {auth && <Lock className="w-4 h-4 text-red-600" />}
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700 mb-4">{description}</p>

          {auth && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
              <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Autenticação Necessária</p>
                <p className="text-sm text-yellow-700">Requer token Bearer no header Authorization</p>
              </div>
            </div>
          )}

          {params && params.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Parâmetros</h4>
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Tipo</th>
                      <th className="px-4 py-2 text-left">Obrigatório</th>
                      <th className="px-4 py-2 text-left">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((param, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-4 py-2 font-mono text-blue-600">{param.name}</td>
                        <td className="px-4 py-2 font-mono text-gray-600">{param.type}</td>
                        <td className="px-4 py-2">
                          {param.required ? (
                            <span className="text-red-600 font-semibold">Sim</span>
                          ) : (
                            <span className="text-gray-500">Não</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {requestBody && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Exemplo de Requisição</h4>
                <button
                  onClick={() => copyToClipboard(requestBody, `req-${path}`)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {copied === `req-${path}` ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied === `req-${path}` ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <code>{requestBody}</code>
              </pre>
            </div>
          )}

          {responseExample && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Exemplo de Resposta</h4>
                <button
                  onClick={() => copyToClipboard(responseExample, `res-${path}`)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {copied === `res-${path}` ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied === `res-${path}` ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <code>{responseExample}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'auth' | 'erp'>('overview');

  const baseURL = `https://{projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-3xl"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Documentação da API</h1>
          </div>
          <p className="text-xl text-gray-300">
            Smart Parts Import - Integração com Sistemas Externos
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Book },
              { id: 'products', label: 'Produtos', icon: Database },
              { id: 'categories', label: 'Categorias', icon: Database },
              { id: 'auth', label: 'Autenticação', icon: Lock },
              { id: 'erp', label: 'Integração ERP', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introdução</h2>
              <p className="text-gray-700 mb-4">
                Esta API REST permite integrar sistemas externos (como ERPs) com o catálogo de produtos da Smart Parts Import.
                A API fornece endpoints para consultar produtos, categorias, e gerenciar dados através de autenticação administrativa.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Database className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">REST API</h3>
                  <p className="text-sm text-gray-600">Interface HTTP padrão com JSON</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Lock className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Segurança</h3>
                  <p className="text-sm text-gray-600">Autenticação via Bearer Token</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Tempo Real</h3>
                  <p className="text-sm text-gray-600">Dados sempre atualizados</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">URL Base</h2>
              <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm mb-4">
                {baseURL}
              </div>
              <p className="text-sm text-gray-600">
                Substitua <code className="bg-gray-100 px-2 py-1 rounded">{'projectId'}</code> pelo ID do seu projeto Supabase.
              </p>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Formato de Resposta</h2>
              <p className="text-gray-700 mb-4">Todas as respostas são em formato JSON.</p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Resposta de Sucesso</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm mb-6">
{`{
  "success": true,
  "data": { ... }
}`}
              </pre>

              <h3 className="font-semibold text-gray-900 mb-2">Resposta de Erro</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`{
  "success": false,
  "error": "Mensagem de erro descritiva"
}`}
              </pre>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Códigos de Status HTTP</h2>
              <div className="space-y-2">
                {[
                  { code: 200, desc: 'Requisição bem-sucedida' },
                  { code: 201, desc: 'Recurso criado com sucesso' },
                  { code: 400, desc: 'Requisição inválida (parâmetros incorretos)' },
                  { code: 401, desc: 'Não autenticado (token ausente ou inválido)' },
                  { code: 403, desc: 'Sem permissão (não é administrador)' },
                  { code: 404, desc: 'Recurso não encontrado' },
                  { code: 500, desc: 'Erro interno do servidor' }
                ].map((status) => (
                  <div key={status.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <code className="font-mono font-semibold text-blue-600 min-w-[50px]">{status.code}</code>
                    <span className="text-gray-700">{status.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limiting</h2>
              <p className="text-gray-700">
                Atualmente não há limites de taxa implementados, mas recomendamos não exceder 100 requisições por minuto
                para garantir a melhor performance.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Endpoints de Produtos</h2>

              <Endpoint
                method="GET"
                path="/products"
                description="Retorna a lista completa de todos os produtos disponíveis no catálogo."
                responseExample={`{
  "products": [
    {
      "id": "1702857600000-abc123",
      "name": "Geladeira Portátil 12V/24V",
      "category": "Refrigeração",
      "categorySlug": "refrigeracao",
      "sku": "GEL-12V-45L",
      "description": "Geladeira portátil com capacidade de 45 litros...",
      "images": [
        "https://storage.exemplo.com/produtos/image1.jpg",
        "https://storage.exemplo.com/produtos/image2.jpg"
      ],
      "specs": [
        {
          "label": "Capacidade",
          "value": "45 Litros"
        },
        {
          "label": "Voltagem",
          "value": "12V/24V"
        }
      ],
      "createdAt": "2024-12-15T10:30:00.000Z",
      "updatedAt": "2024-12-15T10:30:00.000Z"
    }
  ]
}`}
              />

              <Endpoint
                method="GET"
                path="/products/{id}"
                description="Retorna os detalhes de um produto específico pelo ID."
                params={[
                  { name: 'id', type: 'string', required: true, description: 'ID único do produto' }
                ]}
                responseExample={`{
  "product": {
    "id": "1702857600000-abc123",
    "name": "Geladeira Portátil 12V/24V",
    "category": "Refrigeração",
    "categorySlug": "refrigeracao",
    "sku": "GEL-12V-45L",
    "description": "Geladeira portátil com capacidade de 45 litros...",
    "images": [
      "https://storage.exemplo.com/produtos/image1.jpg"
    ],
    "specs": [
      {
        "label": "Capacidade",
        "value": "45 Litros"
      }
    ],
    "createdAt": "2024-12-15T10:30:00.000Z",
    "updatedAt": "2024-12-15T10:30:00.000Z"
  }
}`}
              />

              <Endpoint
                method="GET"
                path="/products/category/{slug}"
                description="Retorna todos os produtos de uma categoria específica."
                params={[
                  { name: 'slug', type: 'string', required: true, description: 'Slug da categoria (ex: refrigeracao)' }
                ]}
                responseExample={`{
  "products": [
    {
      "id": "1702857600000-abc123",
      "name": "Geladeira Portátil 12V/24V",
      "categorySlug": "refrigeracao",
      ...
    }
  ]
}`}
              />

              <Endpoint
                method="POST"
                path="/admin/products"
                description="Cria um novo produto no catálogo. Requer autenticação administrativa."
                auth={true}
                params={[
                  { name: 'name', type: 'string', required: true, description: 'Nome do produto' },
                  { name: 'category', type: 'string', required: true, description: 'Nome da categoria' },
                  { name: 'categorySlug', type: 'string', required: true, description: 'Slug da categoria' },
                  { name: 'sku', type: 'string', required: true, description: 'Código SKU único' },
                  { name: 'description', type: 'string', required: true, description: 'Descrição completa' },
                  { name: 'images', type: 'string[]', required: false, description: 'Array de URLs de imagens' },
                  { name: 'specs', type: 'object[]', required: false, description: 'Array de especificações técnicas' }
                ]}
                requestBody={`POST /admin/products
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json

{
  "name": "Ar Condicionado Caminhão 18000 BTUs",
  "category": "Climatização",
  "categorySlug": "climatizacao",
  "sku": "AC-18K-CAM",
  "description": "Ar condicionado potente para cabines...",
  "images": [
    "https://storage.exemplo.com/produtos/ac-front.jpg",
    "https://storage.exemplo.com/produtos/ac-side.jpg"
  ],
  "specs": [
    {
      "label": "Potência",
      "value": "18000 BTUs"
    },
    {
      "label": "Voltagem",
      "value": "24V"
    },
    {
      "label": "Peso",
      "value": "25 kg"
    }
  ]
}`}
                responseExample={`{
  "success": true,
  "product": {
    "id": "1702857600000-xyz789",
    "name": "Ar Condicionado Caminhão 18000 BTUs",
    "category": "Climatização",
    "categorySlug": "climatizacao",
    "sku": "AC-18K-CAM",
    "description": "Ar condicionado potente para cabines...",
    "images": [...],
    "specs": [...],
    "createdAt": "2024-12-16T14:20:00.000Z",
    "updatedAt": "2024-12-16T14:20:00.000Z"
  }
}`}
              />

              <Endpoint
                method="PUT"
                path="/admin/products/{id}"
                description="Atualiza um produto existente. Requer autenticação administrativa."
                auth={true}
                params={[
                  { name: 'id', type: 'string', required: true, description: 'ID do produto a atualizar' }
                ]}
                requestBody={`PUT /admin/products/1702857600000-xyz789
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json

{
  "description": "Ar condicionado potente e econômico para cabines de caminhão",
  "specs": [
    {
      "label": "Potência",
      "value": "18000 BTUs"
    },
    {
      "label": "Consumo",
      "value": "1.2 kW/h"
    }
  ]
}`}
                responseExample={`{
  "success": true,
  "product": {
    "id": "1702857600000-xyz789",
    "name": "Ar Condicionado Caminhão 18000 BTUs",
    "description": "Ar condicionado potente e econômico...",
    "specs": [...],
    "updatedAt": "2024-12-16T15:45:00.000Z"
  }
}`}
              />

              <Endpoint
                method="DELETE"
                path="/admin/products/{id}"
                description="Remove um produto do catálogo. Requer autenticação administrativa."
                auth={true}
                params={[
                  { name: 'id', type: 'string', required: true, description: 'ID do produto a remover' }
                ]}
                requestBody={`DELETE /admin/products/1702857600000-xyz789
Authorization: Bearer {seu_token_aqui}`}
                responseExample={`{
  "success": true
}`}
              />
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Estrutura do Objeto Product</h2>
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Campo</th>
                      <th className="px-4 py-3 text-left">Tipo</th>
                      <th className="px-4 py-3 text-left">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: 'id', type: 'string', desc: 'Identificador único do produto' },
                      { field: 'name', type: 'string', desc: 'Nome do produto' },
                      { field: 'category', type: 'string', desc: 'Nome da categoria' },
                      { field: 'categorySlug', type: 'string', desc: 'Slug da categoria (URL-friendly)' },
                      { field: 'sku', type: 'string', desc: 'Código SKU único do produto' },
                      { field: 'description', type: 'string', desc: 'Descrição completa do produto' },
                      { field: 'images', type: 'string[]', desc: 'Array de URLs das imagens' },
                      { field: 'specs', type: 'Spec[]', desc: 'Array de especificações técnicas' },
                      { field: 'createdAt', type: 'string', desc: 'Data de criação (ISO 8601)' },
                      { field: 'updatedAt', type: 'string', desc: 'Data da última atualização (ISO 8601)' }
                    ].map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-4 py-3 font-mono text-blue-600">{row.field}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{row.type}</td>
                        <td className="px-4 py-3 text-gray-700">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Spec Object:</strong> <code className="bg-white px-2 py-1 rounded">{'{ label: string, value: string }'}</code>
                </p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Endpoints de Categorias</h2>

              <Endpoint
                method="GET"
                path="/categories"
                description="Retorna a lista completa de todas as categorias disponíveis."
                responseExample={`{
  "categories": [
    {
      "id": "1702857600000",
      "name": "Refrigeração",
      "slug": "refrigeracao",
      "description": "Geladeiras e freezers portáteis para caminhões",
      "image": "https://storage.exemplo.com/categorias/refrigeracao.jpg",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    },
    {
      "id": "1702861200000",
      "name": "Freios",
      "slug": "freios",
      "description": "Sistema de freios e componentes",
      "image": "https://storage.exemplo.com/categorias/freios.jpg",
      "createdAt": "2024-12-01T11:00:00.000Z",
      "updatedAt": "2024-12-01T11:00:00.000Z"
    }
  ]
}`}
              />

              <Endpoint
                method="POST"
                path="/admin/categories"
                description="Cria uma nova categoria. Requer autenticação administrativa."
                auth={true}
                params={[
                  { name: 'name', type: 'string', required: true, description: 'Nome da categoria' },
                  { name: 'slug', type: 'string', required: false, description: 'Slug (gerado automaticamente do nome se não fornecido)' },
                  { name: 'description', type: 'string', required: true, description: 'Descrição da categoria' },
                  { name: 'image', type: 'string', required: false, description: 'URL da imagem da categoria' }
                ]}
                requestBody={`POST /admin/categories
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json

{
  "name": "Eixos e Suspensão",
  "description": "Eixos, suspensões e componentes relacionados",
  "image": "https://storage.exemplo.com/categorias/eixos.jpg"
}`}
                responseExample={`{
  "success": true,
  "category": {
    "id": "1702864800000",
    "name": "Eixos e Suspensão",
    "slug": "eixos-e-suspensao",
    "description": "Eixos, suspensões e componentes relacionados",
    "image": "https://storage.exemplo.com/categorias/eixos.jpg",
    "createdAt": "2024-12-16T14:30:00.000Z",
    "updatedAt": "2024-12-16T14:30:00.000Z"
  }
}`}
              />

              <Endpoint
                method="PUT"
                path="/admin/categories/{slug}"
                description="Atualiza uma categoria existente. Requer autenticação administrativa."
                auth={true}
                params={[
                  { name: 'slug', type: 'string', required: true, description: 'Slug da categoria a atualizar' }
                ]}
                requestBody={`PUT /admin/categories/eixos-e-suspensao
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json

{
  "description": "Eixos, suspensões, molas e componentes relacionados"
}`}
                responseExample={`{
  "success": true,
  "category": {
    "id": "1702864800000",
    "name": "Eixos e Suspensão",
    "slug": "eixos-e-suspensao",
    "description": "Eixos, suspensões, molas e componentes relacionados",
    "updatedAt": "2024-12-16T15:20:00.000Z"
  }
}`}
              />

              <Endpoint
                method="DELETE"
                path="/admin/categories/{slug}"
                description="Remove uma categoria. Não é possível remover categorias que possuem produtos associados."
                auth={true}
                params={[
                  { name: 'slug', type: 'string', required: true, description: 'Slug da categoria a remover' }
                ]}
                requestBody={`DELETE /admin/categories/eixos-e-suspensao
Authorization: Bearer {seu_token_aqui}`}
                responseExample={`{
  "success": true
}

// Erro se categoria tem produtos:
{
  "success": false,
  "error": "Has products"
}`}
              />
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Estrutura do Objeto Category</h2>
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Campo</th>
                      <th className="px-4 py-3 text-left">Tipo</th>
                      <th className="px-4 py-3 text-left">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: 'id', type: 'string', desc: 'Identificador único da categoria' },
                      { field: 'name', type: 'string', desc: 'Nome da categoria' },
                      { field: 'slug', type: 'string', desc: 'Slug da categoria (URL-friendly)' },
                      { field: 'description', type: 'string', desc: 'Descrição da categoria' },
                      { field: 'image', type: 'string', desc: 'URL da imagem da categoria' },
                      { field: 'createdAt', type: 'string', desc: 'Data de criação (ISO 8601)' },
                      { field: 'updatedAt', type: 'string', desc: 'Data da última atualização (ISO 8601)' }
                    ].map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-4 py-3 font-mono text-blue-600">{row.field}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{row.type}</td>
                        <td className="px-4 py-3 text-gray-700">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Autenticação</h2>
              <p className="text-gray-700 mb-6">
                Endpoints administrativos requerem autenticação via Bearer Token. O token é obtido através do login
                no sistema Supabase Auth.
              </p>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">Importante</p>
                    <p className="text-sm text-yellow-700">
                      Nunca compartilhe seus tokens de acesso. Eles dão acesso administrativo completo ao sistema.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Como Obter um Token</h3>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-2">1. Fazer Login no Sistema</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Use suas credenciais de administrador para fazer login através do Supabase Auth:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// JavaScript/TypeScript Example
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://{projectId}.supabase.co',
  '{SUPABASE_ANON_KEY}'
)

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@importadorasmart.com.br',
  password: 'sua_senha_aqui'
})

if (data?.session) {
  const accessToken = data.session.access_token
  console.log('Token:', accessToken)
}`}
                  </pre>
                </div>

                <div className="p-4 bg-gray-50 rounded border-l-4 border-green-500">
                  <p className="font-semibold text-gray-900 mb-2">2. Usar o Token nas Requisições</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Adicione o token no header Authorization de cada requisição administrativa:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// JavaScript/TypeScript Example
const response = await fetch(
  'https://{projectId}.supabase.co/functions/v1/make-server-d06f92b7/admin/products',
  {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    }
  }
)

const data = await response.json()

// cURL Example
curl -X GET \\
  'https://{projectId}.supabase.co/functions/v1/make-server-d06f92b7/admin/products' \\
  -H 'Authorization: Bearer {seu_token_aqui}' \\
  -H 'Content-Type: application/json'`}
                  </pre>
                </div>

                <div className="p-4 bg-gray-50 rounded border-l-4 border-purple-500">
                  <p className="font-semibold text-gray-900 mb-2">3. Renovar Token Quando Expirar</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Tokens têm validade limitada. Implemente lógica de renovação:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Verificar e renovar sessão
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  const accessToken = session.access_token
  // Use o token...
} else {
  // Token expirado, fazer login novamente
  await supabase.auth.signInWithPassword({...})
}`}
                  </pre>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Exemplo Completo de Integração</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Classe de integração com a API Smart Parts
class SmartPartsAPI {
  constructor(projectId, anonKey) {
    this.baseURL = \`https://\${projectId}.supabase.co/functions/v1/make-server-d06f92b7\`
    this.supabase = createClient(\`https://\${projectId}.supabase.co\`, anonKey)
    this.accessToken = null
  }

  async login(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    this.accessToken = data.session.access_token
    return data.session
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Adicionar token para endpoints administrativos
    if (endpoint.startsWith('/admin/')) {
      if (!this.accessToken) {
        throw new Error('Não autenticado. Faça login primeiro.')
      }
      headers['Authorization'] = \`Bearer \${this.accessToken}\`
    }

    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      ...options,
      headers
    })

    return response.json()
  }

  // Métodos públicos (sem autenticação)
  async getProducts() {
    return this.request('/products')
  }

  async getProduct(id) {
    return this.request(\`/products/\${id}\`)
  }

  async getCategories() {
    return this.request('/categories')
  }

  async getProductsByCategory(slug) {
    return this.request(\`/products/category/\${slug}\`)
  }

  // Métodos administrativos (requerem autenticação)
  async createProduct(productData) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  }

  async updateProduct(id, updates) {
    return this.request(\`/admin/products/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteProduct(id) {
    return this.request(\`/admin/products/\${id}\`, {
      method: 'DELETE'
    })
  }
}

// Uso:
const api = new SmartPartsAPI('seu-project-id', 'sua-anon-key')

// Login
await api.login('admin@importadorasmart.com.br', 'senha')

// Criar produto
const newProduct = await api.createProduct({
  name: 'Catraca de Freio Automática',
  category: 'Freios',
  categorySlug: 'freios',
  sku: 'CAT-AUTO-001',
  description: 'Catraca automática para sistemas de freio a ar',
  specs: [
    { label: 'Tipo', value: 'Automática' },
    { label: 'Aplicação', value: 'Freio a ar' }
  ]
})

console.log('Produto criado:', newProduct)`}
              </pre>
            </section>
          </div>
        )}

        {activeTab === 'erp' && (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Guia de Integração ERP</h2>
              <p className="text-gray-700 mb-6">
                Este guia demonstra como integrar seu sistema ERP com a API Smart Parts Import para sincronização
                automática de produtos, categorias e estoque.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <Zap className="w-10 h-10 text-blue-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sincronização Automática</h3>
                  <p className="text-sm text-gray-700">
                    Configure webhooks ou tarefas agendadas para manter seu catálogo sempre atualizado
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <Database className="w-10 h-10 text-green-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dados Centralizados</h3>
                  <p className="text-sm text-gray-700">
                    Mantenha uma única fonte de verdade para seus produtos entre ERP e catálogo online
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Casos de Uso Comuns</h2>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Sincronização Completa de Catálogo</h3>
                  <p className="text-gray-700 mb-3">
                    Sincronize todos os produtos do seu ERP com o catálogo online periodicamente.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`async function syncCatalog() {
  // 1. Buscar produtos do ERP
  const erpProducts = await erpSystem.getProducts()
  
  // 2. Buscar produtos existentes na API
  const { products: apiProducts } = await api.getProducts()
  
  // 3. Criar mapa de produtos existentes por SKU
  const existingBySKU = new Map(
    apiProducts.map(p => [p.sku, p])
  )
  
  // 4. Processar cada produto do ERP
  for (const erpProduct of erpProducts) {
    const existing = existingBySKU.get(erpProduct.sku)
    
    if (existing) {
      // Atualizar produto existente
      await api.updateProduct(existing.id, {
        name: erpProduct.name,
        description: erpProduct.description,
        specs: erpProduct.specs
      })
      console.log(\`✓ Atualizado: \${erpProduct.sku}\`)
    } else {
      // Criar novo produto
      await api.createProduct({
        name: erpProduct.name,
        category: erpProduct.category,
        categorySlug: slugify(erpProduct.category),
        sku: erpProduct.sku,
        description: erpProduct.description,
        specs: erpProduct.specs
      })
      console.log(\`✓ Criado: \${erpProduct.sku}\`)
    }
  }
  
  console.log('Sincronização completa!')
}

// Executar a cada 6 horas
setInterval(syncCatalog, 6 * 60 * 60 * 1000)`}
                  </pre>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Atualização em Tempo Real via Webhooks</h3>
                  <p className="text-gray-700 mb-3">
                    Configure webhooks no seu ERP para atualizar produtos imediatamente quando houver alterações.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Servidor de webhook para receber eventos do ERP
app.post('/webhook/erp/product-updated', async (req, res) => {
  const { action, product } = req.body
  
  try {
    switch (action) {
      case 'created':
        await api.createProduct({
          name: product.name,
          category: product.category,
          categorySlug: slugify(product.category),
          sku: product.sku,
          description: product.description,
          specs: product.specs,
          images: product.images
        })
        break
        
      case 'updated':
        // Buscar produto por SKU
        const { products } = await api.getProducts()
        const existing = products.find(p => p.sku === product.sku)
        
        if (existing) {
          await api.updateProduct(existing.id, {
            name: product.name,
            description: product.description,
            specs: product.specs,
            images: product.images
          })
        }
        break
        
      case 'deleted':
        const { products: allProducts } = await api.getProducts()
        const toDelete = allProducts.find(p => p.sku === product.sku)
        
        if (toDelete) {
          await api.deleteProduct(toDelete.id)
        }
        break
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})`}
                  </pre>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Importação em Lote com Validação</h3>
                  <p className="text-gray-700 mb-3">
                    Importe grandes volumes de produtos com validação e tratamento de erros.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`async function bulkImport(csvFilePath) {
  const csv = require('csv-parser')
  const fs = require('fs')
  
  const products = []
  const errors = []
  
  // Ler CSV
  await new Promise((resolve) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => products.push(row))
      .on('end', resolve)
  })
  
  console.log(\`Importando \${products.length} produtos...\`)
  
  // Processar em lotes de 10
  for (let i = 0; i < products.length; i += 10) {
    const batch = products.slice(i, i + 10)
    
    await Promise.all(batch.map(async (product) => {
      try {
        // Validar dados obrigatórios
        if (!product.name || !product.sku || !product.category) {
          throw new Error('Campos obrigatórios faltando')
        }
        
        // Processar especificações
        const specs = []
        for (const key in product) {
          if (key.startsWith('spec_')) {
            const label = key.replace('spec_', '').replace(/_/g, ' ')
            specs.push({
              label: label.charAt(0).toUpperCase() + label.slice(1),
              value: product[key]
            })
          }
        }
        
        // Criar produto
        await api.createProduct({
          name: product.name,
          category: product.category,
          categorySlug: slugify(product.category),
          sku: product.sku,
          description: product.description || '',
          images: product.images ? product.images.split(',') : [],
          specs
        })
        
        console.log(\`✓ \${product.sku}\`)
        
      } catch (error) {
        errors.push({
          sku: product.sku,
          error: error.message
        })
        console.error(\`✗ \${product.sku}: \${error.message}\`)
      }
    }))
    
    // Delay entre lotes
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Relatório final
  console.log(\`\\n=== RELATÓRIO DE IMPORTAÇÃO ===\`)
  console.log(\`Total: \${products.length}\`)
  console.log(\`Sucesso: \${products.length - errors.length}\`)
  console.log(\`Erros: \${errors.length}\`)
  
  if (errors.length > 0) {
    console.log(\`\\nErros:\`)
    errors.forEach(e => console.log(\`- \${e.sku}: \${e.error}\`))
  }
}

// Uso
bulkImport('./produtos-erp.csv')`}
                  </pre>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Sincronização Bidirecional</h3>
                  <p className="text-gray-700 mb-3">
                    Mantenha sincronização em ambas as direções entre ERP e catálogo online.
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`class BidirectionalSync {
  constructor(api, erpSystem) {
    this.api = api
    this.erp = erpSystem
    this.syncLog = []
  }
  
  async sync() {
    console.log('Iniciando sincronização bidirecional...')
    
    // 1. Buscar dados de ambos os sistemas
    const [apiData, erpData] = await Promise.all([
      this.api.getProducts(),
      this.erp.getProducts()
    ])
    
    const apiProducts = apiData.products
    const erpProducts = erpData
    
    // 2. Criar mapas por SKU
    const apiMap = new Map(apiProducts.map(p => [p.sku, p]))
    const erpMap = new Map(erpProducts.map(p => [p.sku, p]))
    
    // 3. Determinar última modificação por produto
    const allSKUs = new Set([...apiMap.keys(), ...erpMap.keys()])
    
    for (const sku of allSKUs) {
      const apiProduct = apiMap.get(sku)
      const erpProduct = erpMap.get(sku)
      
      if (!apiProduct && erpProduct) {
        // Produto existe apenas no ERP -> criar na API
        await this.createInAPI(erpProduct)
        
      } else if (apiProduct && !erpProduct) {
        // Produto existe apenas na API -> criar no ERP
        await this.createInERP(apiProduct)
        
      } else if (apiProduct && erpProduct) {
        // Produto existe em ambos -> sincronizar mais recente
        const apiDate = new Date(apiProduct.updatedAt)
        const erpDate = new Date(erpProduct.updatedAt)
        
        if (erpDate > apiDate) {
          await this.updateAPI(apiProduct.id, erpProduct)
        } else if (apiDate > erpDate) {
          await this.updateERP(erpProduct.id, apiProduct)
        }
      }
    }
    
    this.generateReport()
  }
  
  async createInAPI(erpProduct) {
    try {
      await this.api.createProduct({
        name: erpProduct.name,
        category: erpProduct.category,
        categorySlug: slugify(erpProduct.category),
        sku: erpProduct.sku,
        description: erpProduct.description,
        specs: erpProduct.specs
      })
      this.log('create-api', erpProduct.sku, 'success')
    } catch (error) {
      this.log('create-api', erpProduct.sku, 'error', error.message)
    }
  }
  
  async createInERP(apiProduct) {
    try {
      await this.erp.createProduct(apiProduct)
      this.log('create-erp', apiProduct.sku, 'success')
    } catch (error) {
      this.log('create-erp', apiProduct.sku, 'error', error.message)
    }
  }
  
  async updateAPI(id, erpProduct) {
    try {
      await this.api.updateProduct(id, {
        name: erpProduct.name,
        description: erpProduct.description,
        specs: erpProduct.specs
      })
      this.log('update-api', erpProduct.sku, 'success')
    } catch (error) {
      this.log('update-api', erpProduct.sku, 'error', error.message)
    }
  }
  
  async updateERP(id, apiProduct) {
    try {
      await this.erp.updateProduct(id, apiProduct)
      this.log('update-erp', apiProduct.sku, 'success')
    } catch (error) {
      this.log('update-erp', apiProduct.sku, 'error', error.message)
    }
  }
  
  log(action, sku, status, error = null) {
    this.syncLog.push({
      timestamp: new Date().toISOString(),
      action,
      sku,
      status,
      error
    })
  }
  
  generateReport() {
    const report = {
      total: this.syncLog.length,
      success: this.syncLog.filter(l => l.status === 'success').length,
      errors: this.syncLog.filter(l => l.status === 'error')
    }
    
    console.log('\\n=== RELATÓRIO DE SINCRONIZAÇÃO ===')
    console.log(\`Total de operações: \${report.total}\`)
    console.log(\`Sucesso: \${report.success}\`)
    console.log(\`Erros: \${report.errors.length}\`)
    
    if (report.errors.length > 0) {
      console.log('\\nErros encontrados:')
      report.errors.forEach(e => {
        console.log(\`- [\${e.action}] \${e.sku}: \${e.error}\`)
      })
    }
    
    return report
  }
}

// Executar sincronização a cada 1 hora
const sync = new BidirectionalSync(api, erpSystem)
setInterval(() => sync.sync(), 60 * 60 * 1000)`}
                  </pre>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Exemplos de Integração por Plataforma</h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    SAP Business One
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Exemplo usando SAP Business One Service Layer
const axios = require('axios')

class SAPConnector {
  constructor(baseURL, companyDB, username, password) {
    this.baseURL = baseURL
    this.companyDB = companyDB
    this.username = username
    this.password = password
    this.sessionId = null
  }
  
  async login() {
    const response = await axios.post(\`\${this.baseURL}/Login\`, {
      CompanyDB: this.companyDB,
      UserName: this.username,
      Password: this.password
    })
    this.sessionId = response.data.SessionId
  }
  
  async getItems() {
    const response = await axios.get(
      \`\${this.baseURL}/Items\`,
      { headers: { Cookie: \`B1SESSION=\${this.sessionId}\` } }
    )
    return response.data.value
  }
  
  async syncToSmartParts(smartPartsAPI) {
    const items = await this.getItems()
    
    for (const item of items) {
      const product = {
        name: item.ItemName,
        sku: item.ItemCode,
        category: item.ItemsGroupCode,
        categorySlug: slugify(item.ItemsGroupCode),
        description: item.User_Text || '',
        specs: [
          { label: 'Código SAP', value: item.ItemCode },
          { label: 'Grupo', value: item.ItemsGroupCode }
        ]
      }
      
      await smartPartsAPI.createProduct(product)
    }
  }
}`}
                  </pre>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-600" />
                    TOTVS Protheus
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Exemplo usando TOTVS Protheus REST API
const soap = require('soap')

class TotvsConnector {
  async getProdutos() {
    const url = 'http://servidor:porta/wsproduct.apw?WSDL'
    const client = await soap.createClientAsync(url)
    
    const result = await client.GetProdutosAsync({
      empresa: '01',
      filial: '0101'
    })
    
    return result[0].produtos
  }
  
  async syncToSmartParts(smartPartsAPI) {
    const produtos = await this.getProdutos()
    
    for (const prod of produtos) {
      await smartPartsAPI.createProduct({
        name: prod.B1_DESC,
        sku: prod.B1_COD,
        category: prod.B1_GRUPO,
        categorySlug: slugify(prod.B1_GRUPO),
        description: prod.B1_DESC_COMPL || prod.B1_DESC,
        specs: [
          { label: 'Tipo', value: prod.B1_TIPO },
          { label: 'Unidade', value: prod.B1_UM },
          { label: 'NCM', value: prod.B1_POSIPI }
        ]
      })
    }
  }
}`}
                  </pre>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    Bling ERP
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Exemplo usando Bling API v3
class BlingConnector {
  constructor(clientId, clientSecret, accessToken) {
    this.baseURL = 'https://api.bling.com.br/Api/v3'
    this.accessToken = accessToken
  }
  
  async getProdutos() {
    const response = await fetch(\`\${this.baseURL}/produtos\`, {
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Accept': 'application/json'
      }
    })
    const data = await response.json()
    return data.data
  }
  
  async syncToSmartParts(smartPartsAPI) {
    const produtos = await this.getProdutos()
    
    for (const prod of produtos) {
      await smartPartsAPI.createProduct({
        name: prod.nome,
        sku: prod.codigo,
        category: prod.categoria?.descricao || 'Geral',
        categorySlug: slugify(prod.categoria?.descricao || 'geral'),
        description: prod.descricao || prod.nome,
        specs: [
          { label: 'Tipo', value: prod.tipo },
          { label: 'Formato', value: prod.formato },
          { label: 'Marca', value: prod.marca }
        ],
        images: prod.imagens?.map(img => img.link) || []
      })
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Boas Práticas</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Implemente retry logic</p>
                    <p className="text-sm text-green-800">
                      Adicione tentativas automáticas com backoff exponencial para lidar com falhas temporárias de rede.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Use processamento em lote</p>
                    <p className="text-sm text-green-800">
                      Processe produtos em lotes de 10-50 itens para melhor performance e gerenciamento de memória.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Mantenha logs detalhados</p>
                    <p className="text-sm text-green-800">
                      Registre todas as operações de sincronização com timestamps, SKUs e status para facilitar debugging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Valide dados antes de enviar</p>
                    <p className="text-sm text-green-800">
                      Sempre valide campos obrigatórios e formatos antes de fazer requisições para evitar erros.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Configure alertas de erro</p>
                    <p className="text-sm text-green-800">
                      Implemente notificações por email ou Slack quando houver falhas na sincronização.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-900">Evite sincronização muito frequente</p>
                    <p className="text-sm text-yellow-800">
                      Sincronizações a cada 1-6 horas são suficientes para a maioria dos casos. Evite polling constante.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-r from-red-900 to-black text-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ExternalLink className="w-6 h-6" />
                Precisa de Ajuda?
              </h2>
              <p className="text-gray-300 mb-4">
                Nossa equipe técnica está disponível para ajudar na integração do seu sistema ERP.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:suporte@importadorasmart.com.br"
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  Contatar Suporte Técnico
                </a>
                <a
                  href="https://wa.me/5544997260058"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                >
                  WhatsApp: (44) 99726-0058
                </a>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-bold text-lg">Smart Parts Import</p>
              <p className="text-gray-400 text-sm">Documentação da API - v1.0</p>
            </div>
            <div className="text-sm text-gray-400">
              <p>© 2024 Smart Parts Import. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

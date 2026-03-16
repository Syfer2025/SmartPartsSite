# Documentação da API - Smart Parts Import

## 📚 Acesso à Documentação

A documentação completa da API está disponível na rota `/docs` do seu site.

### Formas de Acessar:

1. **Direto no navegador:**
   ```
   https://seu-dominio.com/docs
   ```

2. **Pelo Dashboard Administrativo:**
   - Faça login no painel em `/admin`
   - No dashboard principal, clique no card "Documentação API"
   - A documentação será aberta em uma nova aba

## 🚀 O que você encontrará na documentação

### 1. Visão Geral
- Introdução à API REST
- URL base e configuração
- Formatos de requisição e resposta
- Códigos de status HTTP
- Boas práticas

### 2. Endpoints de Produtos
- **GET /products** - Listar todos os produtos
- **GET /products/{id}** - Obter detalhes de um produto
- **GET /products/category/{slug}** - Listar produtos por categoria
- **POST /admin/products** - Criar novo produto (autenticado)
- **PUT /admin/products/{id}** - Atualizar produto (autenticado)
- **DELETE /admin/products/{id}** - Remover produto (autenticado)

### 3. Endpoints de Categorias
- **GET /categories** - Listar todas as categorias
- **POST /admin/categories** - Criar nova categoria (autenticado)
- **PUT /admin/categories/{slug}** - Atualizar categoria (autenticado)
- **DELETE /admin/categories/{slug}** - Remover categoria (autenticado)

### 4. Autenticação
- Como fazer login e obter tokens
- Como usar tokens Bearer nas requisições
- Renovação de tokens expirados
- Exemplos práticos

### 5. Integração ERP
- Casos de uso comuns
- Sincronização completa de catálogo
- Atualização em tempo real via webhooks
- Importação em lote com validação
- Sincronização bidirecional
- Exemplos para SAP, TOTVS e Bling

## 🔑 Autenticação

Endpoints administrativos (que começam com `/admin/`) requerem autenticação via Bearer Token.

### Obter Token:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://{projectId}.supabase.co',
  '{SUPABASE_ANON_KEY}'
)

const { data, error} = await supabase.auth.signInWithPassword({
  email: 'admin@importadorasmart.com.br',
  password: 'sua_senha'
})

const accessToken = data.session.access_token
```

### Usar Token:

```javascript
const response = await fetch(
  'https://{projectId}.supabase.co/functions/v1/make-server-d06f92b7/admin/products',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }
)
```

## 📋 Estrutura de Dados

### Product
```typescript
{
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  sku: string;
  description: string;
  images: string[];
  specs: Array<{
    label: string;
    value: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### Category
```typescript
{
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🔧 Exemplo de Integração Rápida

```javascript
// Classe simples para integração
class SmartPartsAPI {
  constructor(projectId, anonKey) {
    this.baseURL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`
    this.supabase = createClient(`https://${projectId}.supabase.co`, anonKey)
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

  async getProducts() {
    const response = await fetch(`${this.baseURL}/products`)
    return response.json()
  }

  async createProduct(productData) {
    const response = await fetch(`${this.baseURL}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })
    return response.json()
  }
}

// Uso
const api = new SmartPartsAPI('seu-project-id', 'sua-anon-key')
await api.login('admin@importadorasmart.com.br', 'senha')

const newProduct = await api.createProduct({
  name: 'Produto Teste',
  category: 'Categoria',
  categorySlug: 'categoria',
  sku: 'SKU-001',
  description: 'Descrição do produto',
  specs: [
    { label: 'Especificação 1', value: 'Valor 1' }
  ]
})
```

## 💡 Dicas

1. **Rate Limiting**: Não exceda 100 requisições por minuto
2. **Retry Logic**: Implemente tentativas automáticas para falhas temporárias
3. **Logs**: Mantenha logs detalhados de todas as operações de sincronização
4. **Validação**: Sempre valide dados antes de enviar
5. **Processamento em Lote**: Para grandes volumes, processe em lotes de 10-50 itens

## 📞 Suporte

Para suporte técnico na integração:
- **Email**: suporte@importadorasmart.com.br
- **WhatsApp**: (44) 99999-9999

## 🔗 Links Úteis

- Documentação Completa: `/docs`
- Dashboard Admin: `/admin`
- Supabase Docs: https://supabase.com/docs

---

**Smart Parts Import** - Sistema de Integração API v1.0

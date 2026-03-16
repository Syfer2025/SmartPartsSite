# 🔧 Troubleshooting Detalhado - Debug Tool

Guia completo de solução de problemas para cada teste da ferramenta de debug.

---

## 🔴 Teste 1: Configuração Supabase

### Erro: "ProjectId ou PublicAnonKey não configurados"

**Causa:** Variáveis de ambiente não estão definidas

**Solução:**
1. Abra `/utils/supabase/info.tsx`
2. Verifique se `projectId` e `publicAnonKey` estão exportados
3. Verifique se os valores são strings não-vazias

```typescript
export const projectId = "seu-project-id";
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Warning: "ProjectId não parece ser um URL do Supabase"

**Causa:** ProjectId não contém ".supabase.co"

**Solução:**
- Verifique se o projectId está no formato: `xxxxx.supabase.co`
- Se estiver usando domínio customizado, ignore este warning

---

## 🔴 Teste 2: Server Health Check

### Erro: "Servidor retornou status 404"

**Causa:** Rota `/health` não existe no servidor

**Solução:**
1. Abra `/supabase/functions/server/index.tsx`
2. Adicione a rota de health check:

```typescript
// Health check endpoint
app.get('/make-server-d06f92b7/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Smart Parts Import API'
  });
});
```

### Erro: "Servidor retornou status 500"

**Causa:** Erro interno no servidor

**Solução:**
1. Verifique logs do servidor no Supabase Dashboard
2. Execute localmente: `supabase functions serve`
3. Veja console para erros específicos

### Erro: "Failed to fetch" ou "Network error"

**Causa:** Servidor está offline ou CORS bloqueado

**Solução:**
1. Verifique se o servidor está rodando
2. Verifique configuração CORS no servidor:

```typescript
import { cors } from 'npm:hono/cors';

app.use('*', cors({
  origin: '*',
  credentials: true
}));
```

---

## 🔴 Teste 3: Categorias Públicas

### Erro: "Erro 404"

**Causa:** Rota `/categories` não existe

**Solução:**
1. Abra `/supabase/functions/server/index.tsx`
2. Verifique se a rota existe:

```typescript
app.get('/make-server-d06f92b7/categories', async (c) => {
  // código da rota
});
```

### Erro: "Formato de resposta inválido"

**Causa:** Resposta não tem formato esperado

**Solução:**
1. Verifique se a rota retorna:

```typescript
return c.json({
  categories: [/* array de categorias */]
});
```

2. Não pode retornar apenas array direto

### Categorias vazias (total: 0)

**Causa:** Nenhuma categoria cadastrada no banco

**Solução:**
1. Acesse `/admin`
2. Vá para aba "Categorias"
3. Crie pelo menos uma categoria

---

## 🔴 Teste 4: Produtos Públicos

### Erro: "Erro 404"

**Causa:** Rota `/products` não existe

**Solução:**
Similar ao Teste 3, verifique a rota no servidor

### Produtos vazios (total: 0)

**Causa:** Nenhum produto cadastrado

**Solução:**
1. Acesse `/admin`
2. Crie categorias primeiro
3. Crie produtos vinculados às categorias

### Erro: "porCategoria não é objeto"

**Causa:** Produtos sem campo `category`

**Solução:**
1. Verifique banco de dados
2. Certifique-se que todos produtos têm `category` e `categorySlug`

---

## 🔴 Teste 5: Banners

### Erro: "Erro 404"

**Causa:** Rota `/banners` não existe

**Solução:**
Adicione a rota no servidor:

```typescript
app.get('/make-server-d06f92b7/banners', async (c) => {
  const result = await kv.get('banners');
  const banners = result ? JSON.parse(result) : [];
  return c.json({ banners });
});
```

### Banners vazios (total: 0)

**Causa:** Nenhum banner cadastrado

**Solução:**
1. Acesse `/admin`
2. Vá para aba "Banners"
3. Crie pelo menos um banner

---

## 🔴 Teste 6: DataContext

### Erro: "DataContext em erro: [mensagem]"

**Causa:** DataContext detectou erro ao carregar dados

**Solução:**
1. Abra console do navegador (F12)
2. Procure por logs `[DataContext]`
3. Identifique o erro específico
4. Corrija a API que está falhando

### Warning: "DataContext ainda está carregando"

**Causa:** Dados ainda não terminaram de carregar

**Solução:**
- Aguarde alguns segundos
- Execute o teste novamente
- Se persistir, verifique se há erro de rede

### Contagens não batem com API

**Causa:** Cache desatualizado

**Solução:**
1. Limpe cache do navegador
2. Recarregue a página (Ctrl+F5)
3. Execute teste novamente

---

## 🔴 Teste 7: Produto Específico

### Erro: "Nenhum produto disponível para testar"

**Causa:** Nenhum produto no banco

**Solução:**
Cadastre produtos no dashboard admin

### Erro: "Erro 404" ao buscar produto

**Causa:** Rota `/products/:id` não existe

**Solução:**
Adicione a rota no servidor:

```typescript
app.get('/make-server-d06f92b7/products/:id', async (c) => {
  const id = c.req.param('id');
  const result = await kv.get(`product:${id}`);
  if (!result) {
    return c.json({ error: 'Produto não encontrado' }, 404);
  }
  return c.json({ product: JSON.parse(result) });
});
```

### Warning: "specificationsType: object"

**Causa:** Produto ainda no formato antigo

**Solução:**
1. Acesse `/admin`
2. Edite o produto
3. Salve novamente (conversão automática)

---

## 🔴 Teste 8: Produtos por Categoria

### Erro: "Nenhuma categoria disponível"

**Causa:** Sem categorias no banco

**Solução:**
Cadastre categorias primeiro

### Total = 0 para categoria existente

**Causa:** Nenhum produto vinculado à categoria

**Solução:**
1. Crie produtos
2. Vincule à categoria correta
3. Verifique `categorySlug` está correto

### Produtos de outras categorias aparecem

**Causa:** Filtro não funcionando corretamente

**Solução:**
Verifique rota do servidor:

```typescript
app.get('/make-server-d06f92b7/products', async (c) => {
  const categorySlug = c.req.query('category');
  let products = /* buscar todos */;
  
  if (categorySlug) {
    products = products.filter(p => p.categorySlug === categorySlug);
  }
  
  return c.json({ products });
});
```

---

## 🔴 Teste 9: Carregamento de Imagens

### Erro: "Nenhum produto com imagens para testar"

**Causa:** Produtos não têm campo `image`

**Solução:**
1. Edite produtos no admin
2. Faça upload de imagens
3. Salve

### Erro: "Falha ao carregar imagem"

**Causa:** URL da imagem inválida ou inacessível

**Solução:**
1. Verifique URL no navegador
2. Se for Supabase Storage, verifique:
   - Bucket existe
   - Bucket é público ou tem signed URL
   - Arquivo existe no bucket

### Erro: "Timeout ao carregar imagem"

**Causa:** Imagem muito grande (> 5MB) ou conexão lenta

**Solução:**
1. Otimize imagens antes do upload
2. Use formatos comprimidos (WebP, JPEG)
3. Limite tamanho a 1-2MB

---

## 🔴 Teste 10: Estrutura de Dados

### Issue: "categories.categories não existe"

**Causa:** API retorna formato errado

**Solução:**
Certifique-se que a API retorna:

```json
{
  "categories": [/* array */]
}
```

NÃO apenas o array direto.

### Issue: "Categoria sem campo X"

**Causa:** Campos obrigatórios faltando

**Solução:**
Edite categoria no admin e preencha todos os campos:
- name (obrigatório)
- slug (obrigatório)
- icon (obrigatório)
- description (opcional mas recomendado)

### Issue: "Produto sem campo X"

**Causa:** Campos obrigatórios faltando

**Solução:**
Edite produto no admin e preencha:
- id (gerado automaticamente)
- name (obrigatório)
- category (obrigatório)
- categorySlug (obrigatório)
- image (obrigatório)

### Issue: "Produto com specifications como objeto"

**Causa:** Formato antigo (antes da refatoração)

**Solução:**
A conversão é automática ao:
1. Carregar no dashboard
2. Editar produto
3. Salvar produto

---

## 🔴 Teste 11: Sistema de Cache

### Erro: "localStorage não disponível ou bloqueado"

**Causa:** Navegador bloqueia localStorage

**Soluções Possíveis:**

1. **Modo privado/incógnito:** Saia do modo privado

2. **Configurações do navegador:**
   - Chrome: Settings → Privacy → Site Settings → Cookies → Allow
   - Firefox: Preferences → Privacy → Custom → Accept cookies

3. **Extensões:** Desative extensões de privacidade temporariamente

4. **Safari Private Relay:** Pode bloquear storage

### Cache não atualiza

**Causa:** Cache muito antigo

**Solução:**
1. Limpe cache manualmente: Ctrl+Shift+Delete
2. Hard reload: Ctrl+F5
3. Limpe storage no DevTools:
   - F12 → Application → Storage → Clear

---

## 🔴 Teste 12: Performance

### Status: "Lento" (> 3000ms)

**Causas Possíveis:**

1. **Servidor em região distante**
   - Deploy Supabase na região mais próxima

2. **Banco de dados lento**
   - Adicione índices nas colunas de busca
   - Otimize queries

3. **Muitos dados**
   - Implemente paginação
   - Adicione cache server-side

4. **Conexão lenta**
   - Teste em rede diferente
   - Verifique se não há downloads pesados

**Otimizações:**

```typescript
// 1. Cache no servidor
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let cachedData = null;
let cacheTimestamp = 0;

app.get('/products', async (c) => {
  const now = Date.now();
  
  if (cachedData && (now - cacheTimestamp) < CACHE_TIME) {
    return c.json(cachedData);
  }
  
  const data = await loadProducts();
  cachedData = data;
  cacheTimestamp = now;
  
  return c.json(data);
});

// 2. Compressão
import { compress } from 'npm:hono/compress';
app.use('*', compress());
```

### Teste individual muito lento

**Identificar gargalo:**

1. API Latency alto → Problema de rede/servidor
2. Categories Load alto → Problema na query de categorias
3. Products Load alto → Problema na query de produtos

**Solução específica:**
- Otimize a query problemática
- Adicione índice no banco
- Reduza quantidade de dados retornados

---

## 📊 Checklist de Diagnóstico Completo

Quando encontrar erros, siga esta ordem:

### 1. Verificações Básicas
- [ ] Servidor está rodando?
- [ ] Navegador está online?
- [ ] Console tem erros? (F12)
- [ ] Network tab mostra requests? (F12)

### 2. Verificações de Configuração
- [ ] projectId correto?
- [ ] publicAnonKey correto?
- [ ] API_URL correto?
- [ ] CORS habilitado?

### 3. Verificações de Dados
- [ ] Categorias cadastradas?
- [ ] Produtos cadastrados?
- [ ] Banners cadastrados?
- [ ] Especificações em formato correto?

### 4. Verificações de Performance
- [ ] Latência < 3000ms?
- [ ] Cache funcionando?
- [ ] Imagens otimizadas?
- [ ] Queries eficientes?

### 5. Verificações de Estrutura
- [ ] Rotas existem no servidor?
- [ ] Formato de resposta correto?
- [ ] Campos obrigatórios preenchidos?
- [ ] Tipos de dados corretos?

---

## 🆘 Quando Nada Funciona

1. **Reset Completo:**
```bash
# Limpe tudo
rm -rf node_modules
rm package-lock.json

# Reinstale
npm install

# Reinicie servidor
supabase functions serve
```

2. **Verifique Logs:**
```bash
# Console do navegador
F12 → Console

# Logs do servidor
supabase functions logs

# Logs do banco
supabase db logs
```

3. **Compare com Produção:**
- Execute debug em produção
- Compare resultados
- Identifique diferenças

4. **Baixe Resultados:**
- Execute todos os testes
- Baixe arquivo JSON
- Envie para suporte

---

## 📞 Informações Úteis para Suporte

Ao reportar problemas, inclua:

1. ✅ Arquivo JSON dos resultados do debug
2. ✅ Console logs (F12)
3. ✅ Network logs (F12 → Network)
4. ✅ Screenshots dos erros
5. ✅ Passos para reproduzir
6. ✅ Ambiente (local/produção)
7. ✅ Navegador e versão
8. ✅ Sistema operacional

---

Última atualização: 15/12/2024
Versão: 1.0.0

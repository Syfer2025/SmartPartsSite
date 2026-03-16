# 📋 Resultados Esperados - Ferramenta de Debug

Este documento descreve os resultados esperados para cada teste quando o site está funcionando corretamente.

## ✅ 1. Configuração Supabase

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "projectId": "seu-project-id.supabase.co",
  "publicAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "apiUrl": "https://seu-project-id.supabase.co/functions/v1/make-server-d06f92b7"
}
```

**O que verificar:**
- `projectId` deve conter ".supabase.co"
- `publicAnonKey` deve começar com "eyJ"
- `apiUrl` deve estar completa e válida

---

## ✅ 2. Server Health Check

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Smart Parts Import API"
}
```

**O que verificar:**
- Servidor responde HTTP 200
- Propriedade `status` é "ok"
- Timestamp é recente

---

## ✅ 3. Categorias Públicas

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "total": 8,
  "categories": [
    {
      "name": "Geladeiras Portáteis",
      "slug": "geladeiras-portateis",
      "icon": "🧊",
      "description": "Geladeiras 12V/24V"
    },
    // ... mais categorias
  ],
  "sample": [/* primeiras 3 categorias */]
}
```

**O que verificar:**
- `total` > 0
- Array `categories` não está vazio
- Cada categoria tem: name, slug, icon, description

---

## ✅ 4. Produtos Públicos

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "total": 25,
  "products": [
    {
      "id": "uuid-do-produto",
      "name": "Geladeira 12V 45L",
      "category": "Geladeiras Portáteis",
      "categorySlug": "geladeiras-portateis",
      "image": "https://...",
      "description": "...",
      "specifications": [
        { "id": "spec-1", "key": "Voltagem", "value": "12V/24V" }
      ]
    },
    // ... mais produtos
  ],
  "sample": [/* primeiros 3 produtos */],
  "porCategoria": {
    "Geladeiras Portáteis": 5,
    "Ar Condicionado": 3,
    // ... contagem por categoria
  }
}
```

**O que verificar:**
- `total` > 0
- Array `products` não está vazio
- Cada produto tem: id, name, category, categorySlug, image
- `specifications` é um ARRAY (não objeto)
- `porCategoria` mostra distribuição correta

---

## ✅ 5. Banners

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "total": 3,
  "banners": [
    {
      "id": "1",
      "title": "Banner Principal",
      "subtitle": "Peças Premium",
      "image": "https://...",
      "active": true,
      "order": 1
    },
    // ... mais banners
  ]
}
```

**O que verificar:**
- `total` >= 1
- Array `banners` não está vazio
- Cada banner tem: id, title, image
- Banners com `active: true`

---

## ✅ 6. DataContext

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "categoriesCount": 8,
  "productsCount": 25,
  "categories": [/* primeiras 3 categorias em cache */],
  "products": [/* primeiros 3 produtos em cache */]
}
```

**Status Alternativo:** Warning (Amarelo) se loading

**Dados em Loading:**
```json
{
  "status": "loading",
  "warning": "DataContext ainda está carregando"
}
```

**O que verificar:**
- `loading` deve ser `false` após alguns segundos
- `error` deve ser `null`
- Contagens devem bater com API

---

## ✅ 7. Produto Específico

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "productId": "uuid-do-produto",
  "productName": "Geladeira 12V 45L",
  "data": {
    "id": "uuid-do-produto",
    "name": "Geladeira 12V 45L",
    "category": "Geladeiras Portáteis",
    "specifications": [/* array de specs */],
    "images": ["url1", "url2"]
  },
  "hasSpecifications": true,
  "hasImages": true,
  "specificationsType": "array"
}
```

**O que verificar:**
- `hasSpecifications` é `true`
- `specificationsType` é "array" (NÃO "object")
- `hasImages` pode ser true ou false
- Produto completo retornado

---

## ✅ 8. Produtos por Categoria

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "categorySlug": "geladeiras-portateis",
  "categoryName": "Geladeiras Portáteis",
  "total": 5,
  "products": [/* primeiros 3 produtos filtrados */]
}
```

**O que verificar:**
- `total` >= 0
- Todos produtos têm mesmo `categorySlug`
- Array `products` só contém produtos da categoria

---

## ✅ 9. Carregamento de Imagens

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "totalProducts": 25,
  "productsWithImages": 23,
  "testedImageUrl": "https://...",
  "imageTest": {
    "success": true,
    "url": "https://..."
  }
}
```

**O que verificar:**
- `imageTest.success` é `true`
- URL da imagem é válida
- Maioria dos produtos tem imagens

---

## ✅ 10. Estrutura de Dados

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "issues": ["Nenhum problema encontrado"],
  "categoriesStructure": {
    "name": "Geladeiras Portáteis",
    "slug": "geladeiras-portateis",
    "icon": "🧊",
    "description": "..."
  },
  "productsStructure": {
    "id": "uuid",
    "name": "Geladeira 12V",
    "category": "Geladeiras Portáteis",
    "categorySlug": "geladeiras-portateis",
    "image": "https://...",
    "specifications": [/* array */]
  }
}
```

**Status Alternativo:** Warning (Amarelo) se houver avisos

**Possíveis Issues:**
- ❌ "Categoria sem campo name"
- ❌ "Produto sem campo id"
- ❌ "Produto com specifications como objeto (deveria ser array)"

**O que verificar:**
- Array `issues` só tem "Nenhum problema encontrado"
- Estruturas têm todos os campos necessários

---

## ✅ 11. Sistema de Cache

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "localStorageAvailable": true,
  "testPassed": true,
  "dataContextCache": {
    "categoriesCount": 8,
    "productsCount": 25,
    "loading": false
  }
}
```

**O que verificar:**
- `localStorageAvailable` é `true`
- `testPassed` é `true`
- Cache do DataContext está populado

---

## ✅ 12. Performance

**Status Esperado:** Success (Verde)

**Dados Esperados:**
```json
{
  "tests": [
    { "test": "API Latency", "value": "150.50ms" },
    { "test": "Categories Load", "value": "200.30ms" },
    { "test": "Products Load", "value": "350.80ms" }
  ],
  "averageLatency": "233.87ms",
  "status": "Excelente"
}
```

**Classificação de Performance:**
- **Excelente**: < 1000ms (1 segundo)
- **Bom**: 1000ms - 3000ms (1-3 segundos)
- **Lento**: > 3000ms (mais de 3 segundos)

**O que verificar:**
- `averageLatency` < 1000ms idealmente
- `status` é "Excelente" ou "Bom"
- Nenhum teste acima de 5000ms

---

## 🎯 Resumo de Saúde Ideal

Quando TODOS os testes estão passando:

```
✅ 12 Testes Executados
✅ 12 Passou
❌ 0 Falhou
⚠️ 0 Avisos

Status Geral: ✓ Tudo OK
Performance: Excelente
Cache: Funcionando
DataContext: Sem Erros
```

## 🚨 Problemas Comuns e Soluções

### Especificações como Objeto
**Issue:** "Produto com specifications como objeto (deveria ser array)"  
**Solução:** Edite e salve o produto no dashboard para converter

### Imagens não Carregam
**Issue:** "Falha ao carregar imagem"  
**Solução:** Verifique URLs das imagens no Supabase Storage

### Performance Lenta
**Issue:** Average latency > 3000ms  
**Solução:** Verifique conexão internet ou otimize servidor

### Cache não Funciona
**Issue:** "localStorage não disponível"  
**Solução:** Verifique modo privado/incógnito do navegador

---

## 📊 Template de Relatório de Bug

Use este template ao reportar bugs:

```markdown
## 🐛 Bug Report - [Data]

### Ambiente
- Local / Produção
- Navegador: Chrome / Firefox / Safari
- URL: http://...

### Testes que Falharam
- [ ] Teste 1: Nome do Teste
  - Status: Error
  - Mensagem: "..."
  - Dados: (cole JSON)

### Console Logs
```
[Colar logs relevantes]
```

### Passos para Reproduzir
1. ...
2. ...

### Resultados do Debug
(Anexar arquivo JSON baixado)
```

---

Última atualização: 15/12/2024

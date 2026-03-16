# 🐛 Guia da Ferramenta de Debug - Smart Parts Import

## 📍 Como Acessar

Acesse a página de debug através da URL:
```
http://localhost:5173/debug
```

Ou em produção:
```
https://seu-dominio.com/debug
```

## 🎯 O Que a Ferramenta Testa

A ferramenta de debug executa **12 testes completos** para verificar todas as funcionalidades do site:

### 1. **Configuração Supabase** 🔧
- Verifica se `projectId` e `publicAnonKey` estão configurados
- Valida formato do URL do Supabase
- Exibe informações da API

### 2. **Server Health Check** ❤️
- Testa se o servidor Supabase Edge Function está respondendo
- Verifica endpoint `/health`
- Valida resposta do servidor

### 3. **Categorias Públicas** 🏷️
- Carrega todas as categorias do banco
- Conta total de categorias
- Verifica formato da resposta
- Exibe amostra das primeiras 3 categorias

### 4. **Produtos Públicos** 📦
- Carrega todos os produtos do banco
- Conta total de produtos
- Agrupa produtos por categoria
- Exibe amostra dos primeiros 3 produtos

### 5. **Banners** 🎨
- Carrega todos os banners do carrossel
- Conta total de banners
- Verifica formato da resposta

### 6. **DataContext** 💾
- Verifica o estado do contexto global
- Testa cache local
- Valida loading e error states
- Exibe contagem de dados em cache

### 7. **Produto Específico** 🔍
- Busca um produto específico por ID
- Verifica se especificações existem
- Valida se imagens existem
- Testa formato das especificações (array vs objeto)

### 8. **Produtos por Categoria** 📂
- Busca produtos filtrados por categoria
- Testa query parameter `?category=slug`
- Valida resposta filtrada

### 9. **Carregamento de Imagens** 🖼️
- Testa se imagens dos produtos carregam
- Valida URLs das imagens
- Conta produtos com imagens
- Timeout de 10 segundos

### 10. **Estrutura de Dados** 🗂️
- Valida estrutura completa de categorias
- Valida estrutura completa de produtos
- Identifica campos faltando
- Detecta problemas de formato

### 11. **Sistema de Cache** ⚡
- Testa localStorage
- Valida funcionamento do cache
- Verifica dados do DataContext

### 12. **Performance** 🚀
- Mede latência da API
- Mede tempo de carregamento de categorias
- Mede tempo de carregamento de produtos
- Calcula média e classifica performance

## 🎮 Como Usar

### Executar Todos os Testes
1. Clique no botão **"Executar Todos os Testes"**
2. Aguarde a execução completa (todos os 12 testes)
3. Revise os resultados

### Executar Testes Individuais
1. Clique em qualquer card de teste específico
2. O teste será executado individualmente
3. Resultado aparece instantaneamente

### Visualizar Detalhes
1. Clique em qualquer resultado de teste expandir
2. Veja dados completos em JSON
3. Analise erros específicos

### Baixar Resultados
1. Execute os testes
2. Clique em **"Baixar Resultados"**
3. Arquivo JSON será baixado com:
   - Timestamp da execução
   - Todos os resultados
   - Dados do DataContext
   - Informações do sistema

### Limpar Resultados
- Clique em **"Limpar Resultados"** para resetar a página

## 📊 Interpretando Resultados

### ✅ Status: Success (Verde)
- Teste passou com sucesso
- Nenhum problema encontrado
- Funcionalidade está OK

### ❌ Status: Error (Vermelho)
- Teste falhou
- Problema crítico encontrado
- Ação necessária

### ⚠️ Status: Warning (Amarelo)
- Teste passou com avisos
- Possível problema não-crítico
- Verificação recomendada

### ⏳ Status: Running (Azul)
- Teste em execução
- Aguarde conclusão

## 🔍 Painéis de Informação

### Painel "Configuração"
- Project ID do Supabase
- API URL completa

### Painel "DataContext"
- Quantidade de categorias em cache
- Quantidade de produtos em cache
- Estado de loading
- Erros atuais

### Painel "Status Geral"
- Total de testes executados
- Testes que passaram
- Testes que falharam
- Status geral do sistema

## 🛠️ Resolução de Problemas Comuns

### "Servidor retornou status 404"
- **Causa**: Rota não existe no servidor
- **Solução**: Verifique o arquivo `/supabase/functions/server/index.tsx`

### "Erro ao buscar dados do servidor"
- **Causa**: Servidor offline ou erro HTTP
- **Solução**: Verifique logs do servidor no console

### "Formato de resposta inválido"
- **Causa**: API retornou dados em formato inesperado
- **Solução**: Verifique estrutura de resposta da API

### "localStorage não disponível"
- **Causa**: Navegador bloqueou acesso ao localStorage
- **Solução**: Verifique configurações do navegador

### "Timeout ao carregar imagem"
- **Causa**: Imagem muito grande ou URL inválida
- **Solução**: Verifique URL da imagem e conexão

### "Produto com specifications como objeto"
- **Causa**: Produto ainda não foi convertido para novo formato
- **Solução**: Edite e salve o produto no dashboard

## 📝 Console Logs

Todos os testes geram logs detalhados no console do navegador (F12):
- `[Debug]` - Logs gerais da ferramenta
- `[Test]` - Logs de cada teste individual
- `[DataContext]` - Logs do contexto de dados
- `[ProductManager]` - Logs do gerenciador de produtos

## 🚨 Quando Usar

Use a ferramenta de debug quando:
- ✅ Após fazer mudanças no código
- ✅ Categorias ou produtos não aparecem
- ✅ Imagens não carregam
- �� Performance está lenta
- ✅ Erros aleatórios aparecem
- ✅ Após deploy em produção
- ✅ Para documentar bugs

## 💡 Dicas

1. **Execute testes regularmente** durante desenvolvimento
2. **Baixe resultados** antes de reportar bugs
3. **Verifique console** para logs detalhados
4. **Teste em produção** após cada deploy
5. **Compare resultados** entre local e produção

## 🎯 Checklist de Saúde do Site

✅ Todos os 12 testes passando (verde)  
✅ Performance < 1000ms (Excelente)  
✅ Categorias carregando corretamente  
✅ Produtos carregando corretamente  
✅ Imagens carregando  
✅ Especificações em formato array  
✅ DataContext sem erros  
✅ Cache funcionando  

Se todos os itens acima estiverem OK, seu site está **100% funcional**! 🎉

#!/bin/bash
# =============================================
# SMART PARTS IMPORT — Build & Deploy Script
# Repositório: SmartPartsSite (novo)
# =============================================

cd /home/importadorasmart/repositories/SmartPartsSite

# Adicionar Node 22 ao PATH para que vite/shebang encontre o node
export PATH="/opt/cpanel/ea-nodejs22/bin:$PATH"

echo "⬇️ Puxando alterações do GitHub..."
git pull
if [ $? -ne 0 ]; then
  echo "❌ Git pull falhou!"
  exit 1
fi

echo "📦 Instalando dependências..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
  echo "❌ npm install falhou!"
  exit 1
fi

echo "🔨 Fazendo build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build falhou!"
  exit 1
fi

echo "🚀 Copiando para public_html..."
rm -rf /home/importadorasmart/public_html/assets
cp -r dist/* /home/importadorasmart/public_html/

# =============================================
# Criar .htaccess com cache + GZIP + React Router
# =============================================
echo "📝 Configurando .htaccess..."
cat > /home/importadorasmart/public_html/.htaccess << 'HTACCESS'
# =============================================
# Cache de arquivos estáticos (1 ano)
# Vite usa hashes nos nomes dos arquivos,
# então é seguro cachear por muito tempo.
# =============================================
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Compressão GZIP (reduz tamanho pela metade)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# =============================================
# React Router - SPA fallback
# IMPORTANTE: Rewrite interno, NÃO redirect 301
# =============================================
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
HTACCESS

echo "✅ .htaccess configurado!"

echo "📤 Fazendo commit e push..."
git add .
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push

echo "✅ Deploy concluído com sucesso!"
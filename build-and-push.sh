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
# Cache de arquivos estáticos com hash (1 ano + immutable)
# Vite gera hashes — é seguro cachear forever
# =============================================
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Cache-Control: immutable para arquivos hashed do Vite
<IfModule mod_headers.c>
  <FilesMatch "\.(js|mjs|css|woff2|woff|png|jpg|jpeg|webp|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # HTML nunca cacheia (SPA precisa pegar a versão mais recente)
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>

# Compressão GZIP (reduz tamanho pela metade)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript text/javascript application/json image/svg+xml font/woff font/woff2
</IfModule>

# Compressão Brotli quando disponível
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css application/javascript text/javascript application/json image/svg+xml
</IfModule>

# =============================================
# React Router - SPA fallback
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
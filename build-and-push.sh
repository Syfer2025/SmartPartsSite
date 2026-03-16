#!/bin/bash
cd /home/importadorasmart/repositories/Siteparasmartpartsimport

# Adicionar Node 22 ao PATH para que vite/shebang encontre o node
export PATH="/opt/cpanel/ea-nodejs22/bin:$PATH"

echo "⬇️ Puxando alterações do GitHub..."
git pull
if [ $? -ne 0 ]; then
  echo "❌ Git pull falhou!"
  exit 1
fi

echo "📦 Instalando dependências..."
npm install
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

echo "📤 Fazendo commit e push..."
git add .
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push

echo "✅ Deploy concluído com sucesso!"

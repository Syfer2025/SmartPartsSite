import { defineConfig, Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin to resolve figma:asset imports for standalone builds
function figmaAssetPlugin(): Plugin {
  // Mapeamento: hash do figma:asset → URL no Supabase Storage
  const SUPABASE_STORAGE = 'https://khvkawwzikfcnirkwnih.supabase.co/storage/v1/object/public/assets';
  const assetMap: Record<string, string> = {
    '93a318fedff287cf8ae9966775cd849f3e3199e4.png': `${SUPABASE_STORAGE}/logo.png`,
    '64691187aafea5b1405da18747b628927fc164ef.png': `${SUPABASE_STORAGE}/favicon.png`,
    '536007d509b846961fa170317460e39fc8161cda.png': `${SUPABASE_STORAGE}/geladeira.png`,
    '063e4f5a7b392342abe80054cd82f3bc59c99d90.png': `${SUPABASE_STORAGE}/ar-condicionado.png`,
    'e8d6f8720c59a3f49b37b9980a7f6edb0668e8c3.png': `${SUPABASE_STORAGE}/cuica.png`,
    'c6cc582f8eccc3f8475a5bcd616dabf30c672346.png': `${SUPABASE_STORAGE}/roda-ferro.png`,
    '9ec12e5b019f71af472941fcb20e2d2deb2018b3.png': `${SUPABASE_STORAGE}/roda-aluminio.png`,
  };

  return {
    name: 'figma-asset-resolver',
    // Ativa em build e dev (fora do Figma Make, o sistema nativo não existe)
    resolveId(source) {
      if (source.startsWith('figma:asset/')) {
        const filename = source.replace('figma:asset/', '');
        return { id: `\0figma-asset:${filename}`, moduleSideEffects: false };
      }
    },
    load(id) {
      if (id.startsWith('\0figma-asset:')) {
        const filename = id.replace('\0figma-asset:', '');
        // Redireciona pro Supabase Storage
        const supabaseUrl = assetMap[filename];
        if (supabaseUrl) {
          return `export default "${supabaseUrl}";`;
        }
        // Fallback: serve do /assets/ local
        return `export default "/assets/${filename}";`;
      }
    },
  };
}

// Plugin to inject preconnect hints into HTML at build time
// These MUST be in static HTML, not JS — JS-created preconnects are too late
function preconnectPlugin(): Plugin {
  return {
    name: 'inject-preconnect',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://khvkawwzikfcnirkwnih.supabase.co', crossorigin: 'anonymous' },
          injectTo: 'head-prepend',
        },
        {
          tag: 'link',
          attrs: { rel: 'dns-prefetch', href: 'https://khvkawwzikfcnirkwnih.supabase.co' },
          injectTo: 'head-prepend',
        },
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://wsrv.nl' },
          injectTo: 'head-prepend',
        },
        {
          tag: 'link',
          attrs: { rel: 'dns-prefetch', href: 'https://wsrv.nl' },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    preconnectPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    historyApiFallback: true,
    // Fix HMR WebSocket connection issues in containerized environments
    hmr: {
      clientPort: 443,
    },
    host: true, // Listen on all addresses
  },
})
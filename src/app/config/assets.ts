// =============================================================
// SMART PARTS IMPORT — Centralized Asset URLs (produção)
// =============================================================
// Em produção, as imagens são servidas pelo Supabase Storage.
// O bucket "assets" deve ser público.
//
// Para subir as imagens:
// 1. Acesse https://supabase.com/dashboard → seu projeto → Storage
// 2. Crie um bucket chamado "assets" (público)
// 3. Faça upload de: logo.png, favicon.png
// =============================================================

const SUPABASE_PROJECT_ID = 'khvkawwzikfcnirkwnih';
const STORAGE_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/assets`;

// Mapeamento: hash do figma:asset → URL no Supabase Storage
export const FIGMA_ASSET_MAP: Record<string, string> = {
  '93a318fedff287cf8ae9966775cd849f3e3199e4.png': `${STORAGE_BASE}/logo.png`,
  '64691187aafea5b1405da18747b628927fc164ef.png': `${STORAGE_BASE}/favicon.png`,
  '536007d509b846961fa170317460e39fc8161cda.png': `${STORAGE_BASE}/geladeira.png`,
  '063e4f5a7b392342abe80054cd82f3bc59c99d90.png': `${STORAGE_BASE}/ar-condicionado.png`,
  'e8d6f8720c59a3f49b37b9980a7f6edb0668e8c3.png': `${STORAGE_BASE}/cuica.png`,
  'c6cc582f8eccc3f8475a5bcd616dabf30c672346.png': `${STORAGE_BASE}/roda-ferro.png`,
  '9ec12e5b019f71af472941fcb20e2d2deb2018b3.png': `${STORAGE_BASE}/roda-aluminio.png`,
};

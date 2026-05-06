// ============================================================
// SMART PARTS — Motor de Busca
// TODOS os termos devem corresponder. Sem lixo.
// ============================================================

interface SearchableProduct {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  sku?: string;
  image: string;
  [key: string]: any;
}

export interface SearchResult {
  product: SearchableProduct;
  score: number;
  matchType: 'exact' | 'sku' | 'fuzzy' | 'partial' | 'category';
  highlights: string[];
}

// ── Normalização ─────────────────────────────────────────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Stop words PT-BR (ignoradas na busca) ────────────────────
const STOP_WORDS = new Set([
  'de',
  'do',
  'da',
  'dos',
  'das',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'um',
  'uma',
  'uns',
  'umas',
  'o',
  'a',
  'os',
  'as',
  'e',
  'ou',
  'com',
  'por',
  'para',
  'que',
  'se',
  'ao',
  'aos',
]);

// ── Levenshtein (só para typos) ──────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// ── Plurais PT-BR ────────────────────────────────────────────
function getVariants(word: string): string[] {
  if (word.length < 3) return [word];
  const v = new Set([word]);
  // Plural → Singular
  if (word.endsWith('oes')) v.add(word.slice(0, -3) + 'ao');
  if (word.endsWith('aes')) v.add(word.slice(0, -3) + 'ao');
  if (word.endsWith('ais')) v.add(word.slice(0, -2) + 'l');
  if (word.endsWith('eis')) v.add(word.slice(0, -2) + 'l');
  if (word.endsWith('ois')) v.add(word.slice(0, -2) + 'l');
  if (word.endsWith('uis')) v.add(word.slice(0, -2) + 'l');
  if (word.endsWith('res') && word.length > 4) v.add(word.slice(0, -2));
  if (word.endsWith('es') && word.length > 3) v.add(word.slice(0, -1));
  if (word.endsWith('s') && !word.endsWith('ss')) v.add(word.slice(0, -1));
  // Singular → Plural
  if (word.endsWith('ao')) v.add(word.slice(0, -2) + 'oes');
  if (word.endsWith('l')) v.add(word.slice(0, -1) + 'is');
  if (word.endsWith('r') || word.endsWith('z')) v.add(word + 'es');
  if (
    !word.endsWith('s') &&
    !word.endsWith('l') &&
    !word.endsWith('r') &&
    !word.endsWith('z') &&
    !word.endsWith('ao')
  ) {
    v.add(word + 's');
  }
  return Array.from(v);
}

// ── Checa se a palavra (ou variante/typo) aparece no texto ───
function wordFoundIn(word: string, text: string, allowTypo: boolean = true): boolean {
  // Match direto ou variante plural/singular
  for (const variant of getVariants(word)) {
    if (text.includes(variant)) return true;
  }
  // Typo: max 1-2 chars de diferença, só contra palavras do texto
  if (allowTypo && word.length >= 4) {
    const maxDist = word.length <= 5 ? 1 : 2;
    for (const tw of text.split(/\s+/)) {
      if (tw.length < 3) continue;
      if (Math.abs(word.length - tw.length) > 2) continue;
      if (levenshtein(word, tw) <= maxDist) return true;
    }
  }
  return false;
}

// ── Motor de Busca Principal ─────────────────────────────────
export function smartSearch(
  products: SearchableProduct[],
  rawQuery: string,
  limit: number = 50
): SearchResult[] {
  const query = normalize(rawQuery);
  if (!query || query.length === 0) return [];

  // Separar tokens e remover stop words
  const allTokens = query.split(/\s+/).filter((t) => t.length > 0);
  const tokens = allTokens.filter((t) => !STOP_WORDS.has(t) && t.length >= 2);

  // Se sobrou nada após remover stop words, usar todos
  const searchTokens = tokens.length > 0 ? tokens : allTokens.filter((t) => t.length >= 2);
  if (searchTokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const product of products) {
    const name = normalize(product.name || '');
    const description = normalize(product.description || '');
    const category = normalize(product.category || '');
    const sku = normalize(product.sku || '');
    const allText = `${name} ${category} ${description}`;

    // ── SKU match direto (prioridade máxima, ignora tokens) ──
    let skuScore = 0;
    if (sku) {
      const q = query.replace(/\s+/g, '');
      const s = sku.replace(/\s+/g, '');
      if (s === q) skuScore = 500;
      else if (s.startsWith(q)) skuScore = 400;
      else if (s.includes(q)) skuScore = 300;
      else if (q.length >= 2 && s.includes(q)) skuScore = 200;
    }

    if (skuScore > 0) {
      results.push({ product, score: skuScore, matchType: 'sku', highlights: [] });
      continue; // SKU match é definitivo
    }

    // ── TODOS os tokens devem aparecer no produto ────────────
    let allFound = true;
    let score = 0;

    for (const token of searchTokens) {
      const inName = wordFoundIn(token, name);
      const inCategory = wordFoundIn(token, category);
      const inDescription = wordFoundIn(token, description, false); // sem typo na descrição
      const inSku = sku.includes(token);

      if (inName || inCategory || inDescription || inSku) {
        // Token encontrado — dar pontuação por onde encontrou
        if (inName) score += 50;
        if (inCategory) score += 30;
        if (inSku) score += 40;
        if (inDescription) score += 10;
      } else {
        // Token NÃO encontrado → produto descartado
        allFound = false;
        break;
      }
    }

    if (!allFound) continue;

    // ── Bônus: frase completa no nome ────────────────────────
    if (name.includes(query)) score += 100;
    else if (name.startsWith(query)) score += 80;

    // ── Bônus: frase completa na categoria ───────────────────
    if (category.includes(query)) score += 50;

    let matchType: SearchResult['matchType'] = 'partial';
    if (name.includes(query) || name === query) matchType = 'exact';
    else if (category.includes(query)) matchType = 'category';

    results.push({ product, score, matchType, highlights: [] });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

// ── Quick search para dropdown ───────────────────────────────
export function quickSearch(products: SearchableProduct[], query: string): SearchResult[] {
  return smartSearch(products, query, 50);
}

// Tradução automática PT -> EN/ES via MyMemory (gratuita, sem chave de API).
// Roda no navegador (painel admin), então gerar traduções de um produto novo
// não exige redeploy — só salvar no banco.

const ENDPOINT = 'https://api.mymemory.translated.net/get';
// O e-mail eleva o limite diário gratuito (~5k -> ~50k palavras/dia).
const CONTACT_EMAIL = 'alex.meira@autopecascarretao.com.br';
const MAX_CHUNK = 480; // MyMemory aceita ~500 caracteres por requisição

export type TargetLang = 'en' | 'es';

/** Erro específico de limite/rejeição da API, pra abortar lotes com segurança. */
export class TranslationLimitError extends Error {}

function splitIntoChunks(text: string, max = MAX_CHUNK): string[] {
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = '';
  for (const sentence of sentences) {
    if (sentence.length > max) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      for (let i = 0; i < sentence.length; i += max) chunks.push(sentence.slice(i, i + max));
      continue;
    }
    if ((current + ' ' + sentence).trim().length > max) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function translateChunk(text: string, target: TargetLang): Promise<string> {
  const params = new URLSearchParams({ q: text, langpair: `pt|${target}` });
  if (CONTACT_EMAIL) params.set('de', CONTACT_EMAIL);

  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  if (res.status === 429) throw new TranslationLimitError('Muitas requisições. Tente novamente em instantes.');
  if (!res.ok) throw new Error(`Tradução falhou (HTTP ${res.status})`);

  const data = await res.json();
  const status = Number(data?.responseStatus);
  const translated: string = data?.responseData?.translatedText ?? '';

  // MyMemory devolve avisos de limite dentro do próprio translatedText.
  if (/MYMEMORY WARNING|YOU USED ALL AVAILABLE|QUERY LENGTH LIMIT/i.test(translated)) {
    throw new TranslationLimitError(data?.responseDetails || 'Limite diário de tradução atingido.');
  }
  if (status !== 200) {
    throw new Error(data?.responseDetails || 'Não foi possível traduzir o texto.');
  }
  return translated;
}

/** Traduz um texto PT para o idioma alvo, quebrando em partes se for longo. */
export async function translateText(text: string, target: TargetLang): Promise<string> {
  const clean = (text ?? '').trim();
  if (!clean) return '';
  const chunks = splitIntoChunks(clean);
  const results: string[] = [];
  for (const chunk of chunks) {
    results.push(await translateChunk(chunk, target));
  }
  return results.join(' ');
}

export interface TranslatableFields {
  name: string;
  description: string;
}

export interface TranslatedFields {
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
}

/** Traduz nome e descrição de um produto para EN e ES. */
export async function translateProduct(fields: TranslatableFields): Promise<TranslatedFields> {
  const name_en = await translateText(fields.name, 'en');
  const name_es = await translateText(fields.name, 'es');
  const description_en = await translateText(fields.description, 'en');
  const description_es = await translateText(fields.description, 'es');
  return { name_en, name_es, description_en, description_es };
}

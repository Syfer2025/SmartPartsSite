/// <reference types="vite/client" />
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars not set. A interface vai renderizar, mas chamadas ao backend (produtos, banners, etc.) não vão funcionar. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em um arquivo .env.'
  );
}

// projectId extraído da URL: https://<id>.supabase.co
export const projectId = supabaseUrl
  ? supabaseUrl.replace('https://', '').replace('.supabase.co', '')
  : '';
export const publicAnonKey = supabaseAnonKey ?? '';

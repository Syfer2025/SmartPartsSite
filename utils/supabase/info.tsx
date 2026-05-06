const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars not set. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// projectId extraído da URL: https://<id>.supabase.co
export const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
export const publicAnonKey = supabaseAnonKey;

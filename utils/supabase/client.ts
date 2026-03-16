import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton instance - only create once
let supabaseInstance: SupabaseClient | null = null;
let instanceCount = 0;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    instanceCount++;
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseInstance = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        // Use single storage key to avoid multiple instances
        storageKey: 'sb-khvkawwzikfcnirkwnih-auth-token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log(`%c[Supabase Client] ✅ Singleton instance #${instanceCount} created`, 'color: #10b981; font-weight: bold;');
  }
  return supabaseInstance;
}

// Export the singleton instance for convenience
export const supabase = getSupabaseClient();
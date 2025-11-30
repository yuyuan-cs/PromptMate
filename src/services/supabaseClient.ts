import { createClient } from '@supabase/supabase-js';

const appEnv = import.meta.env.VITE_APP_ENV || 'production';

const supabaseUrl = appEnv === 'test' && import.meta.env.VITE_SUPABASE_TEST_URL
  ? import.meta.env.VITE_SUPABASE_TEST_URL
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = appEnv === 'test' && import.meta.env.VITE_SUPABASE_TEST_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_TEST_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(`Supabase credentials not found for environment: ${appEnv}. Template features will be disabled.`);
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
      }
    })
  : null;

export const isSupabaseEnabled = !!supabase;
export const currentEnv = appEnv;

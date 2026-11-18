import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://bxgsfjcbtjualifrvchn.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || 'sb_publishable_ARD9pI8HGZweqhnWAbaTyA_qP5GSi7X';

export const supabaseProvider = {
  provide: SUPABASE_CLIENT,
  useFactory: (): SupabaseClient =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }),
};

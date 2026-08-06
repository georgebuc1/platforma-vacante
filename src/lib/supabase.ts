import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Untyped client — all table types are cast explicitly in storageService.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

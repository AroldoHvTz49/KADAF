import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Coloca aquí tus llaves de Supabase
const supabaseUrl = 'https://haqezsbpofbwzychxwrh.supabase.co';
const supabaseAnonKey = 'sb_publishable_6kk-Hjbp46ysEOEMWB3XzQ_4G-flr6r';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, 
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
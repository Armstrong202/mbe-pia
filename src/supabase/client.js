import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmtjncjuxptrllvkjfxk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-dHrHQIwqSJe_r9eBIQ0SA_StaE28NO'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  USERS: 'users',
  MEMBRES: 'membres',
  DETTES: 'dettes',
  REMBOURSEMENTS: 'remboursements',
  COTISATIONS: 'cotisations',
  REUNIONS: 'reunions',
  NOTIFICATIONS: 'notifications',
  PARAMETRES: 'parametres',
  REGLEMENT: 'reglement'
}

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
}

// utils/supabase/client.js

import { createClient } from '@supabase/supabase-js'

// ⚠️ Valeurs fictives — à remplacer par tes vraies clés
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kmtjncjuxptrllvkjfxk.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_-dHrHQIwqSJe_r9eBIQ0SA_StaE28NO"

// Création du client Supabase côté navigateur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tables utilisées dans ton projet
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

// Vérification que Supabase est bien configuré
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

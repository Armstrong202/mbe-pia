// utils/supabase/client.js

import { createClient } from '@supabase/supabase-js'

// Variables d’environnement (elles doivent être définies dans Vercel → Settings → Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// utils/supabase/server.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ⚠️ Valeurs fictives — à remplacer par tes vraies clés dans .env.local ou Vercel
const supabaseUrl = process.env.SUPABASE_URL || "https://kmtjncjuxptrllvkjfxk.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_-dHrHQIwqSJe_r9eBIQ0SA_StaE28NO";
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || "e43d5ac1-7ee0-4650-8225-3e6484693457";

// Création du client Supabase côté serveur
export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseServiceRoleKey!, // ⚠️ clé privée, backend uniquement
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorer si appelé depuis un Server Component
          }
        },
      },
    }
  );
};

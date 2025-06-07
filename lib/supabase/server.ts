import { createServerClient } from '@supabase/ssr'

// Re-export des types
export type * from './types'

// Client serveur pour les API routes (utilisé dynamiquement)
export async function createServerSupabaseClient() {
  // Import dynamique pour éviter l'erreur côté client
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le `setAll` a été appelé depuis un Server Component.
            // Cela peut être ignoré si vous avez un middleware qui actualise
            // les sessions utilisateur.
          }
        },
      },
    }
  )
}

// Client serveur avec service role pour les opérations admin (utilisé dans les API routes)
export function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Pas de cookies pour le service role
        },
      },
    }
  )
}
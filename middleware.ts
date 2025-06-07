import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Routes protégées
  const protectedPaths = ['/dashboard', '/api-keys', '/chat']
  
  // Vérifier si la route actuelle est protégée
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )
  
  // Si ce n'est pas une route protégée, continuer normalement
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request: req,
  })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Ne pas ajouter de logique entre createServerClient et getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si l'utilisateur n'est pas connecté, rediriger vers la page d'accueil
  if (!user) {
    const redirectUrl = new URL('/', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // IMPORTANT: Retourner l'objet supabaseResponse tel quel
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Correspondre à toutes les routes de requête sauf celles commençant par :
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'optimisation d'image)
     * - favicon.ico (fichier favicon)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (fichiers d'image)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Ne traiter que les routes qui correspondent au matcher
  if (!req.nextUrl.pathname.startsWith('/dashboard') && 
      !req.nextUrl.pathname.startsWith('/api-keys')) {
    return NextResponse.next();
  }

  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()
    // Autres vérifications si nécessaire...
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

// Garder le matcher tel quel
export const config = {
  matcher: ['/dashboard/:path*', '/api-keys/:path*']
}

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(req: NextRequest) {
  // Ne traiter que les routes qui correspondent au matcher
  if (!req.nextUrl.pathname.startsWith('/dashboard') && 
      !req.nextUrl.pathname.startsWith('/api-keys')) {
    return NextResponse.next();
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

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

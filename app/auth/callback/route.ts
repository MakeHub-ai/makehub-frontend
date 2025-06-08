import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createServerSupabaseClient()
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Successfully exchanged code for session
        // Redirect to a protected page or the intended destination
        // For example, redirect to the dashboard:
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      console.error('Error exchanging code for session:', error.message)
      // Redirect to an error page or home with an error message
      return NextResponse.redirect(`${origin}/?error=auth_error&message=${encodeURIComponent(error.message)}`)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
      console.error('Unexpected error during code exchange:', errorMessage)
      return NextResponse.redirect(`${origin}/?error=unexpected_auth_error&message=${encodeURIComponent(errorMessage)}`)
    }
  } else {
    console.error('No code found in callback URL')
    // Redirect to an error page or home if no code is present
    return NextResponse.redirect(`${origin}/?error=no_code_provided`)
  }
}

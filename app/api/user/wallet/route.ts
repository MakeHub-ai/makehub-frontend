import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseServer, Wallet } from '@/lib/supabase-server'

export async function GET() {
  const cookieStore = await cookies()
  const supabaseAuthClient = createServerClient(
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  try {
    const { data: { session }, error: sessionError } = await supabaseAuthClient.auth.getSession()

    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return NextResponse.json({ message: 'Error getting session', error: sessionError.message }, { status: 500 })
    }

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized: User not authenticated' }, { status: 401 })
    }

    const userId = session.user.id

    const { data, error } = await supabaseServer
      .from('wallet')
      .select('*')
      .eq('user_id', userId)
      .single() // Expecting one wallet per user
      .returns<Wallet | null>()

    if (error) {
      console.error(`Error fetching wallet for user ${userId}:`, error)
      if (error.code === 'PGRST116') { // Not found
        // It's possible a user might not have a wallet entry yet if it's created on first transaction/top-up
        // Depending on application logic, you might want to create one here or return 404.
        // For now, returning 404 if no wallet record exists.
        return NextResponse.json({ message: `Wallet not found for user ${userId}` }, { status: 404 })
      }
      return NextResponse.json({ message: 'Error fetching wallet', error: error.message }, { status: 500 })
    }

    if (!data) {
      // This case should ideally be caught by PGRST116, but as a fallback:
      return NextResponse.json({ message: `Wallet not found for user ${userId}` }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Unexpected error fetching wallet:', e)
    return NextResponse.json({ message: 'Unexpected error fetching wallet', error: e.message }, { status: 500 })
  }
}

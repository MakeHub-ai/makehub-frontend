import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { UserStats } from '@/lib/supabase-server' // Assuming UserStats type is defined

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
            console.warn(
              'The `setAll` method was called from a Server Component. This can be ignored if you have middleware refreshing user sessions.'
            )
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

    // Call the PostgreSQL function get_user_stats
    const { data, error } = await supabaseServer
      .rpc('get_user_stats', { p_user_id: userId })
      .single() // The function is designed to return a single row for the user
      .returns<UserStats | null>() // Type the expected return

    if (error) {
      console.error(`Error fetching user stats for user ${userId}:`, error)
      // PGRST116 might occur if the function returns no rows for some reason (e.g., user not in wallet yet)
      if (error.code === 'PGRST116') { 
        return NextResponse.json({ message: `User stats not found for user ${userId}. Ensure user has a wallet entry.`, error: error.message }, { status: 404 })
      }
      return NextResponse.json({ message: 'Error fetching user stats', error: error.message }, { status: 500 })
    }

    if (!data) {
      // This case implies the function returned null or no rows, which might mean the user has no activity or wallet.
      // Depending on how get_user_stats is implemented (e.g., if it always returns a row with zeros for new users),
      // this might indicate an issue or a user with no data.
      // For now, returning a 404 if no data is returned by the RPC.
      return NextResponse.json({ message: `No stats data returned for user ${userId}.` }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Unexpected error fetching user stats:', e)
    return NextResponse.json({ message: 'Unexpected error fetching user stats', error: e.message }, { status: 500 })
  }
}

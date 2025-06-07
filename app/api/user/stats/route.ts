import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { UserStats } from '@/lib/supabase/types'

export async function GET() {
  try {
    // Utiliser le client avec auth utilisateur
    const supabaseAuthClient = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabaseAuthClient.auth.getSession()

    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return NextResponse.json({ message: 'Error getting session', error: sessionError.message }, { status: 500 })
    }

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized: User not authenticated' }, { status: 401 })
    }

    const userId = session.user.id

    // Utiliser le client service role pour les requêtes de données
    const supabaseServer = createServiceRoleClient()
    
    const { data, error } = await supabaseServer
      .rpc('get_user_stats', { p_user_id: userId })
      .single()
      .returns<UserStats | null>()

    if (error) {
      console.error(`Error fetching user stats for user ${userId}:`, error)
      if (error.code === 'PGRST116') { 
        return NextResponse.json({ message: `User stats not found for user ${userId}. Ensure user has a wallet entry.`, error: error.message }, { status: 404 })
      }
      return NextResponse.json({ message: 'Error fetching user stats', error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ message: `No stats data returned for user ${userId}.` }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Unexpected error fetching user stats:', e)
    return NextResponse.json({ message: 'Unexpected error fetching user stats', error: e.message }, { status: 500 })
  }
}

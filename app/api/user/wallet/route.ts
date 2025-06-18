import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Wallet } from '@/lib/supabase/types'

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

    const { data, error } = await supabaseAuthClient
      .from('wallet')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Wallet not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { message: 'Error fetching wallet', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Unexpected error fetching wallet:', e)
    return NextResponse.json({ message: 'Unexpected error fetching wallet', error: e.message }, { status: 500 })
  }
}

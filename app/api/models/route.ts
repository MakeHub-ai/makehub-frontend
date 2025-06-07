import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Model } from '@/lib/supabase/types'

export async function GET() {
  try {
    // Pas besoin d'auth pour la liste des modèles - c'est public
    const supabaseServer = createServiceRoleClient()
    
    const { data, error } = await supabaseServer
      .from('models')
      .select('*')

    if (error) {
      console.error('Error fetching models:', error)
      return NextResponse.json(
        { message: 'Error fetching models', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (e: any) {
    console.error('Unexpected error fetching models:', e)
    return NextResponse.json(
      { message: 'Unexpected error fetching models', error: e.message },
      { status: 500 }
    )
  }
}

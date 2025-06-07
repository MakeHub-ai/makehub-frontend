import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Model } from '@/lib/supabase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model_id: string }> }
) {
  try {
    // ✅ Await les params car c'est maintenant une Promise dans Next.js 15
    const { model_id } = await params
    
    if (!model_id) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    // Pas besoin d'auth pour un modèle spécifique - c'est public
    const supabaseServer = createServiceRoleClient()
    
    const { data: model, error } = await supabaseServer
      .from('models')
      .select('*')
      .eq('model_id', model_id)
      .single()
      
    if (error) {
      console.error('Error fetching model:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(model)
  } catch (error: any) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

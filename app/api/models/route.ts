import { NextResponse } from 'next/server'
import { supabaseServer, Model } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('models')
      .select('*')
      .returns<Model[]>()

    if (error) {
      console.error('Error fetching models:', error)
      return NextResponse.json({ message: 'Error fetching models', error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Unexpected error fetching models:', e)
    return NextResponse.json({ message: 'Unexpected error fetching models', error: e.message }, { status: 500 })
  }
}

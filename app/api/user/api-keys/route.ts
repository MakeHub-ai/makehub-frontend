import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { ApiKey } from '@/lib/supabase/types'

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
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json({ 
        message: 'Error fetching API keys', 
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (e: any) {
    console.error('Unexpected error fetching API keys:', e)
    return NextResponse.json({ message: 'Unexpected error fetching API keys', error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { api_key_name } = body

    if (!api_key_name?.trim()) {
      return NextResponse.json(
        { message: 'API key name is required' },
        { status: 400 }
      )
    }

    // Générer la clé API
    const rawApiKeyBytes = crypto.getRandomValues(new Uint8Array(24))
    const apiKey = `mk_live_${Buffer.from(rawApiKeyBytes).toString('hex')}`

    const { data, error } = await supabaseAuthClient
      .from('api_keys')
      .insert({
        api_key: apiKey,
        api_key_name: api_key_name.trim(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating API key:', error)
      return NextResponse.json({
        message: 'Error creating API key',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    console.error('Unexpected error creating API key:', e)
    return NextResponse.json({ message: 'Unexpected error creating API key', error: e.message }, { status: 500 })
  }
}

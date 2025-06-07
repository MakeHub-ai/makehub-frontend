import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { ApiKey } from '@/lib/supabase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key_id: string }> }
) {
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

    // ✅ Await les params car c'est une Promise dans Next.js 15
    const { key_id } = await params

    if (!key_id) {
      return NextResponse.json(
        { message: 'API Key ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAuthClient
      .from('api_keys')
      .select('*')
      .eq('id', key_id)
      .single()

    if (error) {
      console.error(`Error fetching API key ${key_id}:`, error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: `API Key with ID ${key_id} not found` },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { message: 'Error fetching API key', error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { message: `API Key with ID ${key_id} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Unexpected error fetching API key:', e)
    return NextResponse.json({ message: 'Unexpected error fetching API key', error: e.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key_id: string }> }
) {
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

    // ✅ Await les params
    const { key_id } = await params

    if (!key_id) {
      return NextResponse.json(
        { message: 'API Key ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { api_key_name, is_active } = body

    const updatePayload: any = {}
    if (typeof api_key_name === 'string' && api_key_name.trim() !== '') {
      updatePayload.api_key_name = api_key_name.trim()
    }
    if (typeof is_active === 'boolean') {
      updatePayload.is_active = is_active
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { message: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAuthClient
      .from('api_keys')
      .update(updatePayload)
      .eq('id', key_id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating API key ${key_id}:`, error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: `API Key with ID ${key_id} not found` },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { message: 'Error updating API key', error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { message: `API Key with ID ${key_id} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Invalid request body: Malformed JSON.' },
        { status: 400 }
      )
    }
    console.error('Unexpected error updating API key:', e)
    return NextResponse.json({ message: 'Unexpected error updating API key', error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key_id: string }> }
) {
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

    // ✅ Await les params
    const { key_id } = await params

    if (!key_id) {
      return NextResponse.json(
        { message: 'API Key ID is required' },
        { status: 400 }
      )
    }

    // Désactiver la clé au lieu de la supprimer (plus sûr)
    const { data, error } = await supabaseAuthClient
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', key_id)
      .select('id')
      .single()

    if (error) {
      console.error(`Error deactivating API key ${key_id}:`, error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: `API Key with ID ${key_id} not found` },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { message: 'Error deactivating API key', error: error.message },
        { status: 500 }
      )
    }
    
    if (!data) {
      return NextResponse.json(
        { message: `API Key with ID ${key_id} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `API Key ${key_id} deactivated successfully` },
      { status: 200 }
    )
  } catch (e: any) {
    console.error('Unexpected error deactivating API key:', e)
    return NextResponse.json({ message: 'Unexpected error deactivating API key', error: e.message }, { status: 500 })
  }
}

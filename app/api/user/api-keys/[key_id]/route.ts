import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseServer, ApiKey } from '@/lib/supabase-server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key_id: string }> }
) {
  const { key_id } = await params 
  if (!key_id) {
    return NextResponse.json({ message: 'API Key ID is required' }, { status: 400 })
  }

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
    if (sessionError || !session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const { api_key_name, is_active } = body

    const updatePayload: Partial<Pick<ApiKey, 'api_key_name' | 'is_active'>> = {}
    if (typeof api_key_name === 'string' && api_key_name.trim() !== '') {
      updatePayload.api_key_name = api_key_name.trim()
    }
    if (typeof is_active === 'boolean') {
      updatePayload.is_active = is_active
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('api_keys')
      .update(updatePayload)
      .eq('id', key_id)
      .eq('user_id', userId) // Ensure user can only update their own keys
      .select()
      .single()
      .returns<ApiKey | null>()

    if (error) {
      console.error(`Error updating API key ${key_id} for user ${userId}:`, error)
      if (error.code === 'PGRST116') { // Not found or not authorized
        return NextResponse.json({ message: `API Key with ID ${key_id} not found or not owned by user` }, { status: 404 })
      }
      return NextResponse.json({ message: 'Error updating API key', error: error.message }, { status: 500 })
    }
     if (!data) {
      return NextResponse.json({ message: `API Key with ID ${key_id} not found or not owned by user` }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error(`Unexpected error updating API key ${key_id}:`, e)
    if (e instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body: Malformed JSON.', error: e.message }, { status: 400 })
    }
    return NextResponse.json({ message: 'Unexpected error updating API key', error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request, // request object is not used but required by Next.js convention
  { params }: { params: Promise<{ key_id: string }> }
) {
  const { key_id } = await params
  if (!key_id) {
    return NextResponse.json({ message: 'API Key ID is required' }, { status: 400 })
  }

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
    if (sessionError || !session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Instead of actual deletion, we mark the key as inactive.
    // True deletion might be an option, but deactivation is often safer.
    const { data, error } = await supabaseServer
      .from('api_keys')
      .update({ is_active: false }) // Deactivate the key
      .eq('id', key_id)
      .eq('user_id', userId) // Ensure user can only deactivate their own keys
      .select('id') // Select minimal data to confirm operation
      .single()

    if (error) {
      console.error(`Error deactivating API key ${key_id} for user ${userId}:`, error)
       if (error.code === 'PGRST116') { // Not found or not authorized
        return NextResponse.json({ message: `API Key with ID ${key_id} not found or not owned by user` }, { status: 404 })
      }
      return NextResponse.json({ message: 'Error deactivating API key', error: error.message }, { status: 500 })
    }
    
    if (!data) {
         return NextResponse.json({ message: `API Key with ID ${key_id} not found or not owned by user` }, { status: 404 })
    }


    return NextResponse.json({ message: `API Key ${key_id} deactivated successfully` }, { status: 200 })
  } catch (e: any) {
    console.error(`Unexpected error deactivating API key ${key_id}:`, e)
    return NextResponse.json({ message: 'Unexpected error deactivating API key', error: e.message }, { status: 500 })
  }
}

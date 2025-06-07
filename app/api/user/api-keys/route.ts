import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseServer, ApiKey } from '@/lib/supabase-server' // We might use supabaseServer for the query

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

    // Use supabaseServer (service role) to fetch data, explicitly filtering by user_id
    // This is one approach. Another is to use supabaseAuthClient if RLS is fully configured
    // for users to only select their own keys. Using supabaseServer gives more control here.
    const { data, error } = await supabaseServer
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<ApiKey[]>()

    if (error) {
      console.error(`Error fetching API keys for user ${userId}:`, error)
      return NextResponse.json({ message: 'Error fetching API keys', error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (e: any) {
    console.error('Unexpected error fetching API keys:', e)
    return NextResponse.json({ message: 'Unexpected error fetching API keys', error: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
    const body = await request.json()
    const apiKeyName = body.api_key_name

    if (!apiKeyName || typeof apiKeyName !== 'string' || apiKeyName.trim() === '') {
      return NextResponse.json({ message: 'API key name is required and must be a non-empty string' }, { status: 400 })
    }

    // Generate a secure API key
    // Example: "mk_live_" + 32 random hex characters
    // For production, ensure crypto is available and used correctly.
    // Node.js crypto module can be used if environment supports it.
    // For simplicity here, we'll use a UUID-like structure, but a more robust generation is recommended for production.
    // A common pattern is a prefix + random bytes encoded to hex/base64.
    // Let's use crypto for a more secure key.
    let rawApiKeyBytes
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        rawApiKeyBytes = crypto.getRandomValues(new Uint8Array(24)); // 24 bytes = 192 bits
    } else {
        // Fallback for environments where web crypto might not be directly available (e.g. older Node in some setups)
        // This part might need adjustment based on exact Next.js Edge/Node runtime capabilities for crypto.
        // For now, assuming a modern environment.
        const nodeCrypto = await import('crypto');
        rawApiKeyBytes = nodeCrypto.randomBytes(24);
    }
    const apiKey = `mk_live_${Buffer.from(rawApiKeyBytes).toString('hex')}`


    const { data: newKey, error: insertError } = await supabaseServer
      .from('api_keys')
      .insert({
        user_id: userId,
        api_key: apiKey, // The actual secret key
        api_key_name: apiKeyName.trim(),
        is_active: true,
      })
      .select()
      .single()
      .returns<ApiKey>()

    if (insertError) {
      console.error(`Error creating API key for user ${userId}:`, insertError)
      // Check for unique constraint violation on api_key if it happens (though unlikely with good random generation)
      if (insertError.code === '23505') { // Unique violation
         return NextResponse.json({ message: 'Error creating API key: A key collision occurred. Please try again.', error: insertError.message }, { status: 500 })
      }
      return NextResponse.json({ message: 'Error creating API key', error: insertError.message }, { status: 500 })
    }

    // Important: The full API key is returned here ONCE upon creation.
    // The client should store it securely immediately. It won't be retrievable again via API.
    return NextResponse.json(newKey, { status: 201 })

  } catch (e: any) {
    console.error('Unexpected error creating API key:', e)
    if (e instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ message: 'Invalid request body: Malformed JSON.', error: e.message }, { status: 400 })
    }
    return NextResponse.json({ message: 'Unexpected error creating API key', error: e.message }, { status: 500 })
  }
}

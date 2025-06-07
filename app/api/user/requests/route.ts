import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseServer, Request as ApiRequest } from '@/lib/supabase-server' // Renamed Request to avoid conflict

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export async function GET(request: globalThis.Request) { // Use globalThis.Request to avoid conflict
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

  const { searchParams } = new URL(request.url)
  let page = parseInt(searchParams.get('page') || '1', 10)
  let pageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)

  if (isNaN(page) || page < 1) page = 1
  if (isNaN(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE

  const offset = (page - 1) * pageSize

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

    // Fetch requests for the user
    const { data: userRequests, error: requestsError, count } = await supabaseServer
      .from('requests')
      .select('*', { count: 'exact' }) // Consider joining with requests_content if needed
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)
      .returns<ApiRequest[]>()

    if (requestsError) {
      console.error(`Error fetching requests for user ${userId}:`, requestsError)
      return NextResponse.json({ message: 'Error fetching requests', error: requestsError.message }, { status: 500 })
    }
    
    const totalRequests = count || 0
    const totalPages = Math.ceil(totalRequests / pageSize)

    return NextResponse.json({
      data: userRequests || [],
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalRequests,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    })
  } catch (e: any) {
    console.error('Unexpected error fetching requests:', e)
    return NextResponse.json({ message: 'Unexpected error fetching requests', error: e.message }, { status: 500 })
  }
}

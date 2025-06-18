import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Transaction } from '@/lib/supabase/types'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    let page = parseInt(searchParams.get('page') || '1', 10)
    let pageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)

    if (isNaN(page) || page < 1) page = 1
    if (isNaN(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE

    const offset = (page - 1) * pageSize

    const { data: transactions, error, count } = await supabaseAuthClient
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { message: 'Error fetching transactions', error: error.message },
        { status: 500 }
      )
    }
    
    const totalTransactions = count || 0
    const totalPages = Math.ceil(totalTransactions / pageSize)

    return NextResponse.json({
      data: transactions || [],
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalTransactions,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    })
  } catch (e: any) {
    console.error('Unexpected error fetching transactions:', e)
    return NextResponse.json({ message: 'Unexpected error fetching transactions', error: e.message }, { status: 500 })
  }
}

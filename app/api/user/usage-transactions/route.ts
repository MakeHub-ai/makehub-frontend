import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Request, Transaction } from '@/lib/supabase/types'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

interface RequestWithTransaction extends Request {
  transactions: Transaction | null;
}

interface UsageTransaction {
  id: string;
  timestamp: string;
  type: 'api_call' | 'failed_request' | 'credit_purchase' | 'manual_credit';
  amount: number;
  formatted_amount: string;
  transaction_type: 'credit' | 'debit';
  description: string;
  metadata: {
    model?: string;
    provider?: string;
    input_tokens?: number;
    output_tokens?: number;
    cached_tokens?: number;
    status?: string;
    error_message?: string;
    request_id?: string;
    transaction_id: string;
  };
}

function formatCurrency(amount: number): string {
  const value = Math.abs(amount);
  
  if (value === 0) return "0.00 $";
  
  if (value < 0.0001) {
    return `${value.toExponential(2)} $`;
  }
  
  if (value < 0.01) {
    return `${value.toFixed(6)} $`;
  }
  
  return `${value.toFixed(4)} $`;
}

function transformRequestToUsage(request: RequestWithTransaction): UsageTransaction {
  const transaction = request.transactions;
  const amount = Math.abs(transaction?.amount || 0);
  
  return {
    id: request.request_id,
    timestamp: request.created_at,
    type: request.status === 'completed' ? 'api_call' : 'failed_request',
    amount,
    formatted_amount: formatCurrency(amount),
    transaction_type: transaction?.type || 'debit',
    description: `${request.provider}/${request.model}`,
    metadata: {
      model: request.model,
      provider: request.provider,
      input_tokens: request.input_tokens || undefined,
      output_tokens: request.output_tokens || undefined,
      cached_tokens: request.cached_tokens || undefined,
      status: request.status,
      error_message: request.error_message || undefined,
      request_id: request.request_id,
      transaction_id: transaction?.id || ''
    }
  };
}

function transformOrphanTransactionToUsage(transaction: Transaction): UsageTransaction {
  const amount = Math.abs(transaction.amount);
  
  return {
    id: transaction.id,
    timestamp: transaction.created_at,
    type: transaction.type === 'credit' ? 'credit_purchase' : 'manual_credit',
    amount,
    formatted_amount: formatCurrency(amount),
    transaction_type: transaction.type,
    description: transaction.type === 'credit' ? 'Credit Purchase' : 'Manual Credit',
    metadata: {
      transaction_id: transaction.id
    }
  };
}

export async function GET(request: NextRequest) {
  try {
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

    // 1. Récupérer les requêtes avec leurs transactions
    const { data: requestsWithTransactions, error: requestsError } = await supabaseAuthClient
      .from('requests')
      .select(`
        *,
        transactions!fk_requests_transaction (
          id,
          amount,
          type,
          created_at
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching requests:', requestsError)
      return NextResponse.json(
        { message: 'Error fetching requests', error: requestsError.message },
        { status: 500 }
      )
    }

    // 2. Récupérer les transactions orphelines (sans request_id)
    const { data: orphanTransactions, error: transactionsError } = await supabaseAuthClient
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .is('request_id', null)
      .order('created_at', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching orphan transactions:', transactionsError)
      return NextResponse.json(
        { message: 'Error fetching transactions', error: transactionsError.message },
        { status: 500 }
      )
    }

    // 3. Transformer et combiner les données
    const requestUsageItems: UsageTransaction[] = (requestsWithTransactions || []).map(transformRequestToUsage)
    const orphanUsageItems: UsageTransaction[] = (orphanTransactions || []).map(transformOrphanTransactionToUsage)
    
    // 4. Combiner et trier par timestamp
    const allUsageItems = [...requestUsageItems, ...orphanUsageItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // 5. Pagination
    const totalItems = allUsageItems.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const offset = (page - 1) * pageSize
    const paginatedItems = allUsageItems.slice(offset, offset + pageSize)

    return NextResponse.json({
      data: paginatedItems,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    })
  } catch (e: any) {
    console.error('Unexpected error fetching usage transactions:', e)
    return NextResponse.json({ 
      message: 'Unexpected error fetching usage transactions', 
      error: e.message 
    }, { status: 500 })
  }
}

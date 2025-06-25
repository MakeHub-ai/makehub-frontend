import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period_days = Number(searchParams.get('period_days') || 30)

    // Try to get both cost and tokens per model from the RPC
    let { data, error } = await supabase.rpc('get_cost_distribution_by_model', {
      period_days,
      uid: session.user.id,
    });

    // If total_tokens is missing, compute it manually
    if (!error && data && data.length > 0 && data[0].total_tokens === undefined) {
      // Fallback: manual aggregation
      const { data: tokensData, error: tokensError } = await supabase
        .from('requests')
        .select('model, provider, input_tokens, output_tokens')
        .eq('user_id', session.user.id)
        .gte('created_at', new Date(Date.now() - period_days * 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'completed');

      if (!tokensError && tokensData) {
        // Aggregate tokens per model
        const tokensMap: Record<string, number> = {};
        for (const row of tokensData) {
          const model = row.model;
          const input = Number(row.input_tokens) || 0;
          const output = Number(row.output_tokens) || 0;
          tokensMap[model] = (tokensMap[model] || 0) + input + output;
        }
        data = data.map((d: any) => ({
          ...d,
          total_tokens: tokensMap[d.model] || 0,
        }));
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

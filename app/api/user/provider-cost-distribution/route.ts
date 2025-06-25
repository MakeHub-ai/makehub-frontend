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
    const period_days = Number(searchParams.get('period_days') || 7)

    // Get all requests for this user in the period, join with models for pricing
    const since = new Date(Date.now() - period_days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('requests')
      .select(`
        provider,
        model,
        input_tokens,
        output_tokens,
        models:models!inner(
          provider,
          model_id,
          price_per_input_token,
          price_per_output_token
        )
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .gte('created_at', since);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by provider and calculate cost
    const providerMap: Record<string, { total_cost: number, total_tokens: number }> = {};
    for (const row of data || []) {
      const provider = row.provider;
      const tokens = (Number(row.input_tokens) || 0) + (Number(row.output_tokens) || 0);
      const price_in = Array.isArray(row.models) ? Number(row.models[0]?.price_per_input_token) || 0 : 0;
      const price_out = Array.isArray(row.models) ? Number(row.models[0]?.price_per_output_token) || 0 : 0;
      const cost = (Number(row.input_tokens) || 0) * price_in + (Number(row.output_tokens) || 0) * price_out;
      if (!providerMap[provider]) {
        providerMap[provider] = { total_cost: 0, total_tokens: 0 };
      }
      providerMap[provider].total_cost += cost;
      providerMap[provider].total_tokens += tokens;
    }

    const result = Object.entries(providerMap).map(([provider, vals]) => ({
      provider,
      total_cost: vals.total_cost,
      total_tokens: vals.total_tokens,
    }));

    return NextResponse.json({ data: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

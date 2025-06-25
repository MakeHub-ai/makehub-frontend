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

    // Get first and last day of current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Fetch all requests for this user in the current month, join with models for pricing
    const { data, error } = await supabase
      .from('requests')
      .select(`
        created_at,
        input_tokens,
        output_tokens,
        provider,
        model,
        models:models!inner(
          provider,
          model_id,
          price_per_input_token,
          price_per_output_token
        )
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by day and calculate cost
    const dayMap: Record<string, number> = {};
    let totalRequests = 0;
    let matchedPrice = 0;
    let unmatchedPrice = 0;
    for (const row of data || []) {
      totalRequests++;
      const date = new Date(row.created_at);
      const day = date.getDate(); // 1-based
      // Find the correct model/pricing for this request
      let price_in = 0;
      let price_out = 0;
      let found = false;
      if (Array.isArray(row.models)) {
        const match = row.models.find(
          (m: any) =>
            m.provider === row.provider &&
            m.model_id === row.model
        );
        if (match) {
          price_in = Number(match.price_per_input_token) || 0;
          price_out = Number(match.price_per_output_token) || 0;
          found = true;
        }
      }
      if (found) {
        matchedPrice++;
      } else {
        unmatchedPrice++;
      }
      const cost = (Number(row.input_tokens) || 0) * price_in + (Number(row.output_tokens) || 0) * price_out;
      dayMap[day] = (dayMap[day] || 0) + cost;
    }

    // Build daily cost array (1-based, fill missing days with 0)
    const daysInMonth = lastDay.getDate();
    const dailyCosts = [];
    for (let d = 1; d <= daysInMonth; ++d) {
      dailyCosts.push(dayMap[d] || 0);
    }

    return NextResponse.json({ 
      data: dailyCosts,
      debug: {
        totalRequests,
        matchedPrice,
        unmatchedPrice
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

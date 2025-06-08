import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or no user for API key stats:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: stats, error: rpcError } = await supabase.rpc('get_api_key_stats_for_user', {
      p_user_id: user.id,
    });

    if (rpcError) {
      console.error('Error fetching API key stats from RPC:', rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    // The RPC function is expected to return an array of objects,
    // each object containing stats for one API key.
    return NextResponse.json(stats);

  } catch (e: any) {
    console.error('Unexpected error in GET /api/api-key-stats:', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

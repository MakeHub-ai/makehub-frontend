
// app/api/user/models/route.ts
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: modelUsage, error } = await supabase
      .rpc('get_user_model_usage', { 
        p_user_id: user.id,
        p_limit: limit 
      });

    if (error) {
      console.error('Error fetching model usage:', error);
      return NextResponse.json({ error: 'Failed to fetch model usage' }, { status: 500 });
    }

    return NextResponse.json({
      data: modelUsage || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ApiSecurityStats } from '@/lib/supabase/types';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les statistiques de sécurité des clés API
    const { data: apiSecurityStats, error: statsError } = await supabase
      .rpc('get_api_security_stats', { p_user_id: user.id });

    if (statsError) {
      console.error('Error fetching API security stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch API security stats' }, { status: 500 });
    }

    return NextResponse.json({
      data: apiSecurityStats || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error fetching API security stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

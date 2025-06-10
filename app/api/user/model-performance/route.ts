import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ModelPerformanceStats } from '@/lib/supabase/types';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les stats de performance par modèle
    const { data: modelStats, error: statsError } = await supabase
      .rpc('get_model_performance_stats', { p_user_id: user.id });

    if (statsError) {
      console.error('Error fetching model performance stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch model performance stats' }, { status: 500 });
    }

    return NextResponse.json({
      data: modelStats || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error fetching model performance stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

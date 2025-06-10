import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ProviderStatistics } from '@/lib/supabase/types';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les statistiques par provider
    const { data: providerStats, error: statsError } = await supabase
      .rpc('get_provider_statistics', { p_user_id: user.id });

    if (statsError) {
      console.error('Error fetching provider statistics:', statsError);
      return NextResponse.json({ error: 'Failed to fetch provider statistics' }, { status: 500 });
    }

    return NextResponse.json({
      data: providerStats || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error fetching provider statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

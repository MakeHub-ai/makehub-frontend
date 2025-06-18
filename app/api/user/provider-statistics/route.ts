import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Interface pour les données retournées par get_provider_statistics
interface ProviderStatsFromDB {
  provider: string;
  total_requests: number;
  successful_requests: number;
  error_requests: number;
  success_rate: number;
  avg_latency_ms: number | null;
  avg_throughput: number | null;
  total_cost: number;
  models_used: number;
  requests_last_24h: number;
  requests_last_week: number;
  requests_last_month: number;
  market_share: number;
  cost_per_token: number;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    try {
      // Appeler la fonction RPC get_provider_statistics qui retourne déjà les données agrégées par provider
      const { data: providerStats, error: statsError } = await supabase
        .rpc('get_provider_statistics', { p_user_id: user.id });

      if (statsError) {
        console.error('Supabase RPC Error Details:', {
          code: statsError.code,
          message: statsError.message,
          details: statsError.details,
          hint: statsError.hint
        });
        
        return NextResponse.json({ 
          error: 'Failed to fetch provider statistics', 
          details: statsError.message 
        }, { status: 500 });
      }

      // Les données arrivent déjà agrégées par provider, pas besoin de traitement supplémentaire
      const finalProviderStats = (providerStats || []).map((stat: ProviderStatsFromDB) => ({
        provider: stat.provider,
        total_requests: stat.total_requests,
        successful_requests: stat.successful_requests,
        error_requests: stat.error_requests,
        success_rate: stat.success_rate,
        avg_latency_ms: stat.avg_latency_ms,
        avg_throughput: stat.avg_throughput,
        total_cost: stat.total_cost,
        models_used: stat.models_used,
        requests_last_24h: stat.requests_last_24h,
        requests_last_week: stat.requests_last_week,
        requests_last_month: stat.requests_last_month,
        market_share: stat.market_share,
        cost_per_token: stat.cost_per_token,
      }));


      return NextResponse.json({
        data: finalProviderStats,
        timestamp: new Date().toISOString()
      });

    } catch (rpcError) {
      console.error('RPC Call Error:', rpcError);
      throw rpcError;
    }

  } catch (error) {
    console.error('Unexpected error fetching provider statistics:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

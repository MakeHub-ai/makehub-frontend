import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { BillingDetails } from '@/lib/supabase/types';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les détails de facturation
    const { data: billingDetails, error: statsError } = await supabase
      .rpc('get_billing_details', { p_user_id: user.id });

    if (statsError) {
      console.error('Error fetching billing details:', statsError);
      return NextResponse.json({ error: 'Failed to fetch billing details' }, { status: 500 });
    }

    return NextResponse.json({
      data: billingDetails || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error fetching billing details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

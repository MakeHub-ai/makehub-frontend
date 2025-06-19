import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Model } from '@/types/models'

export async function GET() {
  try {
    // Pas besoin d'auth pour la liste des modèles - c'est public
    const supabaseServer = createServiceRoleClient()
    
    const { data, error } = await supabaseServer
      .from('models')
      .select('*')

    if (error) {
      console.error('Error fetching models:', error)
      return NextResponse.json(
        { message: 'Error fetching models', error: error.message },
        { status: 500 }
      )
    }

    const modelsWithOrg = data?.map(model => {
      const parts = model.model_id.split('/');
      const organisation = parts[0] || 'unknown';
      const model_name = parts[1] || model.display_name || 'Unknown Model';
      
      return {
        // Champs principaux requis
        model_id: model.model_id,
        provider: model.provider,
        provider_model_id: model.provider_model_id,
        display_name: model.display_name,
        price_per_input_token: model.price_per_input_token,
        price_per_output_token: model.price_per_output_token,
        quantisation: model.quantisation,
        
        // Mapping correct : context_window -> context
        context: model.context_window,
        
        // Champs calculés
        organisation,
        model_name,
        
        // Champs optionnels de la DB
        base_url: model.base_url,
        window_size: model.window_size,
        support_tool_calling: model.support_tool_calling,
        max_output_token: model.max_output_token,
        support_input_cache: model.support_input_cache,
        support_vision: model.support_vision,
        price_per_input_token_cached: model.price_per_input_token_cached,
        pricing_method: model.pricing_method,
        adapter: model.adapter,
        api_key_name: model.api_key_name,
        tokenizer_name: model.tokenizer_name,
        extra_param: model.extra_param,
      };
    });

    return NextResponse.json(modelsWithOrg || [])
  } catch (e: any) {
    console.error('Unexpected error fetching models:', e)
    return NextResponse.json(
      { message: 'Unexpected error fetching models', error: e.message },
      { status: 500 }
    )
  }
}

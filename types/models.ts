export interface Model {
  model_name: string;
  display_name: string | null;
  model_id: string;
  provider: string;
  organisation: string;
  price_per_output_token: number;
  price_per_input_token: number;
  quantisation: string | null;
  context: number | null;
  provider_model_id: string;
  // Champs additionnels de la DB qui pourraient être utiles
  base_url?: string | null;
  window_size?: number | null;
  support_tool_calling?: boolean | null;
  max_output_token?: number | null;
  support_input_cache?: boolean | null;
  support_vision?: boolean | null;
  price_per_input_token_cached?: number | null;
  pricing_method?: string | null;
  adapter?: string | null;
  api_key_name?: string | null;
  tokenizer_name?: string | null;
  extra_param?: Record<string, any> | null;
}

export interface ModelsResponse {
  data: Model[];
  error?: string;
}

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
}

export interface OpenAIModelsResponse {
  object: string;
  data: OpenAIModel[];
}

export type ProviderLogo = {
  name: string;
  path: string;
};
// Family routing config types
export interface ScoreRange {
  min_score: number;
  max_score: number;
  reason: string;
  target_model: string;
}

export interface RoutingConfig {
  score_ranges: ScoreRange[];
  fallback_model: string;
  fallback_provider: string;
  evaluation_prompt: string;
  evaluation_timeout_ms: number;
  cache_duration_minutes: number;
}

export interface Family {
  family_id: string;
  display_name: string;
  description: string | null;
  evaluation_model_id: string;
  evaluation_provider: string;
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  routing_config: RoutingConfig;
}

export type ModelsData = {
  [provider: string]: Model[];
};

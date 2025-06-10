    export interface UserStats {
  balance: number;
  total_spent: number;
  total_credits: number;
  total_requests: number;
  successful_requests: number;
  error_requests: number;
  pending_requests: number;
  requests_last_24h: number;
  requests_last_week: number;
  requests_last_month: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cached_tokens: number;
  avg_latency_ms: number | null;
  avg_throughput: number | null;
  last_request_at: string | null;
  first_request_at: string | null;
  active_api_keys: number;
  streaming_requests: number;
}

// Types pour les nouvelles fonctions RPC
export interface ModelPerformanceStats {
  model_id: string;
  provider: string;
  display_name: string | null;
  total_requests: number;
  successful_requests: number;
  error_requests: number;
  success_rate: number;
  avg_latency_ms: number | null;
  avg_throughput: number | null;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  last_used_at: string | null;
  first_used_at: string | null;
}

export interface ProviderStatistics {
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
}

export interface ApiSecurityStats {
  api_key_name: string;
  api_key_id: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  total_requests: number;
  requests_last_24h: number;
  requests_last_week: number;
  successful_requests: number;
  error_requests: number;
  unique_models_used: number;
  total_cost: number;
}

export interface UsageTimeline {
  date: string;
  total_requests: number;
  successful_requests: number;
  error_requests: number;
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_latency_ms: number | null;
  unique_models: number;
  unique_providers: number;
}

export interface BillingDetails {
  transaction_id: string;
  amount: number;
  type: string;
  created_at: string;
  request_id: string | null;
  model: string | null;
  provider: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  running_balance: number;
}

export interface Wallet {
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Request {
  request_id: string;
  user_id: string;
  transaction_id: string | null;
  api_key_name: string | null;
  provider: string;
  model: string;
  input_tokens: number | null;
  output_tokens: number | null;
  cached_tokens: number | null;
  error_message: string | null;
  status: 'pending' | 'completed' | 'error';
  streaming: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  request_id: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  api_key: string;
  api_key_name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface Model {
  model_id: string;
  provider: string;
  api_key_name: string | null;
  adapter: string;
  window_size: number | null;
  context_window: number | null;
  quantisation: string | null;
  support_tool_calling: boolean;
  price_per_input_token: number;
  price_per_output_token: number;
  extra_param: Record<string, any>;
  created_at: string;
  updated_at: string;
  base_url: string | null;
  provider_model_id: string;
  display_name: string | null;
  max_output_token: number | null;
  support_input_cache: boolean | null;
  support_vision: boolean | null;
  price_per_input_token_cached: number | null;
  tokenizer_name: string;
}

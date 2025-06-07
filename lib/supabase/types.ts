    export interface UserStats {
  balance: number;
  total_requests: number;
  successful_requests: number;
  error_requests: number;
  total_tokens: number;
  avg_latency_ms: number | null;
  last_request_at: string | null;
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
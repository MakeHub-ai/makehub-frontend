export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  user_id: string;
  // New fields for statistics (optional)
  total_requests?: number;
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_cached_tokens?: number;
  input_cost_total?: number;
  output_cost_total?: number;
  cached_cost_total?: number;
  total_cost?: number;
  first_request?: string;
  last_request?: string;
  avg_input_tokens?: number;
  avg_output_tokens?: number;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface ApiKeyResponse {
  data: ApiKey[];
  error?: string;
}

export interface CreateApiKeyResponse {
  data: ApiKey;
  error?: string;
}

// lib/types.ts - Types partagés pour les données Supabase

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

export interface ApiRequest {
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

// Types pour les réponses API paginées
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Types pour les réponses API simples
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
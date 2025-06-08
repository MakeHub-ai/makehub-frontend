// types/dashboard.ts
export interface DashboardStats {
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
  avg_latency_ms: number;
  avg_throughput: number;
  last_request_at: string;
  first_request_at: string;
  active_api_keys: number;
  streaming_requests: number;
}

export interface ModelUsage {
  model: string;
  provider: string;
  usage_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_latency_ms: number;
  last_used_at: string;
}

export interface TimelineStats {
  date: string;
  requests_count: number;
  successful_requests: number;
  error_requests: number;
  total_tokens: number;
  total_cost: number;
}

export interface GraphItem {
  id: string;
  model: string;
  usage_count: number;
}

export interface UsageItem {
  id: string;
  timestamp: string;
  type: string; // e.g., 'API Call', 'Failed Request', 'Credit Purchase'
  units: string; // e.g., '$0.0025', '100 credits'
  description: string; // e.g., 'gpt-3.5-turbo', 'Stripe Payment'
  metadata: {
    transaction_type: string; // 'debit' or 'credit'
    details: {
      model?: string;
      provider?: string;
      input_tokens?: number | null; // Generic input tokens
      output_tokens?: number | null; // Generic output tokens
      prompt_tokens?: number; // Specific for some models/providers
      completion_tokens?: number; // Specific for some models/providers
      status?: string; // 'completed', 'failed', 'pending'
      error?: string | null;
      latency?: number; // Added latency
      // For credit purchases
      payment_method?: string;
      invoice_id?: string;
    };
  };
}

export interface CostDistributionItem {
  date: string; // YYYY-MM-DD
  total_cost: number;
  models: {
    [model_name: string]: number; // Cost per model for that day
  };
}

export interface SavingsDataItem {
  date: string; // YYYY-MM-DD
  actual_cost: number;
  max_cost: number; // Estimated cost without optimization
  savings: number;
  count: number; // Number of requests/transactions for that day
}

export interface UsageResponseData {
  object: 'usage_report';
  total_usage: number; // Total cost/usage for the current period
  total_credits: number; // Current credit balance
  total_requests: number;
  current_plan: string; // e.g., 'Free Plan', 'Pro Plan'
  is_free_plan: boolean;
  items: UsageItem[]; // Detailed list of usage items (transactions, API calls)
  graph_items: GraphItem[]; // Data for model usage graphs
  cost_distribution: CostDistributionItem[]; // Data for cost distribution over time
  savings_data: SavingsDataItem[]; // Data for savings visualization
  has_more: boolean; // For pagination of items
  next_offset: number | null; // For pagination of items
}

export interface UsageResponse {
  data: UsageResponseData;
}

export interface UsagePaginatedData {
  items: UsageItem[];
  hasMore: boolean;
  nextOffset: number | null;
}

export interface StatCardProps {
  icon: React.ElementType; // Ou un type plus spécifique si tous les icônes viennent de lucide-react
  title: string;
  value: string | number;
}

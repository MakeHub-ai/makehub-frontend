export interface UserData {
  credits: {
    available: number;
    used: number;
    totalRequests: number;
  };
  plan: {
    type: string;
    isFree: boolean;
  };
  usage: UsageItem[];
}

export interface CostDistributionItem {
  date: string;
  total_cost: number;
  models: {
    [model: string]: number;
  };
}

export interface UsageResponse {
  data: {
    object: 'usage_report';
    total_usage: number;
    total_credits: number;
    total_requests: number;
    current_plan: string;
    is_free_plan: boolean;
    items: UsageItem[];
    graph_items: GraphItem[];
    cost_distribution: CostDistributionItem[];
    savings_data: SavingsDataItem[];
    has_more: boolean;
    next_offset: number | null;
  };
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export interface GetUsageResponse {
  data: UsageResponse['data'];
  meta: {
    request_id: string;
    timestamp: string;
  };
  error?: {
    message: string;
    type: string;
    code: string;
    request_id: string;
  };
}

export interface UsageItem {
  id: string;
  timestamp: string;
  type: string;
  units: string;
  description?: string;
  metadata: {
    transaction_type: 'credit' | 'debit';
    details?: {
      model?: string;
      provider?: string;
      [key: string]: any;
    };
  };
}

export interface GraphItem {
  id: string;
  model: string;
  usage_count: number;
}

export interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  variant?: 'default' | 'credit';
  isFree?: boolean;
}

export interface SavingsDataItem {
  date: string;
  actual_cost: number;
  max_cost: number;
  savings: number;
  count: number;
}

export interface UsagePaginatedData {
  items: UsageItem[];
  hasMore: boolean;
  nextOffset: number | null;
}

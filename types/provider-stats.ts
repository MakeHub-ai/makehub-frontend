export interface ProviderScore {
  costEfficiency: number;    // 40% weight - lower cost = higher score
  performance: number;       // 35% weight - lower latency + higher success rate
  usagePopularity: number;   // 25% weight - higher usage = higher score
  totalScore: number;        // Weighted average
  
  // New production-focused scores
  speed: number;             // Tokens per second score (0-100)
  latency: number;           // Time to first token score (0-100)
  price: number;             // Cost efficiency score (0-100)
  reliability: number;       // Completion rate score (0-100)
  selection: number;         // Selection frequency score (0-100)
}

export interface ProviderMetrics {
  costPerToken: number;
  avgLatency: number;
  successRate: number;
  totalRequests: number;
  totalCost: number;
  popularModels: string[];
  tokenThroughput: number;
  totalTokens: number;
  
  // New production metrics
  tokensPerSecond: number;      // Speed metric
  timeToFirstToken: number;     // Latency metric
  completionRate: number;       // Reliability metric
  selectionFrequency: number;   // How often load balancer selects this provider
  modelFamilies: string[];      // Model families this provider offers
}

export interface ProviderStats {
  name: string;
  category: 'open-source' | 'closed-source';
  logo?: string;
  metrics: ProviderMetrics;
  rank: number;
  score: ProviderScore;
}

export interface ProviderRankingData {
  openSource: ProviderStats[];
  closedSource: ProviderStats[];
  lastUpdated: string;
  summary: {
    bestOpenSource: ProviderStats | null;
    bestClosedSource: ProviderStats | null;
    mostCostEfficient: ProviderStats | null;
    fastestResponse: ProviderStats | null;
  };
  
  // New redesigned data structure
  insights?: ProductionInsights;
  modelFamilies?: ModelFamily[];
  totalTransactions?: number;
}

/**
 * Model family with provider comparisons
 */
export interface ModelFamily {
  name: string;           // e.g., "Llama 3.1", "CodeLlama", "BGE Embeddings"
  models: string[];       // Specific models in this family
  providers: ModelFamilyProvider[];
}

/**
 * Provider performance for a specific model family
 */
export interface ModelFamilyProvider {
  name: string;
  category: 'open-source' | 'closed-source';
  logo: string;
  models: string[];       // Which models from this family they offer
  metrics: ProviderMetrics;
  score: ProviderScore;
  rank: number;          // Rank within this model family
}

/**
 * Production insights summary
 */
export interface ProductionInsights {
  mostSelected: ProviderStats | null;        // Highest selection frequency
  mostReliable: ProviderStats | null;        // Highest completion rate
  speedChampion: ProviderStats | null;       // Highest tokens per second
  priceLeader: ProviderStats | null;         // Lowest cost per million tokens
  overallChampion: ProviderStats | null;     // Highest total score
  totalProviders: number;
  totalRequests: number;
  avgSelectionBias: number;                  // How skewed the selections are
}

/**
 * Provider type filter
 */
export type ProviderType = 'open-source' | 'closed-source' | 'all';

export interface ProviderRankingCardProps {
  provider: ProviderStats;
  showDetailedMetrics?: boolean;
  onProviderClick?: (provider: ProviderStats) => void;
}

export interface ProviderRankingSectionProps {
  title: string;
  providers: ProviderStats[];
  category: 'open-source' | 'closed-source';
  showTopN?: number;
}

export interface ProviderComparisonChartProps {
  openSourceProviders: ProviderStats[];
  closedSourceProviders: ProviderStats[];
  modelFamilies?: ModelFamily[];
  providerType?: ProviderType;
}

export interface BestProviderRecommendationsProps {
  summary: ProviderRankingData['summary'];
}

// New component prop interfaces for redesigned system
export interface ProductionInsightsSectionProps {
  insights: ProductionInsights;
}

export interface ProviderTypeToggleProps {
  currentType: ProviderType;
  onTypeChange: (type: ProviderType) => void;
}

export interface ModelFamilySectionProps {
  modelFamily: ModelFamily;
  providerType: ProviderType;
}

export interface ModelFamilyCardProps {
  provider: ModelFamilyProvider;
  modelFamily: string;
}

// Provider categorization mapping
export const PROVIDER_CATEGORIES: Record<string, 'open-source' | 'closed-source'> = {
  // Open Source
  'huggingface': 'open-source',
  'together': 'open-source',
  'replicate': 'open-source',
  'ollama': 'open-source',
  'fireworks': 'open-source',
  'anyscale': 'open-source',
  'deepinfra': 'open-source',
  'perplexity': 'open-source',
  
  // Closed Source
  'openai': 'closed-source',
  'anthropic': 'closed-source',
  'google': 'closed-source',
  'cohere': 'closed-source',
  'xai': 'closed-source',
  'grok': 'closed-source',
  'claude': 'closed-source',
  'gemini': 'closed-source',
  'gpt': 'closed-source',
  'vertex': 'closed-source',
  'azure': 'closed-source',
};

// Provider display names mapping
export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  'huggingface': 'Hugging Face',
  'together': 'Together AI',
  'replicate': 'Replicate',
  'ollama': 'Ollama',
  'fireworks': 'Fireworks AI',
  'anyscale': 'Anyscale',
  'deepinfra': 'DeepInfra',
  'perplexity': 'Perplexity',
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'google': 'Google',
  'cohere': 'Cohere',
  'xai': 'xAI',
  'grok': 'Grok',
  'claude': 'Claude',
  'gemini': 'Gemini',
  'gpt': 'GPT',
};
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { 
  UsageResponse, 
  UsageItem, 
  UsagePaginatedData, 
  GraphItem, 
  SavingsDataItem, 
  CostDistributionItem 
} from '@/types/dashboard';
import type { 
  UserStats, 
  Wallet, 
  Request as BaseApiRequest, 
  Transaction 
} from '@/lib/supabase/types';

// Type étendu pour les requêtes avec données de transaction
interface ApiRequest extends BaseApiRequest {
  transactions?: {
    amount: number;
    type: string;
  } | null;
}

// Cache management for localStorage persistence
const CACHE_KEY = 'dashboard-data-cache-v2'; // Changed key to force cache refresh
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CacheData {
  data: UsageResponse['data'];
  timestamp: number;
  userId?: string;
}

const saveToCache = (data: UsageResponse['data'], userId?: string) => {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save data to cache:', error);
  }
};

const loadFromCache = (userId?: string): UsageResponse['data'] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cacheData: CacheData = JSON.parse(cached);
    
    // Check if cache is valid (not expired and same user)
    const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
    const isDifferentUser = userId && cacheData.userId && cacheData.userId !== userId;
    
    if (isExpired || isDifferentUser) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    console.warn('Failed to load data from cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

interface DashboardDataState {
  usageData: UsageResponse['data'] | null;
  usageItems: UsageItem[];
  paginatedUsageData: UsagePaginatedData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataState | undefined>(undefined);

/**
 * Récupère les données utilisateur depuis les API routes locales
 */
async function getUserUsageData(offset: number = 0): Promise<{ data: UsageResponse['data'] }> {
  try {
    // Récupérer les données principales, les requêtes et les statistiques provider pour les vrais coûts
    const [userStatsResponse, requestsResponse, providerStatsResponse] = await Promise.all([
      fetch('/api/user/stats', {
        method: 'GET',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch user stats: ${res.status}`);
        return res.json();
      }),
      
      fetch(`/api/user/requests?page=1&pageSize=${20 + offset}`, {
        method: 'GET',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch requests: ${res.status}`);
        return res.json() as Promise<{ data: ApiRequest[]; pagination: any; }>;
      }),

      fetch('/api/user/provider-statistics', {
        method: 'GET',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch provider statistics: ${res.status}`);
        return res.json();
      })
    ]);

    // Logs pour débugger les réponses des API
    console.log('🔍 Dashboard Data - User Stats Response:', userStatsResponse);
    console.log('🔍 Dashboard Data - Requests Response:', requestsResponse);
    console.log('🔍 Dashboard Data - Provider Stats Response:', providerStatsResponse);

    const userStats = userStatsResponse.data as UserStats;
    const providerStats = providerStatsResponse.data || [];

    // Créer une map des coûts par token par provider pour les calculs précis
    const providerCostMap = new Map<string, number>();
    providerStats.forEach((stat: any) => {
      if (stat.cost_per_token && stat.cost_per_token > 0) {
        providerCostMap.set(stat.provider.toLowerCase(), stat.cost_per_token);
      }
    });

    // Transformer les requêtes en items d'usage pour la liste détaillée avec les vrais montants des transactions
    const usageItems = transformRequestsToUsageItems(requestsResponse.data);
    const graphItems = generateGraphItems(requestsResponse.data);
    
    // Générer des données de distribution et économies basées sur les requêtes avec vrais montants de transactions
    const costDistribution = generateCostDistributionFromRequestsWithTransactions(requestsResponse.data);
    const savingsData = generateSavingsDataFromRequestsWithTransactions(requestsResponse.data);

    // Déterminer le type de plan basé sur le solde
    const isFree = userStats.balance <= 0;
    const currentPlan = isFree ? 'Free Plan' : 'Paid Plan';

    const data: UsageResponse['data'] = {
      object: 'usage_report',
      total_usage: userStats.total_spent,
      total_credits: userStats.balance,
      total_requests: userStats.total_requests,
      current_plan: currentPlan,
      is_free_plan: isFree,
      items: usageItems,
      graph_items: graphItems,
      cost_distribution: costDistribution,
      savings_data: savingsData,
      has_more: requestsResponse.pagination.hasNextPage,
      next_offset: requestsResponse.pagination.hasNextPage ? offset + 20 : null,
    };

    return { data };
  } catch (error) {
    console.error('Error fetching user usage data:', error);
    throw error;
  }
}

/**
 * Transforme les requêtes API en UsageItems avec les vrais montants des transactions
 */
function transformRequestsToUsageItems(requests: ApiRequest[]): UsageItem[] {
  return requests.map(request => {
    // Utiliser le montant réel de la transaction si disponible
    const transactionAmount = request.transactions?.amount || 0;
    const cost = Math.abs(transactionAmount);
    
    return {
      id: request.request_id,
      timestamp: request.created_at,
      type: request.status === 'completed' ? 'API Call' : 'Failed Request',
      units: `$${cost.toFixed(4)}`,
      description: `${request.provider}/${request.model}`,
      metadata: {
        transaction_type: request.transactions?.type || 'debit',
        details: {
          model: request.model,
          provider: request.provider,
          input_tokens: request.input_tokens,
          output_tokens: request.output_tokens,
          status: request.status,
          error: request.error_message,
        }
      }
    };
  });
}

/**
 * Génère les éléments graphiques depuis les requêtes
 */
function generateGraphItems(requests: ApiRequest[]): GraphItem[] {
  const modelCounts: { [key: string]: number } = {};
  
  requests.forEach(request => {
    if (request.status === 'completed') {
      const key = `${request.provider}/${request.model}`;
      modelCounts[key] = (modelCounts[key] || 0) + 1;
    }
  });

  return Object.entries(modelCounts).map(([model, count], index) => ({
    id: `graph_${index}`,
    model,
    usage_count: count
  }));
}

/**
 * Génère la distribution des coûts depuis les transactions
 */
function generateCostDistribution(transactions: Transaction[]): CostDistributionItem[] {
  const costByDate: { [date: string]: { total: number; models: { [model: string]: number } } } = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0];
    if (!costByDate[date]) {
      costByDate[date] = { total: 0, models: {} };
    }
    costByDate[date].total += Math.abs(transaction.amount);
  });

  return Object.entries(costByDate).map(([date, data]) => ({
    date,
    total_cost: data.total,
    models: data.models
  })).slice(-30); // Derniers 30 jours
}

/**
 * Génère les données d'économies
 */
function generateSavingsData(transactions: Transaction[]): SavingsDataItem[] {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const dayTransactions = transactions.filter(t => 
      new Date(t.created_at).toISOString().split('T')[0] === date
    );
    
    const actualCost = dayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const maxCost = actualCost * 1.3; // Assume 30% savings
    
    return {
      date,
      actual_cost: actualCost,
      max_cost: maxCost,
      savings: maxCost - actualCost,
      count: dayTransactions.length
    };
  });
}

/**
 * Calcule l'utilisation mensuelle
 */
function calculateMonthlyUsage(transactions: Transaction[]): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.amount < 0; // Seulement les transactions de débit
    })
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
}

/**
 * Génère la distribution des coûts depuis les requêtes avec les vrais coûts par provider
 */
function generateCostDistributionFromRequests(requests: ApiRequest[], providerCostMap: Map<string, number>): CostDistributionItem[] {
  const costByDate: { [date: string]: { total: number; models: { [model: string]: number } } } = {};
  
  requests.forEach(request => {
    if (request.status === 'completed') {
      const date = new Date(request.created_at).toISOString().split('T')[0];
      const costPerToken = providerCostMap.get(request.provider.toLowerCase()) || 0.0001;
      const totalTokens = (request.input_tokens || 0) + (request.output_tokens || 0);
      const cost = totalTokens * costPerToken;
      const modelKey = `${request.provider}/${request.model}`;
      
      if (!costByDate[date]) {
        costByDate[date] = { total: 0, models: {} };
      }
      costByDate[date].total += cost;
      costByDate[date].models[modelKey] = (costByDate[date].models[modelKey] || 0) + cost;
    }
  });

  return Object.entries(costByDate).map(([date, data]) => ({
    date,
    total_cost: data.total,
    models: data.models
  })).slice(-30); // Derniers 30 jours
}

/**
 * Génère les données d'économies depuis les requêtes avec les vrais coûts par provider
 */
function generateSavingsDataFromRequests(requests: ApiRequest[], providerCostMap: Map<string, number>): SavingsDataItem[] {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const dayRequests = requests.filter(r => 
      new Date(r.created_at).toISOString().split('T')[0] === date &&
      r.status === 'completed'
    );
    
    const actualCost = dayRequests.reduce((sum, r) => {
      const costPerToken = providerCostMap.get(r.provider.toLowerCase()) || 0.0001;
      const totalTokens = (r.input_tokens || 0) + (r.output_tokens || 0);
      return sum + (totalTokens * costPerToken);
    }, 0);
    const maxCost = actualCost * 1.3; // Assume 30% savings
    
    return {
      date,
      actual_cost: actualCost,
      max_cost: maxCost,
      savings: maxCost - actualCost,
      count: dayRequests.length
    };
  });
}

/**
 * Génère la distribution des coûts depuis les requêtes avec les vrais montants des transactions
 */
function generateCostDistributionFromRequestsWithTransactions(requests: ApiRequest[]): CostDistributionItem[] {
  const costByDate: { [date: string]: { total: number; models: { [model: string]: number } } } = {};
  
  requests.forEach(request => {
    if (request.status === 'completed' && request.transactions) {
      const date = new Date(request.created_at).toISOString().split('T')[0];
      const cost = Math.abs(request.transactions.amount);
      const modelKey = `${request.provider}/${request.model}`;
      
      if (!costByDate[date]) {
        costByDate[date] = { total: 0, models: {} };
      }
      costByDate[date].total += cost;
      costByDate[date].models[modelKey] = (costByDate[date].models[modelKey] || 0) + cost;
    }
  });

  return Object.entries(costByDate).map(([date, data]) => ({
    date,
    total_cost: data.total,
    models: data.models
  })).slice(-30); // Derniers 30 jours
}

/**
 * Génère les données d'économies depuis les requêtes avec les vrais montants des transactions
 */
function generateSavingsDataFromRequestsWithTransactions(requests: ApiRequest[]): SavingsDataItem[] {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const dayRequests = requests.filter(r => 
      new Date(r.created_at).toISOString().split('T')[0] === date &&
      r.status === 'completed' &&
      r.transactions
    );
    
    const actualCost = dayRequests.reduce((sum, r) => {
      return sum + Math.abs(r.transactions!.amount);
    }, 0);
    const maxCost = actualCost * 1.3; // Assume 30% savings
    
    return {
      date,
      actual_cost: actualCost,
      max_cost: maxCost,
      savings: maxCost - actualCost,
      count: dayRequests.length
    };
  });
}

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { session, user } = useAuth();
  const [usageData, setUsageData] = useState<UsageResponse['data'] | null>(null);
  const [usageItems, setUsageItems] = useState<UsageItem[]>([]);
  const [paginatedUsageData, setPaginatedUsageData] = useState<UsagePaginatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = loadFromCache(user?.id);
    if (cachedData) {
      setUsageData(cachedData);
      setUsageItems(cachedData.items);
      setPaginatedUsageData({
        items: cachedData.items,
        hasMore: cachedData.has_more,
        nextOffset: cachedData.next_offset,
      });
      setIsLoading(false); // Skip loading state!
      setLastUpdated(new Date()); // Use current time as approximation
    }
  }, [user?.id]);

  const fetchData = useCallback(async (skipLoadingState = false) => {
    if (!user?.id) {
      setIsLoading(false);
      setError('No authenticated user');
      return;
    }

    try {
      if (!skipLoadingState) {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await getUserUsageData(0);

      // Save to cache for persistence across page refreshes
      saveToCache(response.data, user?.id);

      // Set all data formats for different pages
      setUsageData(response.data);
      setUsageItems(response.data.items);
      setPaginatedUsageData({
        items: response.data.items,
        hasMore: response.data.has_more,
        nextOffset: response.data.next_offset,
      });
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      // Clear cache on error
      clearCache();
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial data fetch - only if no cached data
  useEffect(() => {
    // If we already have cached data, don't fetch again
    if (usageData) {
      return;
    }
    
    // Fetch data for the first time
    fetchData();
  }, [fetchData, usageData]);

  const refresh = useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const response = await getUserUsageData(0);

      // Save to cache for persistence
      saveToCache(response.data, user?.id);

      // Update data without affecting loading state (background refresh)
      setUsageData(response.data);
      setUsageItems(response.data.items);
      setPaginatedUsageData({
        items: response.data.items,
        hasMore: response.data.has_more,
        nextOffset: response.data.next_offset,
      });
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      // Clear cache on error
      clearCache();
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, isRefreshing]);

  const value: DashboardDataState = {
    usageData,
    usageItems,
    paginatedUsageData,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData(): DashboardDataState {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
}

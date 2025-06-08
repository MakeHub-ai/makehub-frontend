'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ProviderRankingData } from '@/types/provider-stats';
import type { UsagePaginatedData } from '@/types/dashboard';
import { processUsageDataForProviders } from '@/lib/provider-stats';
import { useAuth } from '@/contexts/auth-context';
import { getUserUsage } from '@/lib/makehub-client';

interface UseProviderStatsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
}

interface UseProviderStatsReturn {
  data: ProviderRankingData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useProviderStats(options: UseProviderStatsOptions = {}): UseProviderStatsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    limit = 1000 // Fetch more data for better analysis
  } = options;

  const { session } = useAuth();
  const [data, setData] = useState<ProviderRankingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProviderStats = async () => {
    if (!session) {
      setError('No active session');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch usage data - note: the API handles pagination internally
      const response = await getUserUsage(session, 0);

      // Process the usage data to generate provider statistics
      const providerStats = processUsageDataForProviders(response.data.items);
      
      setData(providerStats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching provider statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch provider statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProviderStats();
  }, [session]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !session) return;

    const interval = setInterval(fetchProviderStats, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, session]);

  // Memoized return value to prevent unnecessary re-renders
  const returnValue = useMemo((): UseProviderStatsReturn => ({
    data,
    isLoading,
    error,
    refetch: fetchProviderStats,
    lastUpdated,
  }), [data, isLoading, error, lastUpdated]);

  return returnValue;
}

// Additional hook for specific provider insights
export function useProviderInsights(data: ProviderRankingData | null) {
  return useMemo(() => {
    if (!data) return null;

    const allProviders = [...data.openSource, ...data.closedSource];
    
    return {
      totalProviders: allProviders.length,
      openSourceCount: data.openSource.length,
      closedSourceCount: data.closedSource.length,
      totalRequests: allProviders.reduce((sum, p) => sum + p.metrics.totalRequests, 0),
      totalCost: allProviders.reduce((sum, p) => sum + p.metrics.totalCost, 0),
      averageScore: allProviders.length > 0 
        ? allProviders.reduce((sum, p) => sum + p.score.totalScore, 0) / allProviders.length 
        : 0,
      topPerformer: allProviders.reduce((best, current) => 
        current.score.totalScore > best.score.totalScore ? current : best, 
        allProviders[0]
      ),
      mostUsed: allProviders.reduce((most, current) => 
        current.metrics.totalRequests > most.metrics.totalRequests ? current : most, 
        allProviders[0]
      ),
      categoryComparison: {
        openSource: {
          avgScore: data.openSource.length > 0 
            ? data.openSource.reduce((sum, p) => sum + p.score.totalScore, 0) / data.openSource.length 
            : 0,
          avgCost: data.openSource.length > 0 
            ? data.openSource.reduce((sum, p) => sum + p.metrics.costPerToken, 0) / data.openSource.length 
            : 0,
          totalRequests: data.openSource.reduce((sum, p) => sum + p.metrics.totalRequests, 0),
        },
        closedSource: {
          avgScore: data.closedSource.length > 0 
            ? data.closedSource.reduce((sum, p) => sum + p.score.totalScore, 0) / data.closedSource.length 
            : 0,
          avgCost: data.closedSource.length > 0 
            ? data.closedSource.reduce((sum, p) => sum + p.metrics.costPerToken, 0) / data.closedSource.length 
            : 0,
          totalRequests: data.closedSource.reduce((sum, p) => sum + p.metrics.totalRequests, 0),
        },
      },
    };
  }, [data]);
}

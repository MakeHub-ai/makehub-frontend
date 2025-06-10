'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UsageTimeline } from '@/lib/supabase/types';

interface UseUsageTimelineResult {
  data: UsageTimeline[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: (days?: number) => Promise<void>;
}

export function useUsageTimeline(initialDays: number = 30): UseUsageTimelineResult {
  const [data, setData] = useState<UsageTimeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (days: number = initialDays, skipLoadingState = false) => {
    try {
      if (!skipLoadingState) {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/user/timeline?days=${days}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch usage timeline: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
      setLastUpdated(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch usage timeline');
    } finally {
      setIsLoading(false);
    }
  }, [initialDays]);

  // Initial data fetch
  useEffect(() => {
    fetchData(initialDays);
  }, [fetchData, initialDays]);

  const refresh = useCallback(async (days: number = initialDays) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      await fetchData(days, true);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchData, isRefreshing, initialDays]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  };
}

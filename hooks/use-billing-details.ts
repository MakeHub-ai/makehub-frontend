'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BillingDetails } from '@/lib/supabase/types';

interface UseBillingDetailsResult {
  data: BillingDetails[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useBillingDetails(): UseBillingDetailsResult {
  const [data, setData] = useState<BillingDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (skipLoadingState = false) => {
    try {
      if (!skipLoadingState) {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/user/billing-details', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch billing details: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
      setLastUpdated(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch billing details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      await fetchData(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchData, isRefreshing]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  };
}

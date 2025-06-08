// Hook optimisé avec cache et chargement progressif
// hooks/useDashboardData.ts (version optimisée)
import { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useDashboardData() {
  // Stats principales avec cache courte (30s)
  const { data: statsResponse, error: statsError, mutate: mutateStats } = useSWR(
    '/api/user/stats',
    fetcher,
    { 
      refreshInterval: 30000, // 30s
      revalidateOnFocus: true 
    }
  );

  // Modèles avec cache plus longue (5min)
  const { data: modelsResponse, error: modelsError } = useSWR(
    '/api/user/models?limit=10',
    fetcher,
    { 
      refreshInterval: 300000, // 5min
      revalidateOnFocus: false 
    }
  );

  // Timeline avec cache longue (10min)
  const { data: timelineResponse, error: timelineError } = useSWR(
    '/api/user/timeline?days=30',
    fetcher,
    { 
      refreshInterval: 600000, // 10min
      revalidateOnFocus: false 
    }
  );

  const stats = statsResponse?.data;
  const modelUsage = modelsResponse?.data || [];
  const timeline = timelineResponse?.data || [];

  const loading = !statsResponse && !statsError;
  const error = statsError || modelsError || timelineError;

  const refetch = useCallback(() => {
    mutateStats();
  }, [mutateStats]);

  return {
    stats,
    modelUsage,
    timeline,
    loading,
    error: error?.message,
    refetch
  };
}
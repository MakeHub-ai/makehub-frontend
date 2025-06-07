'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getUserUsageLocal } from '@/lib/local-api-client';
import type { UsageResponse, UsageItem, UsagePaginatedData } from '@/types/dashboard';

// Cache management for localStorage persistence
const CACHE_KEY = 'dashboard-data-cache';
const CACHE_DURATION = 30 * 60 * 100000; // 30 minutes

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
      
      const response = await getUserUsageLocal(0);

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

      const response = await getUserUsageLocal(0);

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

  // Removed automatic refresh on window focus per user request

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

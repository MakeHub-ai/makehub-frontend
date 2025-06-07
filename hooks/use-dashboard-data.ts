'use client';

import { useDashboardData as useContext } from '@/contexts/dashboard-data-context';

/**
 * Hook to access shared dashboard data
 * 
 * This hook provides access to cached usage data that is shared across
 * all dashboard pages, eliminating the need for individual data fetching.
 * 
 * @returns Dashboard data state including usage data, loading states, and refresh function
 * 
 * @example
 * ```tsx
 * const { usageData, isLoading, error, refresh } = useDashboardData();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * 
 * return <MyComponent data={usageData} />;
 * ```
 */
export const useDashboardData = () => {
  return useContext();
};

export default useDashboardData;
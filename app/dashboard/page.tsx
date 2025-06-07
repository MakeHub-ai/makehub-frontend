'use client';

import { CreditCard, BarChart, Clock, RefreshCw } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { StatCard } from '@/components/dashboard/StatCard';
import { UsageList } from '@/components/dashboard/UsageList';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import type { GraphItem, SavingsDataItem } from '@/types/dashboard';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const { usageData, paginatedUsageData, isRefreshing, lastUpdated, refresh } = useDashboardData();

  const stats = usageData ? [
    {
      title: "Amount Available",
      value: usageData?.is_free_plan 
        ? "Free Plan"
        : `${usageData?.total_credits.toFixed(2)} $`,
      icon: CreditCard,
      variant: 'credit' as const,
      isFree: usageData?.is_free_plan
    },
    {
      title: "Used this Month",
      value: `${usageData.total_usage.toFixed(2)} $`,
      icon: Clock
    },
    {
      title: "Total Requests",
      value: usageData.total_requests.toLocaleString(),
      icon: BarChart
    }
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your API usage, costs, and performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className={`
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                transition-all duration-200 border border-gray-200
                ${isRefreshing
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <DashboardNav
          currentPlan={usageData?.current_plan || 'Loading...'}
          className="border-b border-gray-100 pb-6"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <StatCard 
                key={index} 
                {...stat} 
                loading={false}
              />
            ))}
          </div>

          {/* Charts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Usage Analytics</h3>
            </div>
            <DashboardCharts
              graphItems={usageData?.graph_items as GraphItem[] || []}
              savingsData={usageData?.savings_data as SavingsDataItem[] || []}
              usedThisMonth={usageData?.total_usage ?? 0}
              cost_distribution={usageData?.cost_distribution || []}
            />
          </motion.div>

          {/* Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {paginatedUsageData && (
              <UsageList initialUsage={paginatedUsageData} />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

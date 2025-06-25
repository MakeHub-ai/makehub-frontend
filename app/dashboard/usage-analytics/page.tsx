'use client';

import { BarChart3, TrendingUp, Activity, Calendar, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { motion } from 'framer-motion';
import type { GraphItem, SavingsDataItem } from '@/types/dashboard';

export default function UsageAnalyticsPage() {
  const { usageData, isRefreshing, lastUpdated, refresh } = useDashboardData();

  const analyticsStats = usageData ? [
    {
      title: "Total Usage",
      value: `$${usageData.total_usage.toFixed(2)}`,
      icon: BarChart3,
      variant: 'default' as const
    },
    {
      title: "Total Requests",
      value: usageData.total_requests.toLocaleString(),
      icon: Activity
    },
    {
      title: "Active Models",
      value: usageData.graph_items?.length || 0,
      icon: TrendingUp
    },
    {
      title: "This Month",
      value: `$${usageData.total_usage.toFixed(2)}`,
      icon: Calendar
    }
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </h1>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Analytics Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {analyticsStats.map((stat, index) => (
              <StatCard 
                key={index} 
                {...stat} 
                loading={false}
              />
            ))}
          </div>

          {/* Detailed Charts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Analytics</h3>
              <span className="text-sm text-gray-500">Real-time data</span>
            </div>
            <DashboardCharts
              graphItems={usageData?.graph_items as GraphItem[] || []}
              savingsData={usageData?.savings_data as SavingsDataItem[] || []}
              usedThisMonth={usageData?.total_usage ?? 0}
              cost_distribution={usageData?.cost_distribution || []}
            />
          </motion.div>

          {/* Additional Analytics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card className="p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Usage Trends</h4>
              <p className="text-sm text-gray-600">
                Monitor your API usage patterns over time to optimize costs and performance.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Cost Optimization</h4>
              <p className="text-sm text-gray-600">
                Identify opportunities to reduce costs while maintaining optimal performance.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, RefreshCw } from 'lucide-react';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { ProductionInsightsSection } from '@/components/dashboard/ProductionInsightsSection';
import { ProviderTypeToggle } from '@/components/dashboard/ProviderTypeToggle';
import { ModelFamilySection } from '@/components/dashboard/ModelFamilySection';
import { ProviderComparisonChart } from '@/components/dashboard/ProviderComparisonChart';
import { UsageList } from '@/components/dashboard/UsageList';
import { generateEnhancedProviderRankingData } from '@/lib/provider-stats';
import type { ProviderType } from '@/types/provider-stats';

export default function ProviderStatisticsPage() {
  const { usageItems, paginatedUsageData, isRefreshing, lastUpdated, refresh } = useDashboardData();
  const [selectedProviderType, setSelectedProviderType] = useState<ProviderType>('open-source');

  // Process data to get enhanced ranking data
  const providerData = usageItems.length > 0 ? generateEnhancedProviderRankingData(usageItems) : null;

  if (!providerData?.insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Production Data Available
          </h3>
          <p className="text-gray-500">
            Start using AI providers to see your production insights and provider comparisons.
          </p>
        </div>
      </div>
    );
  }

  // Filter model families by provider type
  const filteredModelFamilies = providerData.modelFamilies?.filter(family => 
    family.providers.some(provider => 
      selectedProviderType === 'all' || provider.category === selectedProviderType
    )
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Provider Analytics
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
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Production Insights - Holistic Overview */}
        <ProductionInsightsSection insights={providerData.insights} />

        {/* Provider Type Toggle */}
        <ProviderTypeToggle 
          currentType={selectedProviderType}
          onTypeChange={setSelectedProviderType}
        />

        {/* Performance Analysis Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Analysis - {selectedProviderType === 'open-source' ? 'Open Source' : selectedProviderType === 'closed-source' ? 'Closed Source' : 'All'} Providers
          </h2>
          <ProviderComparisonChart
            openSourceProviders={selectedProviderType === 'closed-source' ? [] : providerData.openSource}
            closedSourceProviders={selectedProviderType === 'open-source' ? [] : providerData.closedSource}
            modelFamilies={providerData.modelFamilies}
            providerType={selectedProviderType}
          />
        </div>

        {/* Usage Analysis */}
        {paginatedUsageData && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Usage Analysis
              </h2>
              <p className="text-gray-600">
                Detailed transaction history and usage patterns
              </p>
            </div>
            <UsageList initialUsage={{
              items: paginatedUsageData.items.map(item => ({
                id: item.id,
                timestamp: item.timestamp,
                type: item.type === 'API Call' ? 'api_call' as const : 'failed_request' as const,
                amount: parseFloat(item.units.replace('$', '')),
                formatted_amount: item.units,
                transaction_type: item.metadata.transaction_type as 'credit' | 'debit',
                description: item.description,
                metadata: {
                  model: item.metadata.details.model,
                  provider: item.metadata.details.provider,
                  input_tokens: item.metadata.details.input_tokens ?? undefined,
                  output_tokens: item.metadata.details.output_tokens ?? undefined,
                  cached_tokens: undefined,
                  status: item.metadata.details.status,
                  error_message: item.metadata.details.error ?? undefined,
                  request_id: item.id,
                  transaction_id: item.id
                }
              })),
              pagination: {
                currentPage: 1,
                pageSize: paginatedUsageData.items.length,
                totalItems: paginatedUsageData.items.length,
                totalPages: 1,
                hasNextPage: paginatedUsageData.hasMore,
                hasPreviousPage: false
              }
            }} />
          </div>
        )}

        {/* Model Family Comparisons */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Model Family Comparisons
            </h2>
            <p className="text-gray-600">
              Compare providers offering the same models - apples to apples analysis
            </p>
          </div>

          {filteredModelFamilies.length > 0 ? (
            filteredModelFamilies.map((modelFamily, index) => (
              <ModelFamilySection
                key={modelFamily.name}
                modelFamily={modelFamily}
                providerType={selectedProviderType}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Model Families Found
              </h3>
              <p className="text-gray-500">
                No model families found for {selectedProviderType === 'open-source' ? 'open source' : 'closed source'} providers.
                Try switching provider types or use more AI models to see comparisons.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-sm text-gray-500">
            Last updated: {new Date(providerData.lastUpdated).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Production insights based on {providerData.totalTransactions || 0} total transactions
          </p>
        </motion.div>
      </div>
    </div>
  );
}

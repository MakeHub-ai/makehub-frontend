'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Zap,
  DollarSign,
  Shield,
  Clock,
  TrendingUp,
  Award,
  Code,
  Brain
} from 'lucide-react';
import type { ModelFamilySectionProps } from '@/types/provider-stats';
import { formatCost, formatLatency, formatNumber } from '@/lib/provider-stats';
import { cn } from '@/lib/utils';

export const ModelFamilySection: React.FC<ModelFamilySectionProps> = ({
  modelFamily,
  providerType,
}) => {
  // Filter providers by type
  const filteredProviders = modelFamily.providers.filter(
    provider => providerType === 'all' || provider.category === providerType
  );

  if (filteredProviders.length === 0) {
    return null;
  }

  // Get family icon
  const getFamilyIcon = (familyName: string) => {
    const name = familyName.toLowerCase();
    if (name.includes('llama') || name.includes('mistral')) return Brain;
    if (name.includes('code') || name.includes('star')) return Code;
    if (name.includes('embed') || name.includes('bge')) return Cpu;
    return Brain;
  };

  const FamilyIcon = getFamilyIcon(modelFamily.name);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3: return 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600 text-blue-100';
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Family Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <FamilyIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{modelFamily.name}</h3>
              <p className="text-gray-600">
                {modelFamily.models.length} models • {filteredProviders.length} providers
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Best Provider</p>
            <p className="font-semibold text-gray-900">
              {filteredProviders[0]?.name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Models List */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Available Models:</p>
          <div className="flex flex-wrap gap-2">
            {modelFamily.models.slice(0, 5).map((model, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
              >
                {model.length > 20 ? `${model.substring(0, 20)}...` : model}
              </span>
            ))}
            {modelFamily.models.length > 5 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                +{modelFamily.models.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Provider Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProviders.map((provider, index) => (
          <motion.div
            key={provider.name}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Provider Logo */}
                  <div className="relative">
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                      provider.category === 'open-source' 
                        ? 'from-emerald-500 to-green-600'
                        : 'from-blue-500 to-indigo-600'
                    )}>
                      {provider.logo ? (
                        <img 
                          src={provider.logo} 
                          alt={provider.name}
                          className="w-6 h-6 object-contain bg-white rounded p-0.5"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {provider.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Rank Badge */}
                    <div className={cn(
                      'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                      getRankBadgeColor(provider.rank)
                    )}>
                      {provider.rank}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {provider.name}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {provider.category.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                {/* Total Score */}
                <div className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium border',
                  getScoreColor(provider.score.totalScore)
                )}>
                  {provider.score.totalScore.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-6 space-y-4">
              {/* Key Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">
                    {provider.metrics.tokensPerSecond.toFixed(1)} t/s
                  </p>
                  <p className="text-xs text-gray-500">Speed</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">
                    {formatLatency(provider.metrics.timeToFirstToken)}
                  </p>
                  <p className="text-xs text-gray-500">Latency</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">
                    {formatCost(provider.metrics.costPerToken)}
                  </p>
                  <p className="text-xs text-gray-500">per 1M tokens</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="h-3 w-3 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">
                    {(provider.metrics.completionRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Reliability</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <h5 className="text-xs font-medium text-gray-700">Performance Scores</h5>
                
                {/* Speed Score */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Speed
                  </span>
                  <span className="font-medium">{provider.score.speed.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, provider.score.speed)}%` }}
                  />
                </div>

                {/* Price Score */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Price
                  </span>
                  <span className="font-medium">{provider.score.price.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, provider.score.price)}%` }}
                  />
                </div>

                {/* Reliability Score */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Reliability
                  </span>
                  <span className="font-medium">{provider.score.reliability.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, provider.score.reliability)}%` }}
                  />
                </div>
              </div>

              {/* Provider Models in this Family */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">Models Offered:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.models.slice(0, 2).map((model, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                    >
                      {model.length > 12 ? `${model.substring(0, 12)}...` : model}
                    </span>
                  ))}
                  {provider.models.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                      +{provider.models.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{formatNumber(provider.metrics.totalRequests)} requests</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-gray-600">Selection Rate:</span>
                  <span className="font-medium">{provider.score.selection.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Family Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          {modelFamily.name} Family Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="font-medium text-gray-900">
              {filteredProviders[0]?.name || 'N/A'}
            </p>
            <p className="text-gray-600">Best Overall</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">
              {filteredProviders.reduce((min, p) => 
                p.metrics.costPerToken < min.metrics.costPerToken ? p : min
              )?.name || 'N/A'}
            </p>
            <p className="text-gray-600">Most Cost-Effective</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">
              {filteredProviders.reduce((max, p) => 
                p.metrics.tokensPerSecond > max.metrics.tokensPerSecond ? p : max
              )?.name || 'N/A'}
            </p>
            <p className="text-gray-600">Fastest</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
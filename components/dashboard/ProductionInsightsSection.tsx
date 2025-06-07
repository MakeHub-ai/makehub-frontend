'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  DollarSign,
  Zap,
  Shield,
  TrendingUp,
  Award,
  BarChart3,
  Users
} from 'lucide-react';
import type { ProductionInsightsSectionProps } from '@/types/provider-stats';
import { formatCost, formatLatency, formatNumber } from '@/lib/provider-stats';
import { cn } from '@/lib/utils';

export const ProductionInsightsSection: React.FC<ProductionInsightsSectionProps> = ({
  insights,
}) => {
  const insightCards = [
    {
      title: 'Most Selected',
      description: 'Your load balancer\'s favorite',
      provider: insights.mostSelected,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      metric: 'Selection Rate',
      value: insights.mostSelected?.score.selection.toFixed(1) + '%' || 'N/A',
    },
    {
      title: 'Most Reliable',
      description: 'Highest completion rate',
      provider: insights.mostReliable,
      icon: Shield,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      metric: 'Reliability',
      value: insights.mostReliable?.score.reliability.toFixed(1) + '%' || 'N/A',
    },
    {
      title: 'Speed Champion',
      description: 'Fastest token generation',
      provider: insights.speedChampion,
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      metric: 'Speed',
      value: insights.speedChampion?.metrics.tokensPerSecond.toFixed(1) + ' t/s' || 'N/A',
    },
    {
      title: 'Price Leader',
      description: 'Best cost efficiency',
      provider: insights.priceLeader,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      metric: 'Cost/1M tokens',
      value: insights.priceLeader ? formatCost(insights.priceLeader.metrics.costPerToken) : 'N/A',
    },
  ].filter(card => card.provider !== null);

  if (insightCards.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Production Data Available
          </h3>
          <p className="text-gray-500">
            Start using AI providers to see your production insights here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Champion */}
      {insights.overallChampion && (
        <motion.div
          className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 rounded-xl p-8 text-white shadow-xl border-2 border-yellow-300"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Overall Champion</h3>
                <p className="text-white/80">Best all-around provider for your usage</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {insights.overallChampion.logo && (
                  <img
                    src={insights.overallChampion.logo}
                    alt={`${insights.overallChampion.name} logo`}
                    className="w-6 h-6 object-contain bg-white rounded p-0.5"
                  />
                )}
                <h4 className="text-lg font-semibold">{insights.overallChampion.name}</h4>
              </div>
              <p className="text-white/80 text-sm">Score: {insights.overallChampion.score.totalScore.toFixed(1)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <motion.div
              key={card.title}
              className={cn(
                'relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-300',
                'group overflow-hidden',
                card.borderColor
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              {/* Background gradient */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-5',
                card.color
              )} />

              {/* Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'p-2 rounded-lg bg-gradient-to-br',
                    card.color
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Provider Info */}
                <div className={cn(
                  'p-4 rounded-lg border',
                  card.bgColor,
                  card.borderColor
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {card.provider?.logo && (
                        <img
                          src={card.provider.logo}
                          alt={`${card.provider.name} logo`}
                          className="w-4 h-4 object-contain bg-white rounded p-0.5"
                        />
                      )}
                      <h4 className={cn('font-semibold text-sm', card.textColor)}>
                        {card.provider?.name}
                      </h4>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded-md text-xs font-medium bg-white/80',
                      card.textColor
                    )}>
                      #{card.provider?.rank}
                    </span>
                  </div>

                  {/* Key Metric */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{card.metric}:</span>
                      <span className={cn('font-medium', card.textColor)}>
                        {card.value}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Score:</span>
                      <span className={cn('font-medium', card.textColor)}>
                        {card.provider?.score.totalScore.toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requests:</span>
                      <span className={cn('font-medium', card.textColor)}>
                        {formatNumber(card.provider?.metrics.totalRequests || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mt-3 pt-3 border-t border-white/50">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/60',
                      card.textColor
                    )}>
                      {card.provider?.category === 'open-source' ? 'Open Source' : 'Closed Source'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
                card.color
              )} />
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <motion.div
        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {insights.totalProviders}
            </p>
            <p className="text-sm text-gray-600">Active Providers</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(insights.totalRequests)}
            </p>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {insights.overallChampion?.score.totalScore.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-gray-600">Top Score</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {insights.overallChampion?.category === 'open-source' ? 'Open' : 'Closed'}
            </p>
            <p className="text-sm text-gray-600">Champion Type</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts/core';
import { ScatterChart, BarChart as EChartsBarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart3, Zap, DollarSign, AlertCircle } from 'lucide-react';
import type { ProviderComparisonChartProps } from '@/types/provider-stats';

// Register ECharts components
echarts.use([
  ScatterChart,
  EChartsBarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer
]);

export const ProviderComparisonChart: React.FC<ProviderComparisonChartProps> = ({
  openSourceProviders,
  closedSourceProviders,
  modelFamilies = [],
  providerType = 'open-source',
}) => {
  const scatterChartRef = useRef<HTMLDivElement>(null);
  const speedChartRef = useRef<HTMLDivElement>(null);
  
  const [scatterChart, setScatterChart] = useState<echarts.ECharts | null>(null);
  const [speedChart, setSpeedChart] = useState<echarts.ECharts | null>(null);

  // Filter model families by provider type and find the best one for comparison
  const filteredModelFamilies = modelFamilies
    .map(family => ({
      ...family,
      providers: family.providers.filter(provider =>
        providerType === 'all' || provider.category === providerType
      )
    }))
    .filter(family => family.providers.length >= 2) // Need at least 2 providers for comparison
    .filter(family => family.name !== 'Other Models'); // Exclude generic "Other Models" group

  const bestModelFamily = filteredModelFamilies
    .sort((a, b) => b.providers.length - a.providers.length)[0];

  // Initialize charts
  useEffect(() => {
    if (!scatterChartRef.current || !speedChartRef.current) return;

    const scatter = echarts.init(scatterChartRef.current);
    const speed = echarts.init(speedChartRef.current);

    setScatterChart(scatter);
    setSpeedChart(speed);

    return () => {
      scatter.dispose();
      speed.dispose();
    };
  }, []);

  // Update charts when data changes
  useEffect(() => {
    if (!scatterChart || !speedChart) return;

    // If no valid model family for comparison, show "not enough data"
    if (!bestModelFamily) {
      const noDataOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Not enough data for fair comparison',
          subtext: 'Need multiple providers offering the same model',
          left: 'center',
          top: 'middle',
          textStyle: {
            fontSize: 16,
            color: '#9ca3af'
          },
          subtextStyle: {
            fontSize: 12,
            color: '#6b7280'
          }
        }
      };
      
      scatterChart.setOption(noDataOption, true);
      speedChart.setOption(noDataOption, true);
      return;
    }

    // Use providers from the best model family (apples-to-apples comparison)
    const familyProviders = bestModelFamily.providers;
    
    // Separate by provider type for color coding
    const openSourceData = familyProviders
      .filter(p => p.category === 'open-source')
      .map(provider => [
        provider.metrics.costPerToken * 1000000, // Convert to cost per million tokens
        provider.score.totalScore || 0,
        provider.name
      ]);

    const closedSourceData = familyProviders
      .filter(p => p.category === 'closed-source')
      .map(provider => [
        provider.metrics.costPerToken * 1000000, // Convert to cost per million tokens
        provider.score.totalScore || 0,
        provider.name
      ]);

    // Cost vs Performance Scatter Chart (same model family only)
    scatterChart.setOption({
      backgroundColor: 'transparent',
      title: {
        text: `${bestModelFamily.name} - Cost vs Performance`,
        subtext: `Fair comparison: ${familyProviders.length} providers offering the same model`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#374151'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#6b7280'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const [cost, score, name] = params.data;
          return `
            <div class="font-medium text-gray-900 mb-2">${name}</div>
            <div class="space-y-1 text-sm">
              <div>Model: <span class="font-medium">${bestModelFamily.name}</span></div>
              <div>Cost/1M tokens: <span class="font-medium">$${Number(cost).toFixed(2)}</span></div>
              <div>Performance Score: <span class="font-medium">${Number(score).toFixed(1)}</span></div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#374151' },
        extraCssText: 'box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); border-radius: 6px; padding: 12px;'
      },
      legend: {
        data: ['Open Source', 'Closed Source'],
        bottom: 10,
        textStyle: { color: '#374151' }
      },
      xAxis: {
        name: 'Cost per 1M Tokens ($)',
        nameLocation: 'middle',
        nameGap: 25,
        type: 'value',
        axisLabel: { color: '#6b7280' },
        nameTextStyle: { color: '#374151', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      yAxis: {
        name: 'Performance Score',
        nameLocation: 'middle',
        nameGap: 40,
        type: 'value',
        axisLabel: { color: '#6b7280' },
        nameTextStyle: { color: '#374151', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        ...(openSourceData.length > 0 ? [{
          name: 'Open Source',
          data: openSourceData,
          type: 'scatter',
          symbolSize: 12,
          itemStyle: {
            color: 'rgba(34, 197, 94, 0.8)',
            borderColor: '#22c55e',
            borderWidth: 2
          }
        }] : []),
        ...(closedSourceData.length > 0 ? [{
          name: 'Closed Source',
          data: closedSourceData,
          type: 'scatter',
          symbolSize: 12,
          itemStyle: {
            color: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 2
          }
        }] : [])
      ],
      grid: {
        left: '15%',
        right: '10%',
        bottom: '20%',
        top: '20%'
      }
    }, true);

    // Speed Comparison Bar Chart (same model family only)
    const speedProviders = familyProviders
      .filter(p => p.metrics.tokensPerSecond && p.metrics.tokensPerSecond > 0)
      .sort((a, b) => (b.metrics.tokensPerSecond || 0) - (a.metrics.tokensPerSecond || 0));

    speedChart.setOption({
      backgroundColor: 'transparent',
      title: {
        text: `${bestModelFamily.name} - Speed Comparison`,
        subtext: `Fair comparison: Same model across ${speedProviders.length} providers`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#374151'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#6b7280'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          return `
            <div class="font-medium text-gray-900 mb-1">${data.name}</div>
            <div class="text-sm">
              <div>Model: <span class="font-medium">${bestModelFamily.name}</span></div>
              <div>Speed: <span class="font-medium">${Number(data.value).toFixed(1)} tokens/sec</span></div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#374151' },
        extraCssText: 'box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); border-radius: 6px; padding: 10px;'
      },
      xAxis: {
        type: 'category',
        data: speedProviders.map(p => p.name),
        axisLabel: {
          rotate: 45,
          color: '#6b7280',
          fontSize: 10
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        name: 'Tokens/Second',
        nameLocation: 'middle',
        nameGap: 35,
        axisLabel: {
          color: '#6b7280',
          fontSize: 10
        },
        nameTextStyle: { color: '#374151', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [{
        type: 'bar',
        data: speedProviders.map(provider => ({
          value: provider.metrics.tokensPerSecond || 0,
          itemStyle: {
            color: provider.category === 'open-source' 
              ? 'rgba(34, 197, 94, 0.8)' 
              : 'rgba(59, 130, 246, 0.8)'
          }
        }))
      }],
      grid: {
        left: '10%',
        right: '5%',
        bottom: '25%',
        top: '20%'
      }
    }, true);

    // Handle window resize
    const handleResize = () => {
      scatterChart.resize();
      speedChart.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [scatterChart, speedChart, bestModelFamily, modelFamilies, providerType]);

  // If no model families data at all
  if (modelFamilies.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Model Family Data
          </h3>
          <p className="text-gray-500">
            Fair provider comparisons require model family groupings.
          </p>
        </div>
      </div>
    );
  }

  // If no valid model families for comparison (less than 2 providers each)
  if (!bestModelFamily) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Not Enough Data for Fair Comparison
          </h3>
          <p className="text-gray-500 mb-4">
            Need multiple providers offering the same model for meaningful comparisons.
          </p>
          <div className="text-sm text-gray-400">
            Available model families: {modelFamilies.map(f => `${f.name} (${f.providers.length})`).join(', ')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Fair Comparison Active</h4>
            <p className="text-sm text-blue-700 mt-1">
              Comparing <strong>{bestModelFamily.providers.length} providers</strong> offering the same model: <strong>{bestModelFamily.name}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Performance Scatter */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Cost vs Performance</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Same model quality, different infrastructure costs
            </p>
          </div>
          <div className="p-4">
            <div ref={scatterChartRef} className="w-full h-80" />
          </div>
        </motion.div>

        {/* Speed Comparison */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Speed Comparison</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Same model, different infrastructure speed
            </p>
          </div>
          <div className="p-4">
            <div ref={speedChartRef} className="w-full h-80" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
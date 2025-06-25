'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { CostDistributionItem } from '@/types/dashboard';

interface CostEvolutionBarChartProps {
  costDistribution: CostDistributionItem[];
  displayMode?: 'tokens' | 'cost';
  timePeriod?: '7days' | '30days' | '3months';
  onDisplayModeChange?: (mode: 'tokens' | 'cost') => void;
  onTimePeriodChange?: (period: '7days' | '30days' | '3months') => void;
  isLoading?: boolean;
  // Additional data for token calculation
  graphItems?: Array<{model: string; usage_count: number}>;
}

// Format tokens in k/M
const formatTokens = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value.toString();
};

// Format currency
const formatCurrency = (value: number) => {
  return '$' + value.toFixed(4);
};

// MakeHub gradient colors - violet to blue
const getModelColor = (modelName: string, index: number, totalModels: number) => {
  // Create a gradient from violet to blue based on the index
  const gradientColors = [
    '#8b5cf6', // Violet de départ
    '#7c66f7',
    '#6d70f7',
    '#5e7af8',
    '#4f84f8',
    '#408ef9',
    '#3b82f6', // Bleu d'arrivée
    '#60a5fa',
    '#93c5fd',
    '#bfdbfe'
  ];
  
  // If we have fewer models than colors, distribute them evenly
  if (totalModels <= gradientColors.length) {
    const step = Math.floor(gradientColors.length / Math.max(totalModels, 1));
    return gradientColors[index * step] || gradientColors[index % gradientColors.length];
  }
  
  // If we have more models than colors, cycle through them
  return gradientColors[index % gradientColors.length];
};

// Custom sophisticated tooltip
const CustomTooltip = ({ active, payload, label, displayMode }: any) => {
  if (active && payload && payload.length) {
    // Filtrer pour ne garder que les modèles avec une valeur non nulle
    const filteredPayload = payload.filter((entry: any) => entry.value && entry.value !== 0);
    if (filteredPayload.length === 0) return null;
    const total = filteredPayload.reduce((sum: number, item: any) => sum + item.value, 0);

    return (
      <div className="bg-white/95 backdrop-blur-md p-6 border border-gray-200/50 rounded-2xl shadow-2xl ring-1 ring-black/5 transform transition-all duration-200 scale-100">
        <div className="text-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg tracking-wide">{label}</h3>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto my-2 rounded-full"></div>
          <p className="text-sm text-gray-500 font-medium">
            Total: {displayMode === 'tokens' 
              ? formatTokens(total) + ' tokens' 
              : formatCurrency(total)
            }
          </p>
        </div>
        
        <div className="space-y-3">
          {filteredPayload.reverse().map((entry: any, index: number) => {
            return (
              <div key={index} className="flex items-center justify-between group hover:bg-gray-50/50 p-2 rounded-lg transition-colors duration-150 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white group-hover:scale-110 transition-transform duration-150 flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                    {entry.dataKey}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors whitespace-nowrap">
                    {displayMode === 'tokens'
                      ? `${formatTokens(Math.round(entry.value))} tokens`
                      : `$${entry.value.toFixed(4)}`
                    }
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function CostEvolutionBarChart({
  costDistribution,
  displayMode = 'cost',
  timePeriod = '30days',
  onDisplayModeChange,
  onTimePeriodChange,
  isLoading = false
}: CostEvolutionBarChartProps) {
  
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!costDistribution.length) return [];
    
    // Filter data based on time period
    const now = new Date();
    let filteredData = costDistribution;
    
    // Filtrage robuste par période
    const parseDate = (str: string) => {
      // str = 'YYYY-MM-DD'
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    let days = 0;
    if (timePeriod === '7days') days = 7;
    if (timePeriod === '30days') days = 30;
    if (timePeriod === '3months') days = 90;
    if (days > 0 && costDistribution.length > days) {
      filteredData = costDistribution.slice(-days);
    }
    
    // Get all unique models across all dates
    const allModels = new Set<string>();
    filteredData.forEach(item => {
      Object.keys(item.models).forEach(model => allModels.add(model));
    });
    
    const modelsList = Array.from(allModels).sort();
    
    // Transform data for stacked bar chart
    return filteredData.map(item => {
      const chartItem: any = {
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: item.date
      };

      // Add each model's value for this date (tokens or cost)
      modelsList.forEach(model => {
        if (displayMode === 'tokens' && item.models[model + '_tokens'] !== undefined) {
          chartItem[model] = item.models[model + '_tokens'];
        } else {
          chartItem[model] = item.models[model] || 0;
        }
      });

      return chartItem;
    });
  }, [costDistribution, timePeriod]);
  
  // Get all model names for the bars
  const modelNames = useMemo(() => {
    const models = new Set<string>();
    costDistribution.forEach(item => {
      Object.keys(item.models).forEach(model => models.add(model));
    });
    return Array.from(models).sort();
  }, [costDistribution]);
  
  // Time period options
  const timePeriodOptions = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '3months', label: '3 Months' }
  ];
  
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-b-indigo-600 border-indigo-300"></div>
          <p className="mt-3 text-sm text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }
  
  if (!chartData.length) {
    return (
      <div className="w-full py-16 text-center bg-gray-50/50 rounded-xl border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-50 rounded-full border border-blue-100 mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-gray-700 font-medium mb-2">No Cost Data Available</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">
            Start using the API to see your cost evolution over time.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cost Evolution by Model
          </h2>
          <p className="text-gray-600">
            Stacked bar visualization of daily spending by model
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => onDisplayModeChange?.('cost')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                displayMode === 'cost'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cost
            </button>
            <button
              onClick={() => onDisplayModeChange?.('tokens')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                displayMode === 'tokens'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tokens
            </button>
          </div>
          
          {/* Time Period Selector */}
          <select
            value={timePeriod}
            onChange={(e) => onTimePeriodChange?.(e.target.value as '7days' | '30days' | '3months')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timePeriodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barCategoryGap="20%"
            maxBarSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => displayMode === 'tokens' ? formatTokens(value) : formatCurrency(value)}
              label={{
                value: displayMode === 'tokens' ? 'Tokens' : 'Cost',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 13 }
              }}
            />
            <Tooltip 
              content={(props) => <CustomTooltip {...props} displayMode={displayMode} />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            
            {/* Render bars for each model */}
            {modelNames.map((modelName, index) => (
              <Bar
                key={modelName}
                dataKey={modelName}
                stackId="cost"
                fill={getModelColor(modelName, index, modelNames.length)}
                stroke="#ffffff"
                strokeWidth={2}
                radius={index === modelNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

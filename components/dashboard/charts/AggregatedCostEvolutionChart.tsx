'use client';

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAggregatedDashboardData, AggregatedChartRow } from '@/hooks/use-aggregated-dashboard-data';

const formatTokens = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value.toString();
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(0) + 'M';
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
  if (value >= 1) return '$' + value.toFixed(0);
  if (value >= 0.01) return '$' + value.toFixed(2);
  return '$' + value.toPrecision(2);
};

const getModelColor = (index: number, totalModels: number) => {
  // Utilise les dégradés MakeHub du header
  const gradients = [
    'url(#barGradientMakeHub1)',
    'url(#barGradientMakeHub2)',
    'url(#barGradientMakeHub3)',
    'url(#barGradientMakeHub4)',
    'url(#barGradientMakeHub5)'
  ];
  return gradients[index % gradients.length];
};

const CustomTooltip = ({ active, payload, label, displayMode }: any) => {
  if (active && payload && payload.length) {
    const filteredPayload = payload.filter((entry: any) => entry.value && entry.value !== 0);
    if (filteredPayload.length === 0) return null;
    const total = filteredPayload.reduce((sum: number, item: any) => sum + item.value, 0);

    return (
      <div className="bg-white/95 backdrop-blur-md p-6 border border-gray-200/50 rounded-2xl shadow-2xl ring-1 ring-black/5">
        <div className="text-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg tracking-wide">{label}</h3>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto my-2 rounded-full"></div>
          <p className="text-sm text-gray-500 font-medium">
            Total: {displayMode === 'tokens'
              ? formatTokens(Math.round(total)) + ' tokens'
              : formatCurrency(total)
            }
          </p>
        </div>
        <div className="space-y-3">
          {filteredPayload.reverse().map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between group hover:bg-gray-50/50 p-2 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                <div
                  className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                  {entry.dataKey}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900 whitespace-nowrap">
                  {displayMode === 'tokens'
                    ? `${formatTokens(Math.round(entry.value))} tokens`
                    : `$${entry.value.toFixed(4)}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function AggregatedCostEvolutionChart() {
  const [displayMode, setDisplayMode] = useState<'tokens' | 'cost'>('cost');
  const [period, setPeriod] = useState<'7days' | '30days' | '3months'>('30days');
  const { data, isLoading, error } = useAggregatedDashboardData(period);

  // Transform aggregated data into chart format
  const { chartData, modelNames } = useMemo(() => {
    // Get all unique days and models
    // Utiliser day_local pour l'affichage, mais garder day pour la logique
    const days = Array.from(new Set(data.map(row => row.day))).sort();
    // Calcul du total par modèle (sur toute la période)
    const modelTotals = new Map<string, number>();
    data.forEach(row => {
      const val = displayMode === 'tokens' ? row.total_tokens : row.total_cost;
      modelTotals.set(row.model, (modelTotals.get(row.model) || 0) + val);
    });

    // Trie les modèles du plus utilisé/cher au moins utilisé/cher (barres les plus grosses en bas)
    const models = Array.from(new Set(data.map(row => row.model)))
      .sort((a, b) => (modelTotals.get(b) || 0) - (modelTotals.get(a) || 0));

    // Build chart data: one object per day, with model values
    const chartRows = days.map(day => {
      // Trouver la version locale de la date
      const rowForDay = data.find(r => r.day === day);
      // Format: "Mon 24", "Tue 25", etc.
      const dateObj = new Date(day + 'T00:00:00Z');
      const dateLabel = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric'
      });

      const row: any = {
        date: dateLabel,
        fullDate: day,
      };
      models.forEach(model => {
        const found = data.find(r => r.day === day && r.model === model);
        row[model] = displayMode === 'tokens'
          ? (found ? found.total_tokens : 0)
          : (found ? found.total_cost : 0);
      });
      return row;
    });

    return { chartData: chartRows, modelNames: models };
  }, [data, displayMode]);

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

  if (error) {
    return (
      <div className="w-full py-16 text-center bg-red-50/50 rounded-xl border border-red-100">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-red-100 rounded-full border border-red-200 mb-3">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-gray-700 font-medium mb-2">Error loading data</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">{error}</p>
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
          <h3 className="text-gray-700 font-medium mb-2">No Data Available</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">
            No usage data for this period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setDisplayMode('cost')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                displayMode === 'cost'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cost
            </button>
            <button
              onClick={() => setDisplayMode('tokens')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                displayMode === 'tokens'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tokens
            </button>
          </div>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
            <option value="3months">3 Months</option>
          </select>
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
            maxBarSize={40}
          >
            {/* Dégradés SVG */}
            <defs>
              {/* MakeHub gradient: from-blue-600 to-indigo-600 */}
              <linearGradient id="barGradientMakeHub1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              {/* MakeHub gradient: from-blue-500 to-violet-600 */}
              <linearGradient id="barGradientMakeHub2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              {/* MakeHub gradient: from-indigo-500 to-blue-400 */}
              <linearGradient id="barGradientMakeHub3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              {/* MakeHub gradient: from-blue-400 to-indigo-400 */}
              <linearGradient id="barGradientMakeHub4" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              {/* MakeHub gradient: from-violet-500 to-blue-500 */}
              <linearGradient id="barGradientMakeHub5" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
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
              tickFormatter={value => displayMode === 'tokens' ? formatTokens(Math.round(value)) : formatCurrency(value)}
              label={{
                value: displayMode === 'tokens' ? 'Tokens' : 'Cost ',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 13 }
              }}
            />
            <Tooltip
              content={props => <CustomTooltip {...props} displayMode={displayMode} />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            {modelNames.map((model, idx) => (
              <Bar
                key={model}
                dataKey={model}
                stackId="cost"
                fill={getModelColor(idx, modelNames.length)}
                stroke="#ffffff"
                strokeWidth={2}
                radius={idx === modelNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// components/dashboard/MinimalCostPieChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#674AFF', // Claude Sonnet 4
  '#4F46E5', // Claude Opus 4
  '#3B82F6', // GPT-4
  '#93C5FD', // GPT-3.5
  '#818CF8', // Extra
  '#8b5cf6', // Extra
  '#60a5fa', // Extra
  '#6366f1', // Extra
  '#a5b4fc', // Extra
  '#6b7280', // Others
];

const formatTokens = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value.toString();
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(0) + 'M';
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
  return '$' + value.toFixed(2);
};

const CustomTooltip = ({ active, payload, total, mode }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const percent = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-200/50 rounded-xl shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: payload[0].color }}
          />
          <span className="font-medium text-gray-800">{name}</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-bold text-gray-800">
            {mode === 'tokens'
              ? `${formatTokens(Math.round(value))} tokens`
              : formatCurrency(value)}
          </p>
          <p className="text-xs">{percent.toFixed(1)}%</p>
        </div>
      </div>
    );
  }
  return null;
};

export interface MinimalCostPieChartProps {
  data: { name: string; value: number }[];
  mode?: 'cost' | 'tokens';
}

export function MinimalCostPieChart({ data, mode = 'cost' }: MinimalCostPieChartProps) {
  // Sanitize and filter data
  const cleanData = (data || [])
    .map(d => ({
      name: d.name,
      value: Number(d.value) > 0 ? Number(d.value) : 0,
    }))
    .filter(d => d.value > 0);

  const total = cleanData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-400 text-sm">
        Aucune donnée à afficher
      </div>
    );
  }

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={cleanData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={0}
            isAnimationActive={true}
            label={false}
          >
            {cleanData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={props => <CustomTooltip {...props} total={total} mode={mode} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MinimalCostPieChart;

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Helper for formatting
const formatCurrency = (value: number) => {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(0) + 'M';
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
  return '$' + value.toFixed(2);
};

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CostEstimationForecastChart({ dailyCosts }: { dailyCosts: number[] }) {
  // Compute forecast
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = getMonthDays(year, month);

  // Prepare data for chart
  const chartData = useMemo(() => {
    // Cumulative actual costs
    let cumulative = 0;
    const actual = [];
    for (let i = 0; i < dailyCosts.length; ++i) {
      cumulative += dailyCosts[i];
      actual.push({
        date: `${i + 1}`,
        actual: cumulative,
        forecast: null,
        isActual: true,
      });
    }
    // Forecast: linear extrapolation from average daily cost so far
    const avg = dailyCosts.length > 0 ? cumulative / dailyCosts.length : 0;
    let lastActual = cumulative;
    const forecast = [];
    for (let i = dailyCosts.length; i < daysInMonth; ++i) {
      lastActual += avg;
      forecast.push({
        date: `${i + 1}`,
        actual: null,
        forecast: lastActual,
        isActual: false,
      });
    }
    return [...actual, ...forecast];
  }, [dailyCosts, daysInMonth]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = data.isActual ? data.actual : data.forecast;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-200/50 rounded-xl shadow-2xl ring-1 ring-black/5">
          <div className="text-center mb-2">
            <h3 className="font-bold text-gray-800 text-sm">Day {label}</h3>
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto my-1 rounded-full"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {formatCurrency(value)}
            </p>
            <p className="text-xs text-gray-500">
              {data.isActual ? 'Actual' : 'Forecast'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Monthly Cost Estimation
      </h2>
      <p className="text-gray-600 mb-6">
        Cumulative cost from the 1st of the month with forecast to the end.
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#6366f1"
              fill="url(#costGradient)"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              name="Actual"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#a5b4fc"
              fill="none"
              strokeDasharray="5 5"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

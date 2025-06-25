"use client"

import { useEffect, useRef, useState } from 'react';
import type { GraphItem } from '@/types/dashboard';
import * as echarts from 'echarts/core';
import { LineChart, BarChart as EChartsBarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight, BarChart2 as ChartIcon } from 'lucide-react';

// Register ECharts components
echarts.use([
  LineChart,
  EChartsBarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
]);

import type { UsageItem } from '@/types/dashboard';
import type { CostDistributionItem } from '@/types/dashboard';
import type { SavingsDataItem } from '@/types/dashboard';
import { CostEvolutionBarChart } from '@/components/dashboard/charts/CostEvolutionBarChart';
import { AggregatedCostEvolutionChart } from '@/components/dashboard/charts/AggregatedCostEvolutionChart';
import MinimalCostPieChart from './MinimalCostPieChart';
import dynamic from 'next/dynamic';

// Dynamically import the chart for SSR safety
const CostEstimationForecastChart = dynamic(() => import('./CostEstimationForecastChart'), { ssr: false });

function CostEstimationForecastChartWrapper() {
  const [dailyCosts, setDailyCosts] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/user/daily-costs-this-month')
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setDailyCosts(json.data || []);
      })
      .catch(e => {
        setDailyCosts([]);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-indigo-600 border-indigo-300"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }
  if (!dailyCosts || dailyCosts.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-400">
        No cost data for this month.
      </div>
    );
  }
  return <CostEstimationForecastChart dailyCosts={dailyCosts} />;
}

// ProviderPieChart component
function ProviderPieChart() {
  const [tokenData, setTokenData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/user/provider-cost-distribution?period_days=7')
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setTokenData(
          (json.data || [])
            .filter((d: any) => d.total_tokens > 0)
            .map((d: any) => ({
              name: d.provider,
              value: Number(d.total_tokens),
            }))
        );
      })
      .catch(e => {
        setTokenData([]);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="overflow-hidden flex flex-col h-[400px]"
    >
      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#111827]">Provider Distribution</h3>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-indigo-600 border-indigo-300"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <MinimalCostPieChart
            data={tokenData}
            mode="tokens"
          />
        )}
      </div>
    </motion.div>
  );
}

interface DashboardChartsProps {
  graphItems: GraphItem[];
  isLoading?: boolean;
  usedThisMonth?: number;
  cost_distribution?: CostDistributionItem[];
  savingsData?: SavingsDataItem[];
}
export function DashboardCharts({ graphItems, isLoading = false, usedThisMonth, cost_distribution = [], savingsData = [] }: DashboardChartsProps) {
  const [pieRawData, setPieRawData] = useState<any[]>([]);
  const [costPieData, setCostPieData] = useState<{ name: string; value: number }[]>([]);
  const [tokenPieData, setTokenPieData] = useState<{ name: string; value: number }[]>([]);
  const [pieMode, setPieMode] = useState<'cost' | 'tokens'>('cost');
  const [loadingPie, setLoadingPie] = useState(true);
  const [pieError, setPieError] = useState<string | null>(null);
  const requestCountChartRef = useRef<HTMLDivElement>(null);
  const [requestCountChart, setRequestCountChart] = useState<echarts.ECharts | null>(null);

  useEffect(() => {
    setLoadingPie(true);
    setPieError(null);
    fetch('/api/user/model-cost-distribution?period_days=7')
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setPieRawData(json.data || []);
        setCostPieData(
          (json.data || [])
            .filter((d: any) => d.total_cost > 0)
            .map((d: any) => ({
              name: d.model,
              value: Number(d.total_cost) / 1000, // Correction ici
            }))
        );
        setTokenPieData(
          (json.data || [])
            .filter((d: any) => d.total_tokens > 0)
            .map((d: any) => ({
              name: d.model,
              value: Number(d.total_tokens),
            }))
        );
      })
      .catch(e => {
        setCostPieData([]);
        setTokenPieData([]);
        setPieError(e.message);
      })
      .finally(() => setLoadingPie(false));
  }, []);

  // Génération de données aléatoires cumulées pour le mois courant
  const [costEstimationData] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Nom anglais du mois courant
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthLabel = monthNames[month];
    // Nombre de jours dans le mois courant
    const currentDay = now.getDate();
    const days = Array.from({ length: currentDay }, (_, i) => (i + 1).toString());

    // Génère des coûts journaliers pour "withSmart" qui s'additionnent à usedThisMonth
    let totalWith = typeof usedThisMonth === "number" && usedThisMonth > 0 ? usedThisMonth : 100;
    // Répartition aléatoire mais somme exacte
    let randomParts = Array.from({ length: currentDay }, () => Math.random());
    let sumParts = randomParts.reduce((a, b) => a + b, 0);
    let dailyWithSmart = randomParts.map(p => parseFloat(((p / sumParts) * totalWith).toFixed(2)));
    // Correction pour que la somme soit exactement égale à totalWith (ajuste le dernier jour)
    let sumWith = dailyWithSmart.reduce((a, b) => a + b, 0);
    if (dailyWithSmart.length > 0) {
      dailyWithSmart[dailyWithSmart.length - 1] += parseFloat((totalWith - sumWith).toFixed(2));
    }
    // Génère les coûts journaliers "withoutSmart" (30% à 60% plus cher)
    let dailyWithoutSmart = dailyWithSmart.map(v =>
      parseFloat((v * (1.3 + Math.random() * 0.6)).toFixed(2))
    );
    // Calcule les coûts cumulés
    const cumulative = (arr: number[]) => arr.reduce((acc, val) => {
      acc.push((acc.length ? acc[acc.length - 1] : 0) + val);
      return acc;
    }, [] as number[]);
    const withSmart = cumulative(dailyWithSmart).map(v => parseFloat(v.toFixed(2)));
    const withoutSmart = cumulative(dailyWithoutSmart).map(v => parseFloat(v.toFixed(2)));
    // Calcul du pourcentage d'économie total
    const totalWithout = withoutSmart[withoutSmart.length - 1];
    const percentSavings = totalWithout > 0 ? ((totalWithout - totalWith) / totalWithout) * 100 : 0;
    return {
      days,
      withoutSmart,
      withSmart,
      percentSavings: percentSavings.toFixed(1),
      monthLabel
    };
  });

  // Plus de processModelData (pie chart ECharts supprimé)

  // Process data for request count chart (using model usage counts)
  const processRequestCountData = () => {
    const sortedData = [...graphItems].sort((a, b) => b.usage_count - a.usage_count);
    return {
      models: sortedData.map(item => item.model),
      values: sortedData.map(item => item.usage_count)
    };
  };

  // Process data for cost by model chart
  const processCostByModelData = () => {
    if (!cost_distribution.length) return {
      dates: [],
      series: [],
      models: []
    };

    // Get all unique models
    const allModels = Array.from(new Set(
      cost_distribution.flatMap(day => Object.keys(day.models))
    )).sort();

    // Get sorted dates
    const dates = cost_distribution.map(item => item.date);

    // Create series data for each model
    const series = allModels.map(model => ({
      name: model,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: cost_distribution.map(day => 
        parseFloat((day.models[model] || 0).toFixed(5))
      )
    }));

    return { dates, series, models: allModels };
  };

  // Initialize and update charts
  useEffect(() => {
    // Skip if loading
    if (isLoading) return;

    // Initialize charts if they don't exist yet
    if (!requestCountChart && requestCountChartRef.current) {
      setRequestCountChart(echarts.init(requestCountChartRef.current));
    }

    const timer = setTimeout(() => {
      // Plus de Model Distribution Chart (supprimé)
      // Update Request Count Chart
      if (requestCountChart) {
        // Use fake data for cost estimation with Makehub theme colors and English text
        requestCountChart.setOption({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: (params: any) => {
              // params = [withoutSmart, withSmart]
              const without = params[0].value;
              const withSmart = params[1].value;
              const percent = without > 0 ? (((without - withSmart) / without) * 100).toFixed(1) : "0";
              return `
                <div>
                  <div><span style="color:#6366f1;font-weight:600;">$${without}</span> Without Smart Routing</div>
                  <div><span style="color:#3b82f6;font-weight:600;">$${withSmart}</span> With Smart Routing</div>
                  <div style="color:#10b981;font-weight:600;">Savings: $${(without - withSmart).toFixed(2)} (${percent}%)</div>
                </div>
              `;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#6366f1',
            textStyle: {
              color: '#111827'
            },
            extraCssText: 'box-shadow: 0 2px 6px rgba(99, 102, 241, 0.08); border-radius: 6px; padding: 10px;'
          },
          legend: {
            data: ['Without Smart Routing', 'With Smart Routing'],
            bottom: '5%',
            textStyle: {
              color: '#111827',
              fontSize: 12,
              fontWeight: 'bold'
            }
          },
          xAxis: {
            type: 'category',
            data: costEstimationData.days,
            axisLabel: {
              rotate: 0,
              color: '#111827',
              fontSize: 11,
              fontWeight: 'bold'
            },
            axisLine: {
              lineStyle: {
                color: '#111827'
              }
            },
            axisTick: {
              alignWithLabel: true,
              lineStyle: {
                color: '#6366f1'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: 'Cumulative Cost ($)',
            min: 0,
            max: (() => {
              // Ajuste l'échelle pour que le graphe soit lisible
              const maxVal = Math.max(
                ...costEstimationData.withoutSmart,
                ...costEstimationData.withSmart
              );
              // Arrondi à la dizaine supérieure et ajoute 10%
              const rounded = Math.ceil(maxVal * 1.1 / 10) * 10;
              return rounded;
            })(),
            nameTextStyle: {
              color: '#111827',
              fontSize: 12,
              fontWeight: 'bold',
              padding: [0, 0, 10, 0]
            },
            axisLabel: {
              formatter: (value: number) => `$${value}`,
              color: '#111827',
              fontSize: 11
            },
            splitLine: {
              lineStyle: {
                color: '#e0e7ff',
                type: 'dashed'
              }
            }
          },
          series: [
            {
              name: 'Without Smart Routing',
              data: costEstimationData.withoutSmart,
              type: 'line',
              smooth: true,
              itemStyle: {
                color: '#6366f1'
              },
              lineStyle: {
                width: 3,
                color: '#6366f1'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(99, 102, 241, 0.18)' },
                  { offset: 1, color: 'rgba(99, 102, 241, 0.01)' }
                ])
              },
              animationDuration: 1000
            },
            {
              name: 'With Smart Routing',
              data: costEstimationData.withSmart,
              type: 'line',
              smooth: true,
              itemStyle: {
                color: '#3b82f6'
              },
              lineStyle: {
                width: 3,
                color: '#3b82f6'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.18)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
                ])
              },
              animationDuration: 1000,
              animationDelay: 200
            }
          ],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '5%',
            containLabel: true
          }
        });
      }


      
    }, 300); // Small delay for smoother rendering

    // Window resize handler
    const handleResize = () => {
      requestCountChart?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [graphItems, isLoading, requestCountChart]);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      requestCountChart?.dispose();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-b-indigo-600 border-indigo-300"></div>
          <p className="mt-3 text-sm text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!graphItems.length) {
    return (
      <motion.div 
        className="w-full py-16 text-center bg-gray-50/50 rounded-xl border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-50 rounded-full border border-blue-100 mb-3">
            <ChartIcon className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-gray-700 font-medium mb-2">No Usage Data Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm mb-4">
            Start using the API to see your usage analytics. Charts will appear here once you have data.
          </p>
          <a href="/docs" className="text-blue-600 text-sm hover:underline flex items-center">
            View API Documentation 
            <ArrowRight className="ml-1 h-3 w-3" />
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Aggregated Cost Evolution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AggregatedCostEvolutionChart />
        </motion.div>

        {/* Original Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden flex flex-col h-[400px]"
          >
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Model Distribution</h3>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
              <div className="mb-4 flex items-center bg-gray-100 rounded-xl p-1 self-end">
                <button
                  onClick={() => setPieMode('cost')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pieMode === 'cost'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Cost ($)
                </button>
                <button
                  onClick={() => setPieMode('tokens')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pieMode === 'tokens'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Tokens
                </button>
              </div>
              {loadingPie ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-indigo-600 border-indigo-300"></div>
                </div>
              ) : pieError ? (
                <div className="text-sm text-red-500">{pieError}</div>
              ) : (
                <MinimalCostPieChart
                  data={pieMode === 'cost' ? costPieData : tokenPieData}
                  mode={pieMode}
                />
              )}
            </div>
          </motion.div>

          {/* Provider Cost/Token Pie Chart */}
          <ProviderPieChart />
        </div>
        <CostEstimationForecastChartWrapper />
      </div>
    </div>
  );
}

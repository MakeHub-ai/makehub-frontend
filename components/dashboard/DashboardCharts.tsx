"use client"

import { useEffect, useRef, useState } from 'react';
import type { GraphItem } from '@/types/dashboard';
import * as echarts from 'echarts/core';
import { LineChart, PieChart, BarChart as EChartsBarChart } from 'echarts/charts';
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
  PieChart,
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

interface DashboardChartsProps {
  graphItems: GraphItem[];
  isLoading?: boolean;
  usedThisMonth?: number;
  cost_distribution?: CostDistributionItem[];
  savingsData?: SavingsDataItem[];
}
export function DashboardCharts({ graphItems, isLoading = false, usedThisMonth, cost_distribution = [], savingsData = [] }: DashboardChartsProps) {
  const modelDistributionChartRef = useRef<HTMLDivElement>(null);
  const requestCountChartRef = useRef<HTMLDivElement>(null);
  const costByModelChartRef = useRef<HTMLDivElement>(null);
  
  const [modelDistributionChart, setModelDistributionChart] = useState<echarts.ECharts | null>(null);
  const [requestCountChart, setRequestCountChart] = useState<echarts.ECharts | null>(null);
  const [costByModelChart, setCostByModelChart] = useState<echarts.ECharts | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'models' | 'requests'>('models');
  const [chartDataReady, setChartDataReady] = useState(false);

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

  // Process data for model distribution chart
  const processModelData = () => {
    if (!graphItems.length) return [];

    // Compte les occurrences de chaque modèle
    const modelCounts = graphItems.reduce((acc: { [key: string]: number }, item) => {
      acc[item.model] = item.usage_count;
      return acc;
    }, {});

    // Convertit en format ECharts et trie par nombre d'utilisations
    const sortedModels = Object.entries(modelCounts)
      .map(([model, count]) => ({ name: model, value: count }))
      .sort((a, b) => b.value - a.value);

    // Garde les 9 premiers modèles et regroupe le reste dans "Others"
    if (sortedModels.length > 10) {
      const topModels = sortedModels.slice(0, 9);
      const othersValue = sortedModels
        .slice(9)
        .reduce((sum, item) => sum + item.value, 0);
      
      return [...topModels, { name: 'Others', value: othersValue }];
    }

    return sortedModels;
  };

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
    if (!modelDistributionChart && modelDistributionChartRef.current) {
      setModelDistributionChart(echarts.init(modelDistributionChartRef.current));
    }
    
    if (!requestCountChart && requestCountChartRef.current) {
      setRequestCountChart(echarts.init(requestCountChartRef.current));
    }

    if (!costByModelChart && costByModelChartRef.current) {
      setCostByModelChart(echarts.init(costByModelChartRef.current));
    }

    const timer = setTimeout(() => {
      // Update Model Distribution Chart
      if (modelDistributionChart) {
        const modelData = processModelData();
        
        modelDistributionChart.setOption({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
              return `<div class="font-medium text-gray-900">${params.name}</div>
                    <div class="text-blue-600">${params.value} requests</div>
                    <div class="text-xs text-gray-500">${params.percent}% of total</div>`;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#e5e7eb',
            textStyle: {
              color: '#374151'
            },
            extraCssText: 'box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); border-radius: 6px; padding: 10px;'
          },
          legend: { show: false },
          series: [{
            name: 'Model Usage',
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            },
            labelLine: {
              show: false
            },
            data: modelData,
            // Animation
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx: number) {
              return idx * 100;
            }
          }],
          color: [
            '#8b5cf6', // Violet de départ
            '#7c66f7',
            '#6d70f7',
            '#5e7af8',
            '#4f84f8',
            '#408ef9',
            '#3b82f6', // Bleu d'arrivée
            '#3b82f6',
            '#3b82f6',
            '#6b7280' // Gris pour "Others"
          ]
        });
      }

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

      // Update Cost by Model Chart
      if (costByModelChart) {
        const costData = processCostByModelData();
        
        costByModelChart.setOption({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: (params: any) => {
              let total = params.reduce((sum: number, series: any) => sum + (series.value || 0), 0);
              let result = `<div class="font-medium text-gray-900">${params[0].name}</div>`;
              
              // Filter out series with zero or null values
              params.filter((series: { value: number | undefined }) => series.value && series.value > 0)
                    .forEach((series: any) => {
                const percentage = ((series.value || 0) / total * 100).toFixed(1);
                result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${series.color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span>${series.seriesName}: $${series.value.toFixed(5)} (${percentage}%)</span>
                </div>`;
              });
              
              result += `<div class="font-medium mt-2">Total: $${total.toFixed(5)}</div>`;
              return result;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#e5e7eb',
            textStyle: {
              color: '#374151'
            },
            extraCssText: 'box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); border-radius: 6px; padding: 10px;'
          },
          legend: { show: false },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '5%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: costData.dates,
            axisLabel: {
              color: '#374151',
              fontSize: 10,
              rotate: 45
            },
            axisLine: {
              lineStyle: {
                color: '#e5e7eb'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: 'Cost ($)',
            nameTextStyle: {
              color: '#374151',
              fontSize: 12,
              padding: [0, 0, 10, 0]
            },
            axisLabel: {
              formatter: '${value}',
              color: '#374151',
              fontSize: 10
            },
            splitLine: {
              lineStyle: {
                color: '#e5e7eb',
                type: 'dashed'
              }
            }
          },
          series: costData.series,
          color: [
            '#8b5cf6',
            '#7c66f7',
            '#6d70f7',
            '#5e7af8',
            '#4f84f8',
            '#408ef9',
            '#3b82f6',
            '#60a5fa',
            '#93c5fd',
            '#bfdbfe'
          ]
        });
      }

      setChartDataReady(true);
    }, 300); // Small delay for smoother rendering

    // Window resize handler
    const handleResize = () => {
      modelDistributionChart?.resize();
      requestCountChart?.resize();
      costByModelChart?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [graphItems, isLoading, modelDistributionChart, requestCountChart, costByModelChart]);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      modelDistributionChart?.dispose();
      requestCountChart?.dispose();
      costByModelChart?.dispose();
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
        {/* Cost by Model Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: chartDataReady ? 1 : 0, y: chartDataReady ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]"
        >
          <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Cost Distribution by Model</h3>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div ref={costByModelChartRef} className="w-full h-full" />
          </div>
        </motion.div>

        {/* Original Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: chartDataReady ? 1 : 0, y: chartDataReady ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]"
          >
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Model Distribution</h3>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div ref={modelDistributionChartRef} className="w-full h-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: chartDataReady ? 1 : 0, y: chartDataReady ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]"
          >
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#111827]">Cost Estimation (MakeHub)</h3>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div ref={requestCountChartRef} className="w-full h-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

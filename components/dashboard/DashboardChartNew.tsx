import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

const CumulativeTokenChart = () => {
  const [displayMode, setDisplayMode] = useState('tokens'); // 'tokens' or 'price'
  const [timePeriod, setTimePeriod] = useState('7days'); // '7days', '30days', '3months'
  
  // Data sets for different time periods
  const dataByPeriod = {
    '7days': [
      {
        date: 'Mon 17',
        'Claude Sonnet 4': 8500,
        'Claude Opus 4': 4200,
        'GPT-4': 3800,
        'GPT-3.5': 2000,
        total: 18500,
        'Claude Sonnet 4_price': 2.55,
        'Claude Opus 4_price': 6.30,
        'GPT-4_price': 3.80,
        'GPT-3.5_price': 0.40,
        total_price: 13.05
      },
      {
        date: 'Tue 18',
        'Claude Sonnet 4': 10200,
        'Claude Opus 4': 5800,
        'GPT-4': 4100,
        'GPT-3.5': 2200,
        total: 22300,
        'Claude Sonnet 4_price': 3.06,
        'Claude Opus 4_price': 8.70,
        'GPT-4_price': 4.10,
        'GPT-3.5_price': 0.44,
        total_price: 16.30
      },
      {
        date: 'Wed 19',
        'Claude Sonnet 4': 9100,
        'Claude Opus 4': 4900,
        'GPT-4': 3600,
        'GPT-3.5': 2200,
        total: 19800,
        'Claude Sonnet 4_price': 2.73,
        'Claude Opus 4_price': 7.35,
        'GPT-4_price': 3.60,
        'GPT-3.5_price': 0.44,
        total_price: 14.12
      },
      {
        date: 'Thu 20',
        'Claude Sonnet 4': 12800,
        'Claude Opus 4': 7200,
        'GPT-4': 4500,
        'GPT-3.5': 2200,
        total: 26700,
        'Claude Sonnet 4_price': 3.84,
        'Claude Opus 4_price': 10.80,
        'GPT-4_price': 4.50,
        'GPT-3.5_price': 0.44,
        total_price: 19.58
      },
      {
        date: 'Fri 21',
        'Claude Sonnet 4': 15600,
        'Claude Opus 4': 8900,
        'GPT-4': 4200,
        'GPT-3.5': 2500,
        total: 31200,
        'Claude Sonnet 4_price': 4.68,
        'Claude Opus 4_price': 13.35,
        'GPT-4_price': 4.20,
        'GPT-3.5_price': 0.50,
        total_price: 22.73
      },
      {
        date: 'Sat 22',
        'Claude Sonnet 4': 7800,
        'Claude Opus 4': 3200,
        'GPT-4': 2900,
        'GPT-3.5': 1500,
        total: 15400,
        'Claude Sonnet 4_price': 2.34,
        'Claude Opus 4_price': 4.80,
        'GPT-4_price': 2.90,
        'GPT-3.5_price': 0.30,
        total_price: 10.34
      },
      {
        date: 'Sun 23',
        'Claude Sonnet 4': 14200,
        'Claude Opus 4': 8100,
        'GPT-4': 4100,
        'GPT-3.5': 2500,
        total: 28900,
        'Claude Sonnet 4_price': 4.26,
        'Claude Opus 4_price': 12.15,
        'GPT-4_price': 4.10,
        'GPT-3.5_price': 0.50,
        total_price: 21.01
      }
    ],
    '30days': [
      { date: 'Week 1', 'Claude Sonnet 4': 78200, 'Claude Opus 4': 42300, 'GPT-4': 27100, 'GPT-3.5': 15100, total: 162700, 'Claude Sonnet 4_price': 23.46, 'Claude Opus 4_price': 63.45, 'GPT-4_price': 27.10, 'GPT-3.5_price': 3.02, total_price: 117.03 },
      { date: 'Week 2', 'Claude Sonnet 4': 85600, 'Claude Opus 4': 38900, 'GPT-4': 31200, 'GPT-3.5': 18700, total: 174400, 'Claude Sonnet 4_price': 25.68, 'Claude Opus 4_price': 58.35, 'GPT-4_price': 31.20, 'GPT-3.5_price': 3.74, total_price: 118.97 },
      { date: 'Week 3', 'Claude Sonnet 4': 92100, 'Claude Opus 4': 45200, 'GPT-4': 28600, 'GPT-3.5': 16800, total: 182700, 'Claude Sonnet 4_price': 27.63, 'Claude Opus 4_price': 67.80, 'GPT-4_price': 28.60, 'GPT-3.5_price': 3.36, total_price: 127.39 },
      { date: 'Week 4', 'Claude Sonnet 4': 88400, 'Claude Opus 4': 41700, 'GPT-4': 33500, 'GPT-3.5': 19200, total: 182800, 'Claude Sonnet 4_price': 26.52, 'Claude Opus 4_price': 62.55, 'GPT-4_price': 33.50, 'GPT-3.5_price': 3.84, total_price: 126.41 }
    ],
    '3months': [
      { date: 'Jan', 'Claude Sonnet 4': 342000, 'Claude Opus 4': 198000, 'GPT-4': 156000, 'GPT-3.5': 89000, total: 785000, 'Claude Sonnet 4_price': 102.60, 'Claude Opus 4_price': 297.00, 'GPT-4_price': 156.00, 'GPT-3.5_price': 17.80, total_price: 573.40 },
      { date: 'Feb', 'Claude Sonnet 4': 367000, 'Claude Opus 4': 212000, 'GPT-4': 178000, 'GPT-3.5': 95000, total: 852000, 'Claude Sonnet 4_price': 110.10, 'Claude Opus 4_price': 318.00, 'GPT-4_price': 178.00, 'GPT-3.5_price': 19.00, total_price: 625.10 },
      { date: 'Mar', 'Claude Sonnet 4': 398000, 'Claude Opus 4': 231000, 'GPT-4': 167000, 'GPT-3.5': 102000, total: 898000, 'Claude Sonnet 4_price': 119.40, 'Claude Opus 4_price': 346.50, 'GPT-4_price': 167.00, 'GPT-3.5_price': 20.40, total_price: 653.30 }
    ]
  };

  // Color palette
  const colorPalette = {
    'Claude Sonnet 4': '#674AFF',
    'Claude Opus 4': '#4F46E5',
    'GPT-4': '#3B82F6',
    'GPT-3.5': '#93C5FD'
  };

  const models = ['Claude Sonnet 4', 'Claude Opus 4', 'GPT-4', 'GPT-3.5'];
  const currentData = dataByPeriod[timePeriod];

  // Time period options
  const timePeriodOptions = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '3months', label: '3 Months' }
  ];

  // Format tokens in k/M
  const formatTokens = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
    return value.toString();
  };

  // Custom sophisticated tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + item.value, 0);
      
      return (
        <div className="bg-white/95 backdrop-blur-md p-6 border border-gray-200/50 rounded-2xl shadow-2xl ring-1 ring-black/5 transform transition-all duration-200 scale-100">
          <div className="text-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg tracking-wide">{label}</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto my-2 rounded-full"></div>
            <p className="text-sm text-gray-500 font-medium">
              Total: {displayMode === 'tokens' 
                ? formatTokens(total) + ' tokens' 
                : '$' + total.toFixed(2)
              }
            </p>
          </div>
          
          <div className="space-y-3">
            {payload.reverse().map((entry, index) => {
              return (
                <div key={index} className="flex items-center justify-between group hover:bg-gray-50/50 p-2 rounded-lg transition-colors duration-150 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white group-hover:scale-110 transition-transform duration-150 flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                      {entry.dataKey.replace('_price', '')}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors whitespace-nowrap">
                      {displayMode === 'tokens' 
                        ? formatTokens(entry.value)
                        : '$' + entry.value.toFixed(2)
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

  // Custom sophisticated pie tooltip
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload[0].payload.total;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-200/50 rounded-xl shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-gray-800">{data.name}</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-bold text-gray-800">
              {displayMode === 'tokens' 
                ? formatTokens(data.value)
                : '$' + data.value.toFixed(2)
              }
            </p>
            <p className="text-xs">{percentage}% of total</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Monthly evolution data with forecast
  const monthlyEvolutionData = [
    { date: 'Jun 1', actual: 45.20, forecast: null, isActual: true },
    { date: 'Jun 2', actual: 52.10, forecast: null, isActual: true },
    { date: 'Jun 3', actual: 48.75, forecast: null, isActual: true },
    { date: 'Jun 4', actual: 61.30, forecast: null, isActual: true },
    { date: 'Jun 5', actual: 58.90, forecast: null, isActual: true },
    { date: 'Jun 6', actual: 71.20, forecast: null, isActual: true },
    { date: 'Jun 7', actual: 69.45, forecast: null, isActual: true },
    { date: 'Jun 8', actual: 75.80, forecast: null, isActual: true },
    { date: 'Jun 9', actual: 82.15, forecast: null, isActual: true },
    { date: 'Jun 10', actual: 89.60, forecast: null, isActual: true },
    { date: 'Jun 11', actual: 95.25, forecast: null, isActual: true },
    { date: 'Jun 12', actual: 102.80, forecast: null, isActual: true },
    { date: 'Jun 13', actual: 108.90, forecast: null, isActual: true },
    { date: 'Jun 14', actual: 115.75, forecast: null, isActual: true },
    { date: 'Jun 15', actual: 122.40, forecast: null, isActual: true },
    { date: 'Jun 16', actual: 130.85, forecast: null, isActual: true },
    { date: 'Jun 17', actual: 138.20, forecast: null, isActual: true },
    { date: 'Jun 18', actual: 145.60, forecast: null, isActual: true },
    { date: 'Jun 19', actual: 152.75, forecast: null, isActual: true },
    { date: 'Jun 20', actual: 160.20, forecast: null, isActual: true },
    { date: 'Jun 21', actual: 167.85, forecast: null, isActual: true },
    { date: 'Jun 22', actual: 175.30, forecast: null, isActual: true },
    { date: 'Jun 23', actual: 182.95, forecast: null, isActual: true },
    // Forecast data
    { date: 'Jun 24', actual: null, forecast: 190.40, isActual: false },
    { date: 'Jun 25', actual: null, forecast: 197.85, isActual: false },
    { date: 'Jun 26', actual: null, forecast: 205.30, isActual: false },
    { date: 'Jun 27', actual: null, forecast: 212.75, isActual: false },
    { date: 'Jun 28', actual: null, forecast: 220.20, isActual: false },
    { date: 'Jun 29', actual: null, forecast: 227.65, isActual: false },
    { date: 'Jun 30', actual: null, forecast: 235.10, isActual: false }
  ];

  // Custom forecast tooltip
  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isActual = data.isActual;
      const value = isActual ? data.actual : data.forecast;
      
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-200/50 rounded-xl shadow-2xl ring-1 ring-black/5">
          <div className="text-center mb-2">
            <h3 className="font-bold text-gray-800 text-sm">{label}</h3>
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto my-1 rounded-full"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              ${value?.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {isActual ? 'Actual' : 'Forecast'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  const pieChartData = models.map(model => {
    const totalTokens = currentData.reduce((sum, day) => sum + (day[model] || 0), 0);
    const totalPrice = currentData.reduce((sum, day) => sum + (day[model + '_price'] || 0), 0);
    const grandTotal = displayMode === 'tokens' 
      ? currentData.reduce((sum, day) => sum + day.total, 0)
      : currentData.reduce((sum, day) => sum + day.total_price, 0);
    
    return {
      name: model,
      value: displayMode === 'tokens' ? totalTokens : totalPrice,
      color: colorPalette[model],
      total: grandTotal
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Elegant header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Token Consumption by Model
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Detailed analysis of AI model usage and costs over time
          </p>
        </div>

        {/* Quick statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {models.map((model, index) => {
            const totalTokens = currentData.reduce((sum, day) => sum + (day[model] || 0), 0);
            const totalPrice = currentData.reduce((sum, day) => sum + (day[model + '_price'] || 0), 0);
            
            return (
              <div key={model} className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: colorPalette[model] }}
                    >
                      {model.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1 truncate">{model}</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {displayMode === 'tokens' 
                          ? formatTokens(totalTokens)
                          : '$' + totalPrice.toFixed(2)
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ultra-sophisticated main chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Cumulative Distribution of {displayMode === 'tokens' ? 'Tokens' : 'Costs'}
              </h2>
              <p className="text-gray-600">
                Stacked bar visualization of daily {displayMode === 'tokens' ? 'consumption' : 'spending'}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Time period selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Period:</span>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timePeriodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Elegant switch */}
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium transition-colors ${displayMode === 'tokens' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Tokens
                </span>
                <button
                  onClick={() => setDisplayMode(displayMode === 'tokens' ? 'price' : 'tokens')}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    displayMode === 'price' ? 'bg-gradient-to-r from-blue-500 to-violet-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      displayMode === 'price' ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors ${displayMode === 'price' ? 'text-violet-600' : 'text-gray-500'}`}>
                  Price
                </span>
              </div>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="40%"
                maxBarSize={60}
              >
                <defs>
                  {/* Sophisticated gradients */}
                  <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#674AFF" stopOpacity={1} />
                    <stop offset="100%" stopColor="#674AFF" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="gradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93C5FD" stopOpacity={1} />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB" 
                  strokeOpacity={0.5}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 14, 
                    fontWeight: 500, 
                    fill: '#6B7280' 
                  }}
                  dy={10}
                />
                
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 12, 
                    fill: '#6B7280' 
                  }}
                  tickFormatter={(value) => 
                    displayMode === 'tokens' 
                      ? `${(value / 1000).toFixed(0)}k`
                      : `$${value.toFixed(0)}`
                  }
                />
                
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ 
                    fill: 'rgba(99, 102, 241, 0.05)',
                    stroke: 'rgba(99, 102, 241, 0.2)',
                    strokeWidth: 1,
                    radius: 8
                  }}
                  animationDuration={200}
                />

                {/* Stacked bars with gradients and separations */}
                <Bar 
                  dataKey={displayMode === 'tokens' ? "Claude Sonnet 4" : "Claude Sonnet 4_price"} 
                  stackId="a" 
                  fill="url(#gradient1)"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={1}
                  radius={[0, 0, 0, 0]}
                  className="transition-all duration-200 hover:brightness-105 hover:saturate-110 hover:drop-shadow-sm"
                />
                <Bar 
                  dataKey={displayMode === 'tokens' ? "Claude Opus 4" : "Claude Opus 4_price"} 
                  stackId="a" 
                  fill="url(#gradient2)"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={1}
                  radius={[0, 0, 0, 0]}
                  className="transition-all duration-200 hover:brightness-105 hover:saturate-110 hover:drop-shadow-sm"
                />
                <Bar 
                  dataKey={displayMode === 'tokens' ? "GPT-4" : "GPT-4_price"} 
                  stackId="a" 
                  fill="url(#gradient3)"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={1}
                  radius={[0, 0, 0, 0]}
                  className="transition-all duration-200 hover:brightness-105 hover:saturate-110 hover:drop-shadow-sm"
                />
                <Bar 
                  dataKey={displayMode === 'tokens' ? "GPT-3.5" : "GPT-3.5_price"} 
                  stackId="a" 
                  fill="url(#gradient4)"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  className="transition-all duration-200 hover:brightness-105 hover:saturate-110 hover:drop-shadow-sm"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Elegant custom legend */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6">
              {models.map((model) => (
                <div key={model} className="flex items-center gap-3 group cursor-pointer">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: colorPalette[model] }}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {model}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Distribution Overview
            </h2>
            <p className="text-gray-600">
              Model usage breakdown for the selected period
            </p>
          </div>

        {/* Pie Chart Section - Same dimensions as bar chart */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Distribution Overview
              </h2>
              <p className="text-gray-600">
                Model usage breakdown for the selected period
              </p>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {/* Sophisticated gradients for pie */}
                  <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#674AFF" stopOpacity={1} />
                    <stop offset="100%" stopColor="#674AFF" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="pieGradient4" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#93C5FD" stopOpacity={1} />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  innerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieChartData.map((entry, index) => {
                    const gradientIds = ['url(#pieGradient1)', 'url(#pieGradient2)', 'url(#pieGradient3)', 'url(#pieGradient4)'];
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={gradientIds[index]}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth={2}
                        className="hover:brightness-110 transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Elegant custom legend */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6">
              {models.map((model) => (
                <div key={model} className="flex items-center gap-3 group cursor-pointer">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: colorPalette[model] }}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {model}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Cost Evolution with Forecast */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Monthly Cost Evolution & Forecast
              </h2>
              <p className="text-gray-600">
                Actual spending this month with projected costs until month end
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-2 border-dashed border-violet-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Forecast</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyEvolutionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  {/* Gradients for area fill */}
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#674AFF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#674AFF" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93C5FD" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB" 
                  strokeOpacity={0.5}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 12, 
                    fontWeight: 500, 
                    fill: '#6B7280' 
                  }}
                  dy={10}
                  interval={4}
                />
                
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 12, 
                    fill: '#6B7280' 
                  }}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                />
                
                <Tooltip 
                  content={<CustomForecastTooltip />}
                  cursor={{ 
                    stroke: 'rgba(99, 102, 241, 0.2)',
                    strokeWidth: 1,
                    strokeDasharray: '5 5'
                  }}
                />

                {/* Actual data area */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#674AFF"
                  strokeWidth={3}
                  fill="url(#actualGradient)"
                  connectNulls={false}
                  dot={{ fill: '#674AFF', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#674AFF', strokeWidth: 2, fill: '#fff' }}
                />

                {/* Forecast data area */}
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#93C5FD"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  fill="url(#forecastGradient)"
                  connectNulls={false}
                  dot={{ fill: '#93C5FD', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#93C5FD', strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cost summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl">
                <p className="text-sm font-medium text-gray-600 mb-1">Current Month</p>
                <p className="text-2xl font-bold text-blue-600">$182.95</p>
                <p className="text-xs text-gray-500">Actual spending</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
                <p className="text-sm font-medium text-gray-600 mb-1">Projected Total</p>
                <p className="text-2xl font-bold text-violet-600">$235.10</p>
                <p className="text-xs text-gray-500">End of month</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                <p className="text-sm font-medium text-gray-600 mb-1">Remaining Budget</p>
                <p className="text-2xl font-bold text-indigo-600">$52.15</p>
                <p className="text-xs text-gray-500">7 days left</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CumulativeTokenChart;
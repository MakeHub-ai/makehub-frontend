'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { FileText, Search, Filter, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UsageList } from '@/components/dashboard/UsageList';
import { getUserUsage } from '@/lib/makehub-client';
import { motion, AnimatePresence } from 'framer-motion';
import type { UsageResponse, UsagePaginatedData } from '@/types/dashboard';

export default function RequestLogsPage() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsagePaginatedData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRequestLogs = async () => {
      if (!session?.access_token) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await getUserUsage(session);
        if (isMounted) {
          setUsageData({
            items: response.data.items || [],
            hasMore: response.data.has_more || false,
            nextOffset: response.data.next_offset || null
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Request logs fetch error:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRequestLogs();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 h-[100px] rounded-xl"></div>
        ))}
      </div>
      <div className="bg-gray-100 h-[600px] rounded-xl"></div>
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-red-700">Error Loading Request Logs</p>
                <p className="text-red-600 mt-1">{error}</p>
                <button 
                  className="mt-3 px-4 py-2 text-sm bg-red-100 text-red-700 rounde
d-md hover:bg-red-200 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Calculate average response time from actual data
  const calculateAverageResponseTime = () => {
    if (!usageData?.items.length) return "0ms";
    
    const latencies = usageData.items
      .filter(item => item.metadata.details?.latency != null)
      .map(item => {
        const latency = item.metadata.details!.latency;
        return typeof latency === 'string' ? parseFloat(latency) : Number(latency);
      })
      .filter(latency => !isNaN(latency) && latency > 0);
    
    console.log('Latencies found:', latencies.length, 'out of', usageData.items.length, 'items');
    console.log('Sample latencies:', latencies.slice(0, 5));
    
    if (latencies.length === 0) return "N/A";
    
    const averageLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
    return `${Math.round(averageLatency)}ms`;
  };

  // Calculate success rate from actual data
  const calculateSuccessRate = () => {
    if (!usageData?.items.length) return "0%";
    
    // Assuming debit transactions are successful API calls
    const successfulRequests = usageData.items.filter(item =>
      item.metadata.transaction_type === 'debit' && item.type === 'chat_usage'
    ).length;
    
    const totalRequests = usageData.items.filter(item =>
      item.type === 'chat_usage'
    ).length;
    
    if (totalRequests === 0) return "0%";
    
    const successRate = (successfulRequests / totalRequests) * 100;
    return `${Math.round(successRate * 10) / 10}%`;
  };

  const logStats = usageData ? [
    {
      title: "Total Requests",
      value: usageData.items.filter(item => item.type === 'chat_usage').length.toLocaleString(),
      icon: FileText
    },
    {
      title: "Success Rate",
      value: calculateSuccessRate(),
      icon: Search
    },
    {
      title: "Avg Response Time",
      value: calculateAverageResponseTime(),
      icon: Filter
    }
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Request Logs
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and analyze all API requests with detailed logging and filtering capabilities.
              </p>
            </div>
            <motion.button
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download className="h-5 w-5 mr-2" />
              Export Logs
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Log Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {logStats.map((stat, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Request Logs List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity
: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
                  <span className="text-sm text-gray-500">Real-time logs</span>
                </div>
                {usageData && (
                  <UsageList
                    initialUsage={{
                      items: usageData.items.map(item => ({
                        id: item.id,
                        timestamp: item.timestamp,
                        type: item.type === 'API Call' ? 'api_call' as const : 'failed_request' as const,
                        amount: parseFloat(item.units.replace('$', '')),
                        formatted_amount: item.units,
                        transaction_type: item.metadata.transaction_type as 'credit' | 'debit',
                        description: item.description,
                        metadata: {
                          model: item.metadata.details.model,
                          provider: item.metadata.details.provider,
                          input_tokens: item.metadata.details.input_tokens ?? undefined,
                          output_tokens: item.metadata.details.output_tokens ?? undefined,
                          cached_tokens: undefined,
                          status: item.metadata.details.status,
                          error_message: item.metadata.details.error ?? undefined,
                          request_id: item.id,
                          transaction_id: item.id
                        }
                      })),
                      pagination: {
                        currentPage: 1,
                        pageSize: usageData.items.length,
                        totalItems: usageData.items.length,
                        totalPages: 1,
                        hasNextPage: usageData.hasMore,
                        hasPreviousPage: false
                      }
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

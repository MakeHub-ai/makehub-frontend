import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { StreamMetrics } from '@/lib/metrics-utils';
import { Model } from "@/types/models"

function calculateAverageThroughput(metrics: StreamMetrics): string {
  if (!metrics.startTime || metrics.outputTokenCount === 0) return 'N/A';
  
  const totalTime = (Date.now() - metrics.startTime) / 1000; // Convert to seconds
  const tokensPerSecond = metrics.outputTokenCount / totalTime;
  
  return `${tokensPerSecond.toFixed(2)} tokens/s`;
}

function formatTokenCount(count: number): string {
  const tokens = Math.ceil(count);
  return `${tokens.toLocaleString()} tokens`;
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}

function MetricCard({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg bg-white/50 backdrop-blur-sm p-4 shadow-sm border border-gray-100 ${className}`}>
      <Label className="text-sm font-medium text-gray-600">{label}</Label>
      <div className="mt-1 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {value}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {value}
      </span>
    </div>
  );
}

interface ParametersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onThroughputChange: (value: number | "best" | undefined) => void;
  onLatencyChange: (value: number | undefined) => void;
  metrics?: StreamMetrics;
  selectedModel?: Model;
  minThroughput?: number | "best";
  maxLatency?: number;
}

export function ParametersSidebar({ 
  isOpen, 
  onClose,
  onThroughputChange,
  onLatencyChange,
  metrics,
  selectedModel,
  minThroughput,
  maxLatency,
}: ParametersSidebarProps) {
  
  const handleThroughputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onThroughputChange(value ? Number(value) : undefined);
  };

  const handleLatencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onLatencyChange(value ? Number(value) : undefined);
  };

  const handleThroughputFocus = () => {
    // If "best" is set, clear it when user wants to input
    if (minThroughput === "best") {
      onThroughputChange(undefined);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-lg">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Parameters
        </h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-l-2 border-blue-500 pl-2">
            Performance Settings
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="min-throughput" className="text-sm text-gray-600">
                Min Throughput (t/s)
              </Label>
              <Input 
                id="min-throughput" 
                placeholder="e.g., 10.0"
                value={minThroughput === "best" ? "best" : minThroughput || ""}
                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                onChange={handleThroughputChange}
                onFocus={handleThroughputFocus}
              />
            </div>
            <div>
              <Label htmlFor="max-latency" className="text-sm text-gray-600">
                Max Latency (ms)
              </Label>
              <Input 
                id="max-latency" 
                placeholder="e.g., 500"
                value={maxLatency || ""}
                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                onChange={handleLatencyChange}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-l-2 border-indigo-500 pl-2">
            Live Metrics
          </h3>
          {metrics ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="text-xs text-gray-500 mb-1">Current Provider</div>
                <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {metrics.provider || selectedModel?.provider || 'Not selected'}
                </div>
              </div>
              
              <div className="divide-y divide-gray-100/50">
                <div className="px-4">
                  <MetricRow 
                    label="Latency"
                    value={metrics.latency ? `${metrics.latency}ms` : 'N/A'}
                  />
                </div>
                <div className="px-4">
                  <MetricRow 
                    label="Throughput"
                    value={calculateAverageThroughput(metrics)}
                  />
                </div>
                <div className="px-4">
                  <MetricRow 
                    label="Input Tokens"
                    value={formatTokenCount(metrics.inputTokenCount)}
                  />
                </div>
                <div className="px-4">
                  <MetricRow 
                    label="Output Tokens"
                    value={formatTokenCount(metrics.outputTokenCount)}
                  />
                </div>
                <div className="px-4 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                  <MetricRow 
                    label="Total Cost"
                    value={formatCost(metrics.totalCost)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg">
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">No metrics available</p>
              <p className="text-xs text-gray-500 mt-1">Start a conversation to see metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
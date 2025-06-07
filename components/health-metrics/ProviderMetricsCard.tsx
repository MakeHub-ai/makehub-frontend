import React from 'react';

interface ProviderMetricsCardProps {
  modelId: string;
  modelName: string;
  provider: string;
  status: 'loading' | 'error' | 'success';
  data?: any;
}

const ProviderMetricsCard: React.FC<ProviderMetricsCardProps> = ({
  modelId,
  modelName,
  provider,
  status,
  data,
}) => {
  const getStatusColor = (status: 'loading' | 'error' | 'success') => {
    switch (status) {
      case 'loading':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  const baseLogoPath = `/model_logo/${provider.split('-')[0].toLowerCase().replace(/\s+/g, '-')}`;
  const logoExtensions = ['.webp', '.png', '.svg'];
  let logoPath = '';

  // Get logo path for provider
  for (const ext of logoExtensions) {
    const potentialPath = `${baseLogoPath}${ext}`;
    logoPath = potentialPath;
    break;
  }

  return (
    <div className="border border-gray-300 p-4 mb-2 rounded-none bg-white shadow-none">
      <h4 className="font-semibold text-md flex items-center">
        {logoPath && (
           <img src={logoPath} alt={`${provider} Logo`} className="h-5 w-5 mr-2 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
        {provider}
      </h4>
      <p className="text-sm text-gray-600 mb-1">Model ID: {modelId}</p>
      <p className={`text-sm ${getStatusColor(status)}`}>Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>

      {status === 'loading' && !data && (
        <p className="text-sm text-gray-500 mt-2">Loading metrics...</p>
      )}

      {status === 'error' && data?.error && (
        <p className="text-sm text-red-500 mt-2">Error: {data.error}</p>
      )}

      {status === 'success' && data?.metrics && (
        <div className="mt-2 text-sm">
          <p><strong>Last Latency:</strong> {Math.round(data.metrics.last_latency_ms) || 'N/A'} ms</p>
          <p><strong>Avg Latency:</strong> {Math.round(data.metrics.avg_latency_120min_ms) || 'N/A'} ms</p>
          <p><strong>Avg Throughput:</strong> {Math.round(data.metrics.avg_throughput_120min_tokens_per_second) || 'N/A'} tokens/s</p>
          <p><strong>RTT from MakeHUB:</strong> {Math.round(data.metrics.rtt_from_makehub_ms) || 'N/A'} ms</p>
        </div>
      )}
    </div>
  );
};

export default ProviderMetricsCard;

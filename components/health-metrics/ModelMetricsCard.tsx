import React, { useState } from 'react';

interface ModelMetricsCardProps {
  modelId: string;
  modelName: string;
  provider: string;
  companyName: string; // Add companyName prop
  status: 'loading' | 'error' | 'success';
  data?: any; // Use a more specific type later if needed
}

const ModelMetricsCard: React.FC<ModelMetricsCardProps> = ({
  modelId,
  modelName,
  provider,
  companyName, // Destructure companyName
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

  const baseLogoPath = `/model_logo/${companyName.toLowerCase().replace(/\s+/g, '-')}`;
  const logoExtensions = ['.webp', '.png', '.svg'];
  let logoPath = '';

  // In a real app, you would check for file existence on the server or during build.
  // For this client-side component, we'll construct potential paths and rely on onError.
  // We'll iterate through extensions to find a potential path.
  for (const ext of logoExtensions) {
    const potentialPath = `${baseLogoPath}${ext}`;
    // We can't directly check file existence here, so we'll just set the path
    // and the onError will hide the image if it doesn't load.
    logoPath = potentialPath;
    break; // Still break after the first potential path for simplicity
  }

  return (
    <div className="border border-gray-300 p-4 mb-2 rounded-none bg-white shadow-none">
      <h4 className="font-semibold text-md flex items-center">
        {logoPath && (
           <img src={logoPath} alt={`${companyName} Logo`} className="h-5 w-5 mr-2 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
        {provider} - {modelName}
      </h4>
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

export default ModelMetricsCard;

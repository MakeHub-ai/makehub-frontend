'use client';

import { ComingSoon } from '@/components/dashboard/ComingSoon';
import { Cpu } from 'lucide-react';

export default function ModelPerformancePage() {
  return (
    <ComingSoon
      title="Model Performance"
      description="Advanced AI model performance analytics including response times, accuracy metrics, cost per token analysis, and model comparison tools. Monitor which models perform best for your specific use cases."
      icon={Cpu}
    />
  );
}
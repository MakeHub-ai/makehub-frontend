'use client';

import { ComingSoon } from '@/components/dashboard/ComingSoon';
import { CreditCard } from 'lucide-react';

export default function BillingPage() {
  return (
    <ComingSoon
      title="Billing"
      description="Complete billing and subscription management including payment history, invoice downloads, plan upgrades, usage-based billing details, and cost forecasting tools."
      icon={CreditCard}
    />
  );
}
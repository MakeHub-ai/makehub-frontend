'use client';

import { ComingSoon } from '@/components/dashboard/ComingSoon';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ComingSoon
      title="User Settings"
      description="Comprehensive account settings including profile management, notification preferences, API configuration, security settings, and personalization options for your dashboard experience."
      icon={Settings}
    />
  );
}
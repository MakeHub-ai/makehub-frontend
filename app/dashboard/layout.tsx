'use client';

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardDataProvider, useDashboardData } from '@/contexts/dashboard-data-context';
import { BarChart3 } from 'lucide-react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="fixed inset-0 top-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading dashboard data...</p>
          <p className="text-sm text-gray-500">This will only happen once per session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 top-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-500 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-20 bg-gray-50 flex">
      {/* Sidebar */}
      <DashboardSidebar className="flex-shrink-0" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardDataProvider>
        <DashboardContent>
          {children}
        </DashboardContent>
      </DashboardDataProvider>
    </ProtectedRoute>
  );
}
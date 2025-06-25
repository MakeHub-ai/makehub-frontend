'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Cpu,
  Server,
  Key,
  FileText,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main dashboard with key metrics'
  },
  {
    name: 'Usage Analytics',
    href: '/dashboard/usage-analytics',
    icon: BarChart3,
    description: 'Detailed usage analytics and trends'
  },
  {
    name: 'Model Performance',
    href: '/dashboard/model-performance',
    icon: Cpu,
    description: 'AI model performance metrics'
  },
  {
    name: 'Provider Statistics',
    href: '/dashboard/provider-statistics',
    icon: Server,
    description: 'Provider performance and stats'
  },
  {
    name: 'API Keys & Security',
    href: '/dashboard/api-security',
    icon: Key,
    description: 'Manage API keys and security'
  },
  {
    name: 'Request Logs',
    href: '/dashboard/request-logs',
    icon: FileText,
    description: 'View and analyze request logs'
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
    description: 'Billing and subscription management'
  },
  {
    name: 'User Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account and preferences'
  }
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const sidebarVariants = {
    expanded: { 
      width: '280px',
      minWidth: '280px',
      maxWidth: '280px'
    },
    collapsed: { 
      width: '80px',
      minWidth: '80px',
      maxWidth: '80px'
    }
  };

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  };

  return (
    <motion.div
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col h-full shadow-sm overflow-hidden dashboard-sidebar',
        className
      )}
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ 
        overflowX: 'hidden',
        contain: 'layout style'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            variants={itemVariants}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            <p className="text-xs text-gray-500 mt-1">MakeHub Analytics</p>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  )}
                />
                {!isCollapsed && (
                  <motion.div
                    className="ml-3 flex-1 min-w-0"
                    variants={itemVariants}
                    animate={isCollapsed ? 'collapsed' : 'expanded'}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate break-words">{item.name}</span>
                      <span className="text-xs text-gray-500 truncate break-words mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          className="p-4 border-t border-gray-100"
          variants={itemVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs text-gray-500">
            <p className="font-medium">MakeHub Dashboard</p>
            <p className="mt-1">Professional Analytics Suite</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

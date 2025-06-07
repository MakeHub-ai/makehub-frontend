import { Card } from '@/components/ui/card';
import type { StatCardProps } from '@/types/dashboard';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface EnhancedStatCardProps extends StatCardProps {
  variant?: 'default' | 'credit';
  isFree?: boolean;
  loading?: boolean;
}

export function StatCard({ 
  icon: Icon, 
  title, 
  value,
  variant = 'default',
  isFree = false,
  loading = false
}: EnhancedStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="border-gray-100 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 border border-blue-100">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {loading ? (
              <div className="animate-pulse mt-2">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : isFree && variant === 'credit' ? (
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xl font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-100">
                  <Zap className="w-5 h-5 mr-2 text-green-500" />
                  {value}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

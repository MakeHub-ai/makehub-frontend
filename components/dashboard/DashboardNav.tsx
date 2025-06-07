import Link from 'next/link';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Key } from 'lucide-react';

interface DashboardNavProps {
  currentPlan?: string;
  className?: string;
}

export function DashboardNav({ 
  currentPlan,
  className = "" 
}: DashboardNavProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
          {currentPlan && (
            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
              {currentPlan}
            </span>
          )}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/dashboard/api-security">
          <Button variant="outline" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </Button>
        </Link>
        <Link href="/reload">
          <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Credit
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

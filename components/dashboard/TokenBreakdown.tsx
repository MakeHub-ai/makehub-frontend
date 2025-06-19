"use client";

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface TokenBreakdownProps {
  promptTokens: number;
  completionTokens: number;
  model: string;
  provider?: string;
  isExpanded: boolean;
}

const containerVariants: Variants = {
  collapsed: { 
    height: 0,
    scaleY: 0.9,
    opacity: 0,
    transition: {
      height: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const },
      opacity: { duration: 0.15 }
    }
  },
  expanded: { 
    height: 'auto' as const,
    scaleY: 1,
    opacity: 1,
    transition: {
      height: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const },
      opacity: { duration: 0.15, delay: 0.05 },
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  collapsed: { 
    scale: 0.95,
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const }
  },
  expanded: { 
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const }
  }
};

export function TokenBreakdown({ 
  promptTokens, 
  completionTokens, 
  model,
  provider,
  isExpanded
}: TokenBreakdownProps) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className="overflow-hidden origin-top"
          variants={containerVariants}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          layout
        >
          <motion.div 
            className="mt-2 grid grid-cols-3 gap-2"
            variants={itemVariants}
          >
            {/* Provider */}
            <div className="flex items-center bg-gray-50/50 rounded-lg p-2 border border-gray-100">
              <div className="p-1.5 bg-gray-100 rounded-md mr-3">
                <svg className="h-3 w-3 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-600 uppercase">Provider</p>
                <p className="text-sm font-medium text-gray-700">
                  {provider || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Input Tokens */}
            <div className="flex items-center bg-blue-50/50 rounded-lg p-2 border border-blue-100">
              <div className="p-1.5 bg-blue-100 rounded-md mr-3">
                <ArrowUpFromLine className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-blue-600 uppercase">Input</p>
                <p className="text-sm font-medium text-gray-700">
                  {promptTokens.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Output Tokens */}
            <div className="flex items-center bg-indigo-50/50 rounded-lg p-2 border border-indigo-100">
              <div className="p-1.5 bg-indigo-100 rounded-md mr-3">
                <ArrowDownToLine className="h-3 w-3 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-indigo-600 uppercase">Output</p>
                <p className="text-sm font-medium text-gray-700">
                  {completionTokens.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Building2, Globe } from 'lucide-react';
import type { ProviderTypeToggleProps } from '@/types/provider-stats';
import { cn } from '@/lib/utils';

export const ProviderTypeToggle: React.FC<ProviderTypeToggleProps> = ({
  currentType,
  onTypeChange,
}) => {
  const options = [
    {
      type: 'open-source' as const,
      label: 'Open Source',
      description: 'Community-driven providers',
      icon: Heart,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
      iconColor: 'text-emerald-600',
    },
    {
      type: 'closed-source' as const,
      label: 'Closed Source',
      description: 'Commercial providers',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-600" />
            Provider Type
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose which type of providers to analyze
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = currentType === option.type;
          
          return (
            <motion.button
              key={option.type}
              onClick={() => onTypeChange(option.type)}
              className={cn(
                'relative p-6 rounded-xl border-2 transition-all duration-200 text-left',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                isSelected
                  ? cn(
                      'border-2 shadow-md',
                      option.borderColor,
                      option.bgColor
                    )
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={false}
              animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
            >
              {/* Background gradient for selected */}
              {isSelected && (
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-5 rounded-xl',
                  option.color
                )} />
              )}

              <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    isSelected
                      ? cn('bg-gradient-to-br', option.color)
                      : 'bg-gray-100'
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      isSelected ? 'text-white' : 'text-gray-600'
                    )} />
                  </div>
                  <div>
                    <h4 className={cn(
                      'font-semibold transition-colors',
                      isSelected ? option.textColor : 'text-gray-900'
                    )}>
                      {option.label}
                    </h4>
                    <p className={cn(
                      'text-sm transition-colors',
                      isSelected ? option.textColor.replace('-700', '-600') : 'text-gray-500'
                    )}>
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {option.type === 'open-source' ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? option.iconColor : 'bg-gray-400'
                        )} />
                        <span className={cn(
                          isSelected ? option.textColor.replace('-700', '-600') : 'text-gray-600'
                        )}>
                          Cost-effective solutions
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? option.iconColor : 'bg-gray-400'
                        )} />
                        <span className={cn(
                          isSelected ? option.textColor.replace('-700', '-600') : 'text-gray-600'
                        )}>
                          Transparent and flexible
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? option.iconColor : 'bg-gray-400'
                        )} />
                        <span className={cn(
                          isSelected ? option.textColor.replace('-700', '-600') : 'text-gray-600'
                        )}>
                          Community-driven innovation
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? option.iconColor : 'bg-gray-400'
                        )} />
                        <span className={cn(
                          isSelected ? option.textColor.replace('-700', '-600') : 'text-gray-600'
                        )}>
                          Lower competition
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? option.iconColor : 'bg-gray-400'
                        )} />
                        <span className={cn(
                          isSelected ? option.textColor.replace('-700', '-600') : 'text-gray-600'
                        )}>
                          Higher costs
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? option.iconColor : 'bg-gray-400'
                        )} />
                        <span className={cn(
                          isSelected ? option.textColor.replace('-700', '-600') : 'text-gray-600'
                        )}>
                          Slower optimization
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    className={cn(
                      'absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br',
                      option.color
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          <span className="font-medium">Note:</span> Rankings and comparisons are calculated separately for each provider type to ensure fair evaluation.
        </p>
      </div>
    </div>
  );
};
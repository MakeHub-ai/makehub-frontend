import React from 'react';
import type { Model } from '@/types/models';
import { ModelCard } from './ModelCard';
import { getModelStats } from '@/utils/modelUtils';
import { motion } from 'framer-motion';
import Image from 'next/image';

type ModelSectionProps = {
  title: string;
  models: Model[];
  allModels: Model[];  // All models for calculating stats
  onSelectModel: (model: Model) => void;
};

export function ModelSection({ title, models, allModels, onSelectModel }: ModelSectionProps) {
  const modelStats = getModelStats(allModels);
  const logoPath = `/model_logo/${title.toLowerCase()}.webp`;
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="mb-20"
      variants={sectionVariants}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-1.5 border border-blue-100 shadow-sm">
            <Image
              src={logoPath}
              alt={title}
              width={28}
              height={28}
              className="rounded-full object-contain"
              onError={(e: any) => {
                e.target.src = '/model_logo/default.webp';
              }}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {title}
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {models.length} model{models.length > 1 ? 's' : ''}
              </span>
            </h2>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model, index) => {
        // Use model.model_id as the key for stats, consistent with getModelStats
        const statsKey = model.model_id;
        // Créer une clé unique qui combine model_id + provider + index
        // If `models` are already unique by model_id, model.model_id would suffice.
        // Keeping uniqueKey as is for now, assuming `models` might not be pre-filtered to unique model_ids.
        const uniqueKey = `${model.model_id}-${model.provider}-${index}`;
        
        return (
          <motion.div
            key={uniqueKey}
            variants={cardVariants}
            layout
            className="group"
            whileHover={{ y: -5 }}
          >
            <ModelCard 
              model={model} 
              stats={modelStats[statsKey]} // Use the correct key for stats
              onSelect={onSelectModel}
            />
          </motion.div>
        );
      })}
      </div>
    </motion.div>
  );
}

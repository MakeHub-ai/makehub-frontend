// FamilySection.tsx
import React from "react";
import type { Family, Model } from "../../types/models";
import { motion } from "framer-motion";
import { Network, Copy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface FamilySectionProps {
  families: Family[];
  models: Model[];
}

export const FamilySection: React.FC<FamilySectionProps> = ({
  families,
  models,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Helper to get brand/provider from family_id
  const getFamilyBrand = (familyId: string) => {
    return familyId.split('/')[0] || 'unknown';
  };

  // Helper to get the common owner of routed models
  const getCommonOwner = (family: Family) => {
    const routedModelIds = family.routing_config.score_ranges.map(range => range.target_model);
    const owners = routedModelIds.map(modelId => modelId.split('/')[0]);
    const uniqueOwners = [...new Set(owners)];
    
    // Return the owner only if all models have the same owner
    return uniqueOwners.length === 1 ? uniqueOwners[0] : null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.section 
      className="mb-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
            <Network className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Model Families</h2>
            <p className="text-gray-600 text-sm">Intelligent routing between models based on task complexity</p>
          </div>
        </div>
        
        <div 
          className="hidden md:flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed group"
          title="Coming soon - Create custom model families with your own routing rules"
        >
          <span>Create your own family</span>
          <span className="text-gray-400">→</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">
            Coming Soon
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {families.map((family) => {
          const brand = getFamilyBrand(family.family_id);
          const commonOwner = getCommonOwner(family);
          const logoPath = commonOwner ? `/model_logo/${commonOwner.toLowerCase()}.webp` : null;
          
          return (
            <motion.div
              key={family.family_id}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              {/* Brand indicator and logo */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {logoPath && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-1 border border-blue-100 shadow-sm">
                    <Image
                      src={logoPath}
                      alt={commonOwner || brand}
                      width={24}
                      height={24}
                      className="rounded-full object-contain"
                      onError={(e: any) => {
                        e.target.src = '/model_logo/default.webp';
                      }}
                    />
                  </div>
                )}
                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                  {brand}
                </div>
              </div>
              
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{family.display_name}</h3>
                  </div>
                  {family.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">{family.description}</p>
                  )}
                </div>

                {/* Family ID */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {family.family_id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(family.family_id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                      title="Copy family ID"
                    >
                      <Copy className={`h-3 w-3 ${copiedId === family.family_id ? 'text-green-600' : 'text-gray-400'}`} />
                    </button>
                    {copiedId === family.family_id && (
                      <span className="text-xs text-green-600 font-medium">Copied!</span>
                    )}
                  </div>
                </div>

                {/* Routing info */}
                <div className="space-y-2 mb-4">
                  {family.routing_config.score_ranges
                    .sort((a, b) => b.max_score - a.max_score) // Tri par score décroissant
                    .map((range, idx) => {
                      // Get the display name for the target model
                      const targetModel = models.find(m => m.model_id === range.target_model);
                      const modelDisplayName = targetModel?.display_name || range.target_model.split('/').pop();
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{modelDisplayName}</div>
                            <div className="text-xs text-gray-500">
                              Score: {range.min_score}-{range.max_score}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};
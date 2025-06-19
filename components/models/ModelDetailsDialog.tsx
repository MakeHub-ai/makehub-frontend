import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building, Cpu, FileText, DollarSign, Copy, Check, BookOpen, Hash, X, ExternalLink, Server } from 'lucide-react';
import type { Model } from '@/types/models';
import { groupByBaseModel } from '@/utils/modelUtils';
import { motion, AnimatePresence } from 'framer-motion';

type ModelDetailsDialogProps = {
  model: Model | null;
  isOpen: boolean;
  onClose: () => void;
  allModels?: Model[];
};

export function ModelDetailsDialog({ model, isOpen, onClose, allModels = [] }: ModelDetailsDialogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  if (!model) return null;

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const modelOrganisation = model.model_id ? model.model_id.split('/')[0] : 'unknown';

  // Format quantization
  const formatQuantization = (quant: string | number | null | undefined): string | null => {
    if (quant === null || quant === undefined) return null;
    
    if (typeof quant === 'number') {
      return `FP${quant}`;
    }
    
    // If it's already a string
    const quantStr = String(quant).toUpperCase();
    // Add FP prefix if needed
    return quantStr.startsWith('FP') ? quantStr : `FP${quantStr}`;
  };

  const logoPath = `/model_logo/${modelOrganisation.toLowerCase()}.webp`;
  
  // Get all variants of the current model using its model_id
  const variants = allModels.filter(m => m.model_id === model.model_id);

  // The baseModelId is simply the model_id of the selected model
  const baseModelId = model.model_id;

  // Group by quantization
  const quantizationGroups: Record<string, Model[]> = {};
  variants.forEach(variant => {
    const quantization = formatQuantization(variant.quantisation) || "NO_QUANT";
    if (!quantizationGroups[quantization]) {
      quantizationGroups[quantization] = [];
    }
    quantizationGroups[quantization].push(variant);
  });

  // Group by provider
  const providerGroups = variants.reduce((acc, variant) => {
    if (!acc[variant.provider]) {
      acc[variant.provider] = [];
    }
    acc[variant.provider].push(variant);
    return acc;
  }, {} as Record<string, Model[]>);

  
  // Vérifier les clés de quantization
  const quantKeys = Object.keys(quantizationGroups);
  
  // Vérifier les clés de providers
  const providerKeys = Object.keys(providerGroups);
  
  // Vérifier les clés des variants dans chaque provider
  Object.entries(providerGroups).forEach(([providerName, providerModels]) => {
    const variantKeys = providerModels.map((variant, index) => 
      variant.provider_model_id || `${variant.model_id}-${String(variant.quantisation)}-${index}`
    );
    const duplicateVariantKeys = variantKeys.filter((key, index) => variantKeys.indexOf(key) !== index);
    
  });

  const formatTokenCount = (kValue: number | undefined | null): string => {
    if (kValue === undefined || kValue === null) return 'N/A';
    if (kValue >= 1000) { // e.g. 1000k = 1M
        return `${(kValue / 1000).toLocaleString()}M tokens`;
    }
    return `${kValue.toLocaleString()}k tokens`;
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Get representative model_id for a specific quantization
  const getModelIdForQuantization = (quantization: string): string | null => {
    const models = quantizationGroups[quantization];
    if (!models || models.length === 0) return null;
    return models[0].model_id;
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-4xl bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto p-0 rounded-xl">
            <DialogHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-6 pt-6 pb-4 border-b border-gray-100">
              <DialogTitle className="sr-only">
                {`${model.model_name} Model Details`}
              </DialogTitle>
              <div className="absolute right-4 top-4">
                <motion.button 
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full w-8 h-8 transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
              
              <motion.div 
                className="flex items-center gap-4 mb-6 flex-wrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 flex items-center justify-center p-1.5 shadow-sm"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" as const }}
                >
                  <div className="relative w-9 h-9">
                    <Image
                      src={logoPath}
                      alt={modelOrganisation}
                      width={36}
                      height={36}
                      className="rounded-full object-contain"
                      onError={(e: any) => {
                        e.target.src = '/model_logo/default.webp';
                      }}
                    />
                  </div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold truncate">{model.model_name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <Building className="h-3.5 w-3.5" />
                    {modelOrganisation}
                  </p>
                </div>
                <Link 
                  href="/docs" 
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 py-1.5 px-3 rounded-full transition-colors shadow-sm border border-blue-100"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>View Documentation</span>
                </Link>
              </motion.div>
              
            </DialogHeader>

            <motion.div className="px-6 py-4" initial="hidden" animate="visible" variants={fadeIn}>
              <AnimatePresence>
                {/* Model IDs Section */}
                <motion.div 
                  key="model-ids"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mb-8"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available Model IDs by Quantization</h3>
                  </div>
                  
                  {/* Section for model IDs by quantization */}
                  <div className="space-y-3">
                    {Object.entries(quantizationGroups).map(([quantization, models], index) => {
                      const modelId = getModelIdForQuantization(quantization);
                      if (!modelId || quantization === "NO_QUANT") return null;
                      
                      // SOLUTION: Créer une clé unique pour les quantizations
                      const quantKey = `quant-${quantization}-${index}-${modelId}`;
                      
                      return (
                        <motion.div 
                          key={quantKey}  // Clé unique
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex-1 flex items-center gap-2 bg-white rounded-l-lg p-3 border border-gray-200">
                            <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium mr-2
                              ${quantization === "FP16"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/70" 
                                : quantization === "FP8"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200/70"
                                  : "bg-gray-50 text-gray-700 border border-gray-200/70"
                              }`}
                            >
                              {quantization}
                            </span>
                            <div className="text-sm font-mono text-gray-700 overflow-x-auto">{modelId}</div>
                          </div>
                          <motion.button 
                            onClick={() => handleCopyId(modelId)}
                            className="px-3 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-r-lg transition-colors"
                            aria-label={`Copy ID for ${quantization}`}
                            whileHover={{ backgroundColor: '#e5e7eb' }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {copiedId === modelId ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </motion.button>
                        </motion.div>
                      );
                    })}
                    
                    {/* Show models without specified quantization */}
                    {quantizationGroups["NO_QUANT"] && quantizationGroups["NO_QUANT"].length > 0 && (
                      <motion.div 
                        key="no-quant-section"  // Clé unique
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex-1 flex items-center gap-2 bg-white rounded-l-lg p-3 border border-gray-200">
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium mr-2 bg-gray-50 text-gray-700 border border-gray-200/70">
                            Standard
                          </span>
                          <div className="text-sm font-mono text-gray-700 overflow-x-auto">
                            {quantizationGroups["NO_QUANT"][0].model_id}
                          </div>
                        </div>
                        <motion.button 
                          onClick={() => handleCopyId(quantizationGroups["NO_QUANT"][0].model_id)}
                          className="px-3 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-r-lg transition-colors"
                          aria-label="Copy ID"
                          whileHover={{ backgroundColor: '#e5e7eb' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copiedId === quantizationGroups["NO_QUANT"][0].model_id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </div>

                </motion.div>

                {/* Providers Section */}
                <motion.div 
                  key="providers" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 mt-8"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available Providers ({Object.keys(providerGroups).length})</h3>
                  </div>
                    {/* List of providers */}
                    <div className="grid gap-6">
                      {Object.entries(providerGroups).map(([providerName, providerModels], index) => {
                        const providerLogoPath = `/model_logo/${providerName.toLowerCase()}.webp`;
                        
                        // SOLUTION: Clé unique pour les providers
                        const providerKey = `provider-${providerName}-${index}`;
                        
                        return (
                          <motion.div 
                            key={providerKey}  // Clé unique
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                          >
                            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white rounded-t-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100">
                                  <div className="relative w-7 h-7">
                                    <Image
                                      src={providerLogoPath}
                                      alt={providerName}
                                      width={28}
                                      height={28}
                                      className="rounded-full object-contain"
                                      onError={(e: any) => {
                                        e.target.src = '/model_logo/default.webp';
                                      }}
                                    />
                                  </div>
                                </div>
                                <h4 className="font-medium text-gray-900">{capitalizeFirstLetter(providerName)}</h4>
                              </div>
                            </div>

                            {/* List of variants for this provider */}
                            <div className="divide-y divide-gray-50">
                              {providerModels.map((variant, variantIndex) => {
                                // SOLUTION: Clé garantie unique pour les variants
                                const variantKey = `${providerKey}-variant-${variantIndex}-${variant.model_id || 'unknown'}-${variant.quantisation || 'no-quant'}`;
                                
                                return (
                                  <motion.div 
                                    key={variantKey}  // Clé garantie unique
                                    className="p-4 hover:bg-blue-50/20 transition-colors"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 + variantIndex * 0.05 }}
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      {/* Quantization - only show if present */}
                                      <div className="flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        {formatQuantization(variant.quantisation) ? (
                                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium
                                            ${formatQuantization(variant.quantisation)?.includes("16")
                                              ? "bg-blue-50 text-blue-700 border border-blue-200/70" 
                                              : "bg-purple-50 text-purple-700 border border-purple-200/70"
                                            }`}
                                          >
                                            {formatQuantization(variant.quantisation)}
                                          </span>
                                        ) : (
                                          <span className="text-sm text-gray-600">Standard</span>
                                        )}
                                      </div>

                                      {/* Price */}
                                      <div className="flex items-start gap-2">
                                        <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex flex-col text-sm">
                                          <span className="text-gray-600 whitespace-nowrap">Input: {variant.price_per_input_token}$/1M</span>
                                          <span className="text-gray-600 whitespace-nowrap">Output: {variant.price_per_output_token}$/1M</span>
                                        </div>
                                      </div>

                                      {/* Context */}
                                      {variant.context !== undefined && variant.context !== null && (
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                          <span className="text-sm text-gray-600 whitespace-nowrap">{formatTokenCount(variant.context)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
              </AnimatePresence>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

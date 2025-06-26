'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import type { Model, Family } from '@/types/models';
import { groupModelsByBase, sortProviders, sortModelsByProviderCount, sortOrganizationsByAverageProviders } from '@/utils/modelUtils';
import { ModelSection } from '@/components/models/ModelSection';
import { ModelDetailsDialog } from '@/components/models/ModelDetailsDialog';
import { FamilySection } from '@/components/models/FamilySection';
import { FamilyDetailsDialog } from '@/components/models/FamilyDetailsDialog';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const getModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/models');
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || `HTTP error! status: ${response.status}`);
        } else {
          const data = await response.json();
          console.log('[Family Debug] Fetched /api/models response:', data);
          setModels(data.models || []);
          setFamilies(data.families || []);
        }
      } catch (err) {
        setError('Failed to fetch models');
      } finally {
        // Add a small delay for skeleton animation to be visible
        setTimeout(() => setLoading(false), 800);
      }
    };

    // Debug: log families state on update

    getModels();
  }, []);

  useEffect(() => {
    console.log('[Family Debug] families state after fetch:', families);
  }, [families]);

  const groupModelsByOrganization = useCallback((allModels: Model[]) => {
    
    const groups: { [key: string]: Model[] } = {};
    
    allModels.forEach((model, index) => {
      const organization = model.model_id ? model.model_id.split('/')[0] : 'unknown';
      if (!groups[organization]) {
        groups[organization] = [];
      }
      
      // DEBUG: Log chaque modèle traité
      
      // Vérification plus robuste des duplicatas
      const existingModelWithSameId = groups[organization].find(m => m.model_id === model.model_id);
      
      if (!existingModelWithSameId) {
        groups[organization].push(model);
      } else {
      }
    });
    
    // DEBUG: Vérifier s'il y a encore des duplicatas après déduplication
    Object.entries(groups).forEach(([org, orgModels]) => {
      const modelIds = orgModels.map(m => m.model_id);
      const duplicateIds = modelIds.filter((id, index) => modelIds.indexOf(id) !== index);
      
      if (duplicateIds.length > 0) {
        console.error(`🚨 DUPLICATE KEYS FOUND IN ${org}:`, duplicateIds);
        console.error('Models in this group:', orgModels);
      } else {
      }
    });
    
    return groups;
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const ModelsSkeleton = () => (
    <div className="space-y-16">
      {/* FamilySection Skeleton */}
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-32 w-full bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
      {[1, 2].map((section) => (
        <div key={section} className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((card) => (
              <div
                key={card}
                className="h-[160px] bg-gray-100 rounded-xl animate-pulse"
                style={{ animationDelay: `${card * 0.1}s` }}
              >
                <div className="h-full p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh] text-red-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="p-6 bg-red-50 rounded-xl border border-red-200 flex flex-col items-center">
          <svg className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load models</h3>
          <p className="text-red-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  const filteredModels = models.filter(model => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase().trim();
    
    // Champs à rechercher
    const searchFields = [
      model.model_name || '',
      model.display_name || '',
      model.provider || '',
      model.model_id || '',
      // Parties séparées du model_id pour recherche flexible
      ...(model.model_id ? model.model_id.split('/') : [])
    ];
    
    // Recherche dans tous les champs
    return searchFields.some(field => 
      field.toLowerCase().includes(search)
    );
  });


  const groupedModels = groupModelsByOrganization(filteredModels);
  
  const organizationsWithSortedModels: [string, Model[]][] = Object.entries(groupedModels).map(([org, orgModels]) => [
    org,
    sortModelsByProviderCount(orgModels, filteredModels)
  ]);
  
  const sortedOrganizations = sortOrganizationsByAverageProviders(
    organizationsWithSortedModels,
    filteredModels
  );

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {families && families.length > 0 && (
          <FamilySection
            families={families}
            models={models}
          />
        )}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Model Hub</h1>
            <p className="mt-2 text-gray-600">
              Browse our collection of AI models from various providers
            </p>
          </div>
          
          <div className={`relative w-full md:w-72 transition-all duration-300 ${searchFocused ? 'md:w-80' : ''}`}>
            <motion.div 
              className={`flex items-center w-full relative rounded-xl overflow-hidden
                        transition-shadow duration-200
                        ${searchFocused ? 'ring-2 ring-blue-500/50 shadow-lg' : 'shadow-sm'}`}
              whileTap={{ scale: 0.995 }}
            >
              <input
                type="text"
                placeholder="Search models..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border-0
                        placeholder:text-slate-400 rounded-xl
                        focus:outline-none"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <Search className={`h-4 w-4 absolute left-3.5 top-1/2 transform -translate-y-1/2
                              transition-colors duration-200 ${searchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
              
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
            
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-1.5 text-xs text-gray-500"
              >
                Found {filteredModels.length} models
              </motion.div>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ModelsSkeleton />
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              className="px-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {sortedOrganizations.length > 0 ? (
                sortedOrganizations.map(([organization, orgModels]) => {
                  // Grouper par display_name à l'intérieur de chaque organisation
                  // Regrouper tous les modèles de l'organisation par display_name (sans déduplication par model_id)
                  const displayNameGroups: { [key: string]: Model[] } = {};
                  // On prend tous les modèles de l'organisation dans filteredModels
                  filteredModels
                    .filter(m => {
                      const org = m.model_id ? m.model_id.split('/')[0] : 'unknown';
                      return org === organization && !!m.display_name;
                    })
                    .forEach((model) => {
                      // TypeScript: display_name is guaranteed non-null due to filter above
                      const displayName = model.display_name!;
                      if (!displayNameGroups[displayName]) {
                        displayNameGroups[displayName] = [];
                      }
                      displayNameGroups[displayName].push(model);
                    });

                  return (
                    <ModelSection
                      key={organization}
                      title={capitalizeFirstLetter(organization)}
                      models={
                        Object.entries(displayNameGroups).map(([displayName, models]) => ({
                          display_name: displayName,
                          models,
                          // Pour compatibilité descendante, on garde le premier model comme "model" (sans redéfinir display_name)
                          ...Object.fromEntries(Object.entries(models[0]).filter(([k]) => k !== "display_name")),
                        })) as any
                      }
                      allModels={filteredModels}
                      onSelectModel={setSelectedModel}
                    />
                  );
                })
              ) : (
                <motion.div 
                  className="flex flex-col items-center justify-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No models found</h3>
                  <p className="text-gray-500 text-center mb-4">
                    We couldn't find any models matching "{searchTerm}"
                  </p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <ModelDetailsDialog 
          model={selectedModel}
          isOpen={!!selectedModel}
          onClose={() => setSelectedModel(null)}
          allModels={filteredModels}
        />
        
        <FamilyDetailsDialog
          family={selectedFamily}
          models={models}
          isOpen={familyDialogOpen}
          onClose={() => {
            setFamilyDialogOpen(false);
            setSelectedFamily(null);
          }}
        />
      </div>
    </div>
  );
}

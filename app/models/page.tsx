'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import type { Model } from '@/types/models';
import { fetchModels } from '@/lib/makehub-client';
import { groupModelsByBase, sortProviders, sortModelsByProviderCount, sortOrganizationsByAverageProviders } from '@/utils/modelUtils';
import { ModelSection } from '@/components/models/ModelSection';
import { ModelDetailsDialog } from '@/components/models/ModelDetailsDialog';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const getModels = async () => {
      try {
        setLoading(true);
        const response = await fetchModels();
        if (response.error) {
          setError(response.error);
        } else {
          console.log('Fetched models:', response.data);
          setModels(response.data);
        }
      } catch (err) {
        setError('Failed to fetch models');
      } finally {
        // Add a small delay for skeleton animation to be visible
        setTimeout(() => setLoading(false), 800);
      }
    };

    getModels();
  }, []);

  const groupModelsByOrganization = useCallback((allModels: Model[]) => {
    const groups: { [key: string]: Model[] } = {};
    
    // Take one representative per model for each organization
    allModels.forEach(model => {
      const organization = model.organisation || 'unknown';
      if (!groups[organization]) {
        groups[organization] = [];
      }
      
      // Check if a model with the same name already exists
      const existingModel = groups[organization].find(m => m.model_name === model.model_name);
      if (!existingModel) {
        groups[organization].push(model);
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

  // Skeleton loader component
  const ModelsSkeleton = () => (
    <div className="space-y-16">
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

  const filteredModels = models.filter(model => 
    model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.organisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedModels = groupModelsByOrganization(filteredModels);
  
  // Sort models in each group by number of providers
  const organizationsWithSortedModels: [string, Model[]][] = Object.entries(groupedModels).map(([org, orgModels]) => [
    org,
    sortModelsByProviderCount(orgModels, filteredModels)
  ]);
  
  // Sort organizations by average number of providers
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
                sortedOrganizations.map(([organization, models]) => (
                  <ModelSection
                    key={organization}
                    title={capitalizeFirstLetter(organization)}
                    models={models.map(model => ({
                      ...model,
                      // Add ID for anchor
                      elementId: `${model.organisation.toLowerCase()}-${model.model_name.toLowerCase()}`.replace(/\s+/g, '-')
                    }))}
                    allModels={filteredModels}
                    onSelectModel={setSelectedModel}
                  />
                ))
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
      </div>
    </div>
  );
}

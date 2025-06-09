import type { Model } from '@/types/models';

export function getBaseModelName(modelId: string): string {
  // Retire le suffixe -fp* du nom du modèle
  return modelId.replace(/-fp\d+$/, '');
}

export function getQuantisationLevel(modelId: string): string | null {
  const match = modelId.match(/-fp(\d+)$/);
  return match ? match[1] : null;
}

export function cleanModelName(name: string): string {
  // Retire le suffixe -fpX du nom affiché
  return name.replace(/-fp\d+$/, '');
}

export function getProviderFromId(modelId: string): string {
  const parts = modelId.split('/');
  return parts.length > 1 ? parts[0].toLowerCase() : modelId.toLowerCase();
}

export function groupModelsByBase(models: Model[]): Model[] {
  // Group models by model_id and take the first one as representative
  const modelGroups = new Map<string, Model[]>();
  
  models.forEach(model => {
    const baseKey = model.model_id; // Use model_id as the base key
    if (!modelGroups.has(baseKey)) {
      modelGroups.set(baseKey, []);
    }
    modelGroups.get(baseKey)?.push(model);
  });

  // Take the first model from each group as representative
  return Array.from(modelGroups.values()).map(group => group[0]);
}

// Fonction mise à jour pour utiliser le groupement par modèle/provider
export function calculateAverageProviders(models: Model[]): number {
  const uniqueProviders = new Set(models.map(model => model.provider));
  return uniqueProviders.size / models.length;
}

export function groupModelsByProvider(models: Model[]) {
  return models.reduce((groups: { [key: string]: Model[] }, model) => {
    if (!groups[model.provider]) {
      groups[model.provider] = [];
    }
    groups[model.provider].push(model);
    return groups;
  }, {});
}

export function groupByBaseModel(models: Model[]) {
  // Group models by model_id
  return models.reduce((groups: { [key: string]: Model[] }, model) => {
    const baseKey = model.model_id; // Use model_id as the base key
    if (!groups[baseKey]) {
      groups[baseKey] = [];
    }
    groups[baseKey].push(model);
    return groups;
  }, {});
}

export function sortProviders(groupedModels: { [key: string]: Model[] }): [string, Model[]][] {
  return Object.entries(groupedModels)
    .sort(([a, modelsA], [b, modelsB]) => {
      // Trier par nombre de modèles
      return modelsB.length - modelsA.length || a.localeCompare(b);
    });
}

// Supprimer l'ancienne version de getModelStats et garder uniquement celle-ci
export function getModelStats(allModels: Model[]) {
  const stats: Record<string, { providers: number; quantisations: ("fp8" | "fp16")[] }> = {};
  
  allModels.forEach(model => {
    const baseKey = model.model_id; // Use model_id as the base key
    
    if (!stats[baseKey]) {
      // Find all variants for this model_id
      const variants = allModels.filter(m => m.model_id === baseKey);
      
      const uniqueProviders = new Set(variants.map(m => m.provider));
      const uniqueQuantisations = new Set(
        variants
          .map(m => m.quantisation)
          .filter((q): q is "fp8" | "fp16" => q !== null) // Ensure only valid quantisation values are included
      );
      
      stats[baseKey] = {
        providers: uniqueProviders.size,
        quantisations: Array.from(uniqueQuantisations),
      };
    }
  });
  
  return stats;
}

export function sortModelsByProviderCount(models: Model[], allModels: Model[] = []): Model[] {
  // Use allModels if provided, otherwise use models
  const modelPool = allModels.length > 0 ? allModels : models;
  const providerCounts = new Map<string, number>();

  // Calculate provider counts for each unique model_id
  const uniqueModelIds = new Set(models.map(m => m.model_id));
  
  uniqueModelIds.forEach(modelId => {
    const variants = modelPool.filter(m => m.model_id === modelId);
    const uniqueProviders = new Set(variants.map(m => m.provider));
    providerCounts.set(modelId, uniqueProviders.size);
  });
  
  return [...models].sort((a, b) => {
    const aCount = providerCounts.get(a.model_id) || 0;
    const bCount = providerCounts.get(b.model_id) || 0;
    
    if (bCount !== aCount) {
      return bCount - aCount;
    }
    // If provider counts are equal, sort by display_name
    return (a.display_name || a.model_name || '').localeCompare(b.display_name || b.model_name || '');
  });
}

export function calculateAverageProvidersForOrganization(models: Model[], allModels: Model[]): number {
  if (models.length === 0) return 0;

  // Get unique model_ids within the organization's models
  const uniqueModelIdsInOrg = Array.from(new Set(models.map(model => model.model_id)));
  
  if (uniqueModelIdsInOrg.length === 0) return 0;

  let totalProvidersForUniqueModels = 0;
  
  uniqueModelIdsInOrg.forEach(modelId => {
    // Find all variants for this model_id in the global pool
    const variants = allModels.filter(m => m.model_id === modelId);
    const providersCount = new Set(variants.map(m => m.provider)).size;
    totalProvidersForUniqueModels += providersCount;
  });
  
  return totalProvidersForUniqueModels / uniqueModelIdsInOrg.length;
}

export function sortOrganizationsByAverageProviders(
  organizations: [string, Model[]][], 
  allModels: Model[]
): [string, Model[]][] {
  return [...organizations].sort(([orgA, modelsA], [orgB, modelsB]) => {
    const avgA = calculateAverageProvidersForOrganization(modelsA, allModels);
    const avgB = calculateAverageProvidersForOrganization(modelsB, allModels);
    return avgB - avgA || orgA.localeCompare(orgB);
  });
}

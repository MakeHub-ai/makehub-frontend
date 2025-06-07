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
  // Groupe d'abord par nom de base
  const modelGroups = new Map<string, Model[]>();
  
  models.forEach(model => {
    const baseKey = `${model.organisation}/${model.model_name}`;
    if (!modelGroups.has(baseKey)) {
      modelGroups.set(baseKey, []);
    }
    modelGroups.get(baseKey)?.push(model);
  });

  // Prend le premier modèle de chaque groupe comme représentant
  return Array.from(modelGroups.values()).map(group => group[0]);
}

// Fonction mise à jour pour utiliser le groupement par modèle/provider
export function calculateAverageProviders(models: Model[]): number {
  const uniqueProviders = new Set(models.map(model => model.provider_name));
  return uniqueProviders.size / models.length;
}

export function groupModelsByProvider(models: Model[]) {
  return models.reduce((groups: { [key: string]: Model[] }, model) => {
    if (!groups[model.provider_name]) {
      groups[model.provider_name] = [];
    }
    groups[model.provider_name].push(model);
    return groups;
  }, {});
}

export function groupByBaseModel(models: Model[]) {
  return models.reduce((groups: { [key: string]: Model[] }, model) => {
    const baseKey = `${model.organisation}/${model.model_name}`;
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
    const baseKey = `${model.organisation}/${model.model_name}`;
    
    if (!stats[baseKey]) {
      const variants = allModels.filter(m => 
        m.organisation === model.organisation && 
        m.model_name === model.model_name
      );
      
      const uniqueProviders = new Set(variants.map(m => m.provider_name));
      const uniqueQuantisations = new Set(
        variants
          .map(m => m.quantisation)
          .filter((q): q is "fp8" | "fp16" => q !== null)
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
  // Utiliser allModels s'il est fourni, sinon utiliser models
  const modelPool = allModels.length > 0 ? allModels : models;
  const providerCounts = new Map<string, number>();
  
  models.forEach(model => {
    const variants = modelPool.filter(m => 
      m.organisation === model.organisation && 
      m.model_name === model.model_name
    );
    const uniqueProviders = new Set(variants.map(m => m.provider_name));
    providerCounts.set(`${model.organisation}/${model.model_name}`, uniqueProviders.size);
  });
  
  return [...models].sort((a, b) => {
    const aKey = `${a.organisation}/${a.model_name}`;
    const bKey = `${b.organisation}/${b.model_name}`;
    const aCount = providerCounts.get(aKey) || 0;
    const bCount = providerCounts.get(bKey) || 0;
    return bCount - aCount || a.model_name.localeCompare(b.model_name);
  });
}

export function calculateAverageProvidersForOrganization(models: Model[], allModels: Model[]): number {
  if (models.length === 0) return 0;
  
  let totalProviders = 0;
  models.forEach(model => {
    const variants = allModels.filter(m => 
      m.organisation === model.organisation && 
      m.model_name === model.model_name
    );
    const providersCount = new Set(variants.map(m => m.provider_name)).size;
    totalProviders += providersCount;
  });
  
  return totalProviders / models.length;
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

'use client';

import { useEffect, useState } from 'react';
import ProviderSection from '../../components/health-metrics/ProviderSection';
import ModelMetricsCard from '../../components/health-metrics/ModelMetricsCard';
import ModelSection from '../../components/health-metrics/ModelSection';
import ProviderMetricsCard from '../../components/health-metrics/ProviderMetricsCard';
import ViewToggle from '../../components/health-metrics/ViewToggle';
import { Loader2 } from 'lucide-react';

interface Model {
  model_name: string;
  model_id: string;
  provider_name: string;
  organisation: string;
  price_per_output_token: number;
  price_per_input_token: number;
  quantisation: "fp8" | "fp16" | null;
  context: number;
}

interface MetricsResponse {
  avg_latency_120min_ms: number;
  avg_throughput_120min_tokens_per_second: number;
  dt_since_last_measurement_ms: number;
  last_latency_ms: number;
  last_throughput_tokens_per_second: number;
  latency_variance_120min_ms: number;
  rtt_from_makehub_ms: number | null;
  throughput_variance_120min_tokens_per_second: number;
}

interface ModelMetrics {
  modelName: string;
  provider: string;
  lastUpdated: number;
  status: 'loading' | 'error' | 'success';
  data?: {
    metrics?: MetricsResponse | null;
    error?: string;
    [key: string]: any; // Allow for placeholder or other temporary data
  };
}

interface MetricsState {
  [providerName: string]: {
    [modelId: string]: ModelMetrics;
  };
}

const API_KEY = 'Bearer sk_V0g2VVK6o_zmuwlLsiLeBfquWsOA6L2F0ZWdJ487JFQ';
const BASE_URL = 'https://api.makehub.ai/v1';

export default function HealthMetricsPage() {
  const [metrics, setMetrics] = useState<MetricsState>({});
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isModelView, setIsModelView] = useState(false);

  // Charger les modèles
  useEffect(() => {
    async function loadModels() {
      setIsLoadingModels(true);
      setModelsError(null);
      try {
        // Étape 1 : Charger la liste des modèles
        const modelRes = await fetch(`${BASE_URL}/models?details_provider=true`, {
          headers: {
            Authorization: API_KEY,
          },
        });
        
        if (!modelRes.ok) {
          throw new Error(`API responded with status ${modelRes.status}`);
        }
        
        const modelJson = await modelRes.json();
        const fetchedModels: Model[] = modelJson.data;
        setModels(fetchedModels);

        // Initialiser l'état des métriques avec des données temporaires
        const initialMetrics: MetricsState = {};
        fetchedModels.forEach(model => {
          if (!initialMetrics[model.provider_name]) {
            initialMetrics[model.provider_name] = {};
          }
          initialMetrics[model.provider_name][model.model_id] = {
            modelName: model.model_name,
            provider: model.provider_name,
            lastUpdated: Date.now(),
            status: 'loading',
          };
        });
        setMetrics(initialMetrics);
      } catch (e: any) {
        console.error('Failed to load models', e);
        setModelsError(e.message || 'Failed to load models.');
      } finally {
        setIsLoadingModels(false);
      }
    }

    loadModels();
  }, []);

  // Charger les métriques une fois que les modèles sont disponibles
  useEffect(() => {
    async function loadMetrics() {
      if (models.length === 0 || isLoadingModels) return;
      
      setIsLoadingMetrics(true);
      
      try {
        // Étape 2 : Préparer le lot de requêtes pour l'API batch
        const batchRequests = models.map(model => ({
          model_id: model.model_id,
          provider_id: model.provider_name,
          n_last_minutes: 120
        }));

        // Étape 3 : Appeler l'API batch pour obtenir toutes les métriques en une seule requête
        const metricsResponse = await fetch(`${BASE_URL}/metrics/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
          },
          body: JSON.stringify(batchRequests)
        });

        if (!metricsResponse.ok) {
          throw new Error(`API responded with status ${metricsResponse.status}`);
        }

        const metricsData = await metricsResponse.json();
        
        // Étape 4 : Traiter la réponse batch et mettre à jour l'état des métriques
        setMetrics(prevMetrics => {
          const updatedMetrics = { ...prevMetrics };
          
          if (metricsData.data) {
            // Pour chaque provider dans la réponse
            Object.entries(metricsData.data).forEach(([providerName, providerData]: [string, any]) => {
              // Pour chaque modèle dans ce provider
              Object.entries(providerData).forEach(([modelId, modelMetrics]: [string, any]) => {
                if (updatedMetrics[providerName] && updatedMetrics[providerName][modelId]) {
                  // Vérifier si nous avons une erreur ou des métriques valides
                  if (modelMetrics.error) {
                    updatedMetrics[providerName][modelId] = {
                      ...updatedMetrics[providerName][modelId],
                      lastUpdated: Date.now(),
                      status: 'error',
                      data: { error: modelMetrics.error }
                    };
                  } else {
                    updatedMetrics[providerName][modelId] = {
                      ...updatedMetrics[providerName][modelId],
                      lastUpdated: Date.now(),
                      status: 'success',
                      data: { metrics: modelMetrics }
                    };
                  }
                }
              });
            });
          }
          
          return updatedMetrics;
        });
        
      } catch (err: any) {
        console.error('Failed to fetch metrics in batch', err);
        
        // En cas d'échec de l'API batch, marquer tous les modèles en erreur
        setMetrics(prevMetrics => {
          const errorMetrics = { ...prevMetrics };
          Object.keys(errorMetrics).forEach(provider => {
            Object.keys(errorMetrics[provider]).forEach(modelId => {
              errorMetrics[provider][modelId] = {
                ...errorMetrics[provider][modelId],
                status: 'error',
                data: { error: err.message || 'Failed to fetch metrics in batch' }
              };
            });
          });
          
          return errorMetrics;
        });
      } finally {
        setIsLoadingMetrics(false);
      }
    }

    loadMetrics();
  }, [models, isLoadingModels]);

  // Group models by provider for rendering
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider_name]) {
      acc[model.provider_name] = [];
    }
    acc[model.provider_name].push(model);
    return acc;
  }, {} as { [provider: string]: Model[] });

  // Group providers by model name for inverted view
  const providersByModel = models.reduce((acc, model) => {
    if (!acc[model.model_name]) {
      acc[model.model_name] = [];
    }
    acc[model.model_name].push(model);
    return acc;
  }, {} as { [modelName: string]: Model[] });

  const totalProviders = Object.keys(modelsByProvider).length;
  const totalEndpoints = models.length;
  const uniqueModelNames = new Set(models.map(model => model.model_name));
  const totalUniqueModels = uniqueModelNames.size;

  return (
    <div className="p-4 pt-24 container mx-auto font-mono">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Model Health Metrics {!isLoadingModels && `(${totalProviders} Providers, ${totalUniqueModels} Models, ${totalEndpoints} Endpoints)`}
      </h1>
      
      <div className="mb-6 p-4 border rounded bg-gray-100 text-sm">
        <p className="mb-2">This page displays health metrics for various models fetched from the API. Each section represents a provider, and expanding a section shows the metrics for the models offered by that provider.</p>
        <p className="font-semibold">Color Key:</p>
        <ul className="list-disc list-inside">
          <li><span className="font-bold text-green-700">Green:</span> All models from this provider are reporting metrics successfully.</li>
          <li><span className="font-bold text-red-700">Red:</span> At least one model from this provider encountered an error fetching metrics.</li>
          <li><span className="font-bold text-gray-700">Gray:</span> Metrics are currently loading or the status is unknown.</li>
        </ul>
      </div>
      
      {/* État de chargement des modèles */}
      {isLoadingModels && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-center text-gray-600 font-medium">Chargement des modèles...</p>
        </div>
      )}
      
      {/* Affichage de l'erreur des modèles */}
      {modelsError && (
        <div className="text-red-500 text-center p-4 border border-red-300 rounded bg-red-50">
          <p className="font-bold mb-2">Erreur de chargement des modèles:</p>
          <p>{modelsError}</p>
        </div>
      )}
      
      {/* Affichage des modèles (même si les métriques sont en cours de chargement) */}
      {!isLoadingModels && !modelsError && (
        <>
          {/* View Toggle */}
          <ViewToggle 
            isModelView={isModelView} 
            onToggle={setIsModelView}
          />
          
          {/* Indicateur de chargement des métriques */}
          {isLoadingMetrics && (
            <div className="flex items-center justify-center mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
              <p className="text-blue-700">Chargement des métriques en cours...</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start grid-auto-rows-auto">
            {!isModelView ? (
              // Provider View (Current)
              Object.entries(modelsByProvider).map(([providerName, providerModels]) => {
                const providerModelStatuses = providerModels.map(model => {
                  const modelMetrics = metrics[providerName]?.[model.model_id];
                  return modelMetrics?.status || 'loading';
                });

                return (
                  <ProviderSection
                    key={providerName}
                    providerName={providerName}
                    modelStatuses={providerModelStatuses}
                    modelCount={providerModels.length}
                  >
                    {providerModels.map(model => {
                      const modelMetrics = metrics[providerName]?.[model.model_id];
                      const companyName = model.model_id.split('/')[0];
                      return (
                        <ModelMetricsCard
                          key={model.model_id}
                          modelId={model.model_id}
                          modelName={model.model_name}
                          provider={model.provider_name}
                          companyName={companyName}
                          status={modelMetrics?.status || 'loading'}
                          data={modelMetrics?.data}
                        />
                      );
                    })}
                  </ProviderSection>
                );
              })
            ) : (
              // Model View (New)
              Object.entries(providersByModel).map(([modelName, modelProviders]) => {
                const modelProviderStatuses = modelProviders.map(model => {
                  const modelMetrics = metrics[model.provider_name]?.[model.model_id];
                  return modelMetrics?.status || 'loading';
                });

                const organization = modelProviders[0]?.organisation;

                return (
                  <ModelSection
                    key={modelName}
                    modelName={modelName}
                    providerStatuses={modelProviderStatuses}
                    providerCount={modelProviders.length}
                    organization={organization}
                  >
                    {modelProviders.map(model => {
                      const modelMetrics = metrics[model.provider_name]?.[model.model_id];
                      return (
                        <ProviderMetricsCard
                          key={`${model.provider_name}-${model.model_id}`}
                          modelId={model.model_id}
                          modelName={model.model_name}
                          provider={model.provider_name}
                          status={modelMetrics?.status || 'loading'}
                          data={modelMetrics?.data}
                        />
                      );
                    })}
                  </ModelSection>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

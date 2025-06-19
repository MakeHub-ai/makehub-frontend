"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ModelCard } from "@/components/models/ModelCard";
import { getModelStats } from "@/utils/modelUtils";
import type { Model } from "@/types/models";

function Case() {
  const [api, setApi] = useState<CarouselApi>();
  const [models, setModels] = useState<Model[]>([]);
  const [modelStats, setModelStats] = useState<Record<string, { providers: number; quantisations: string[] }>>({});
  const [error, setError] = useState<string | null>(null);

  const generateModelUrl = (model: Model) => {
    if (!model.organisation || !model.model_name) {
      // Fallback or return a default URL if data is missing
      return '/models';
    }
    // Créer une ancre avec l'organisation et le nom du modèle
    const anchor = `${model.organisation.toLowerCase()}-${model.model_name.toLowerCase()}`.replace(/\s+/g, '-');
    return `/models#${anchor}`;
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setModels([...shuffled, ...shuffled]);
        // Calculer les statistiques pour tous les modèles
        setModelStats(getModelStats(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 2500);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="w-full pt-6 pb-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-4 overflow-visible">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              skipSnaps: true,
              containScroll: "trimSnaps",
              dragThreshold: 20
            }}
            setApi={setApi}
            className="w-full overflow-visible"
          >
            <CarouselContent className="-ml-2 md:-ml-4 pt-4 pb-6 px-3 gap-1">
              {models.map((model, index) => {
                if (!model.organisation || !model.model_name) return null;
                const modelKey = `${model.organisation}/${model.model_name}`;
                const stats = modelStats[modelKey] || { providers: 0, quantisations: [] };
                return (
                  <CarouselItem 
                    key={index} 
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 overflow-visible mx-1"
                  >
                    <div className="px-2">
                      <ModelCard
                        model={model}
                        stats={stats}
                        href={generateModelUrl(model)}
                        // className="w-full h-[160px] min-w-[320px] shadow-sm hover:shadow-md transition-shadow border border-gray-100 rounded-xl bg-white pt-2 pb-6 px-6 flex flex-col justify-start"
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export { Case };

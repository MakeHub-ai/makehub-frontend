import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Family, Model } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { Network, Zap, Target } from "lucide-react";

interface FamilyDetailsDialogProps {
  family: Family | null;
  models: Model[];
  isOpen: boolean;
  onClose: () => void;
}

export const FamilyDetailsDialog: React.FC<FamilyDetailsDialogProps> = ({
  family,
  models,
  isOpen,
  onClose,
}) => {
  if (!family) return null;

  // Helper to get models used in routing
  const getRoutedModels = (family: Family) => {
    const routedModelIds = new Set([
      ...family.routing_config.score_ranges.map(range => range.target_model),
      family.routing_config.fallback_model
    ]);
    
    return models.filter(model => routedModelIds.has(model.model_id));
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            {family.display_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          {family.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{family.description}</p>
            </div>
          )}

          {/* Routing Rules */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Zap className="h-4 w-4 text-yellow-600" />
              Routing Rules
            </h3>
            <div className="space-y-3">
              {family.routing_config.score_ranges.map((range, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Score {range.min_score}-{range.max_score}
                      </Badge>
                      <span className="text-sm font-medium">
                        {models.find(m => m.model_id === range.target_model)?.display_name || range.target_model}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Routed Models */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Network className="h-4 w-4 text-indigo-600" />
              Models in Routing
            </h3>
            <div className="space-y-2">
              {getRoutedModels(family).length > 0 ? (
                getRoutedModels(family).map((model) => (
                  <div key={model.model_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">{model.display_name || model.model_name}</div>
                      <div className="text-sm text-gray-500">{model.model_id}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {model.provider}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Network className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No models found in routing configuration</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
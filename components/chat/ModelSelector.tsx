"use client"

import * as React from "react"
import { Check, ChevronRight, MessageSquare, ChevronDown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchBar } from "@/components/ui/search-bar"
import { Model } from "@/types/models"
import { fetchModels } from "@/lib/makehub-client" // Updated import
import Image from 'next/image'

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string, model: Model) => void;  // Update to include full model
  onSettingsClick?: () => void;
}

interface GroupedModel {
  model_name: string;
  variants: Model[];
}

export function ModelSelector({ value, onValueChange, onSettingsClick }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [ephemeral, setEphemeral] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [models, setModels] = React.useState<Model[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const getModels = async () => {
      console.log('Fetching models...')
      try {
        const response = await fetchModels()
        console.log('Models fetched:', response)
        if (response.error) throw new Error(response.error)
        setModels(response.data)
        console.log('Models set:', response.data.length, 'models available')
      } catch (err) {
        console.error('Error fetching models:', err)
        setError(err instanceof Error ? err.message : 'Failed to load models')
      } finally {
        setLoading(false)
      }
    }

    getModels()
  }, [])

  const formatPrice = (price: number) => {
    return `$${(price / 1000).toFixed(4)}`
  }

  const formatContext = (context: number) => {
    return context >= 1000 ? `${(context / 1000)}k` : context
  }

  const groupModelsByName = (models: Model[]): GroupedModel[] => {
    const grouped = models.reduce((acc, model) => {
      if (!acc[model.model_name]) {
        acc[model.model_name] = {
          model_name: model.model_name,
          variants: []
        };
      }
      acc[model.model_name].variants.push(model);
      return acc;
    }, {} as Record<string, GroupedModel>);

    return Object.values(grouped);
  };

  const filteredAndGroupedModels = React.useMemo(() => {
    const filtered = models.filter(model =>
      model.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return groupModelsByName(filtered);
  }, [models, searchQuery]);

  if (loading) {
    return <div>Loading models...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  const handleModelSelect = (model: Model) => {
    console.log('Model selected:', model);
    onValueChange(model.model_id, model);
    setOpen(false);
  }

  const generateUniqueKey = (model: Model) => {
    return `${model.model_id}-${model.quantisation || 'default'}-${model.provider_name}`;
  };

  const getSelectedModel = () => {
    return models.find(model => model.model_id === value);
  };

  // Add this function to format the model display name
  const formatModelDisplayName = (modelId: string, model?: Model) => {
    // If we have the full model object, use its name
    if (model) {
      return model.model_name;
    }
    
    // Otherwise, extract from model ID (remove provider prefix)
    if (modelId.includes('/')) {
      return modelId.split('/').pop() || modelId;
    }
    
    return modelId;
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex w-full items-center">
            <Button 
              variant="ghost" 
              role="combobox"
              className="flex-1 justify-between bg-transparent hover:bg-gray-50/50"
            >
              <div className="flex items-center gap-2">
                {getSelectedModel()?.model_name ? (
                  <Image
                    src={`/model_logo/${getSelectedModel()?.organisation}.webp`}
                    alt={getSelectedModel()?.organisation || "AI"}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                ) : (
                  <div className="w-5 h-5 rounded bg-[#0F172A] flex items-center justify-center">
                    <span className="text-[11px] text-white font-medium">AI</span>
                  </div>
                )}
                <span className="text-sm text-gray-700 truncate">
                  {value ? formatModelDisplayName(value, getSelectedModel()) : "Select a model..."}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
              </div>
            </Button>
            <div className="flex items-center">
              <div className="h-4 w-[1px] bg-gray-200" />
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onSettingsClick?.();
                }}
                className="p-1"
              >
                <Settings className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0 shadow-lg rounded-xl" align="start">
          <Command className="rounded-xl">
            <SearchBar 
              placeholder="Search models"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup className="px-2 py-1">
                {filteredAndGroupedModels.map((group) => (
                  <CommandItem
                    key={group.model_name}
                    value={group.model_name}
                    onSelect={() => {
                      const defaultModel = group.variants[0];
                      handleModelSelect(defaultModel);
                    }}
                    className="flex items-center justify-between rounded-lg px-2 py-2.5 aria-selected:bg-gray-100/80 hover:bg-gray-100/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/model_logo/${group.variants[0].organisation}.webp`}
                        alt={group.variants[0].organisation}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">{group.model_name}</span>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>{group.variants.length} provider{group.variants.length > 1 ? 's' : ''}</span>
                          {/* <span>•</span>
                          <span>
                            {formatPrice(Math.min(...group.variants.map(v => v.price_per_input_token)))}/1K in
                          </span>
                          <span>•</span>
                          <span>
                            {formatPrice(Math.min(...group.variants.map(v => v.price_per_output_token)))}/1K out
                          </span> */}
                        </div>
                      </div>
                    </div>
                    {group.variants.some(v => value === v.model_id) && (
                      <Check className="w-4 h-4 text-gray-600" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
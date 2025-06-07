export interface Model {
  model_name: string;
  model_id: string;
  provider_name: string;
  organisation: string;
  price_per_output_token: number;
  price_per_input_token: number;
  quantisation: "fp8" | "fp16" | null;
  context: number;
}

export interface ModelsResponse {
  data: Model[];
  error?: string;
}

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
}

export interface OpenAIModelsResponse {
  object: string;
  data: OpenAIModel[];
}

export type ProviderLogo = {
  name: string;
  path: string;
};

export type ModelsData = {
  [provider: string]: Model[];
};

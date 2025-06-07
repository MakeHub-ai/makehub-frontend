export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  user_id: string;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface ApiKeyResponse {
  data: ApiKey[];
  error?: string;
}

export interface CreateApiKeyResponse {
  data: ApiKey;
  error?: string;
}

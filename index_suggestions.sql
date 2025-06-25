-- Index to speed up filtering on requests for a user, status, and time period
CREATE INDEX IF NOT EXISTS idx_requests_user_status_createdat
  ON public.requests (user_id, status, created_at);

-- Index to speed up join from requests to models
CREATE INDEX IF NOT EXISTS idx_models_provider_modelid
  ON public.models (provider, model_id);

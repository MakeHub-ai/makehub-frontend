-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.api_keys (
  user_id uuid NOT NULL,
  api_key character varying NOT NULL UNIQUE,
  api_key_name character varying NOT NULL,
  last_used_at timestamp with time zone,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT fk_api_keys_user FOREIGN KEY (user_id) REFERENCES public.wallet(user_id)
);
CREATE TABLE public.debug_logs (
  payload jsonb,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  triggered_at timestamp without time zone DEFAULT now(),
  CONSTRAINT debug_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.metrics (
  request_id uuid NOT NULL,
  throughput_tokens_s double precision,
  total_duration_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  time_to_first_chunk integer,
  dt_first_last_chunk integer,
  is_metrics_calculated boolean,
  CONSTRAINT metrics_pkey PRIMARY KEY (request_id),
  CONSTRAINT fk_metrics_request FOREIGN KEY (request_id) REFERENCES public.requests(request_id)
);
CREATE TABLE public.models (
  api_key_name text,
  adapter USER-DEFINED DEFAULT 'openai'::adapter,
  provider character varying NOT NULL,
  window_size integer,
  context_window integer,
  quantisation character varying,
  support_tool_calling boolean DEFAULT false,
  price_per_input_token numeric NOT NULL DEFAULT 0.00,
  price_per_output_token numeric NOT NULL DEFAULT 0.00,
  extra_param jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  base_url text,
  model_id text NOT NULL,
  provider_model_id text NOT NULL,
  display_name text,
  max_output_token integer,
  support_input_cache boolean,
  support_vision boolean,
  price_per_input_token_cached numeric,
  tokenizer_name USER-DEFINED DEFAULT 'cl100k_base'::tokenizer_name,
  CONSTRAINT models_pkey PRIMARY KEY (model_id, provider)
);
CREATE TABLE public.requests (
  user_id uuid NOT NULL,
  transaction_id uuid,
  api_key_name character varying,
  provider character varying NOT NULL,
  model character varying NOT NULL,
  input_tokens integer,
  output_tokens integer,
  error_message text,
  request_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status USER-DEFINED NOT NULL DEFAULT 'pending'::request_status,
  streaming boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  cached_tokens integer,
  CONSTRAINT requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT fk_requests_model FOREIGN KEY (provider) REFERENCES public.models(provider),
  CONSTRAINT fk_requests_model FOREIGN KEY (provider) REFERENCES public.models(model_id),
  CONSTRAINT fk_requests_transaction FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT fk_requests_user FOREIGN KEY (user_id) REFERENCES public.wallet(user_id),
  CONSTRAINT fk_requests_model FOREIGN KEY (model) REFERENCES public.models(provider),
  CONSTRAINT fk_requests_model FOREIGN KEY (model) REFERENCES public.models(model_id)
);
CREATE TABLE public.requests_content (
  request_id uuid NOT NULL,
  request_json jsonb NOT NULL,
  response_json jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT requests_content_pkey PRIMARY KEY (request_id),
  CONSTRAINT fk_requests_content_request FOREIGN KEY (request_id) REFERENCES public.requests(request_id)
);
CREATE TABLE public.transactions (
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  type USER-DEFINED NOT NULL,
  request_id uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES public.wallet(user_id),
  CONSTRAINT fk_transactions_request FOREIGN KEY (request_id) REFERENCES public.requests(request_id)
);
CREATE TABLE public.wallet (
  user_id uuid NOT NULL,
  balance numeric NOT NULL DEFAULT 0.00,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallet_pkey PRIMARY KEY (user_id)
);

//Funnction get_user_stats :
BEGIN
    RETURN QUERY
    SELECT 
        w.balance,
        COUNT(r.request_id)::BIGINT as total_requests,
        COUNT(CASE WHEN r.status = 'completed' THEN 1 END)::BIGINT as successful_requests,
        COUNT(CASE WHEN r.status = 'error' THEN 1 END)::BIGINT as error_requests,
        SUM(COALESCE(r.input_tokens, 0) + COALESCE(r.output_tokens, 0))::BIGINT as total_tokens,
        AVG(m.latency_ms)::FLOAT as avg_latency_ms,
        MAX(r.timestamp) as last_request_at
    FROM wallet w
    LEFT JOIN requests r ON w.user_id = r.user_id
    LEFT JOIN metrics m ON r.request_id = m.request_id
    WHERE w.user_id = p_user_id
    GROUP BY w.user_id, w.balance;
END;
